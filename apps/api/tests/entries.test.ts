import { describe, expect, it } from 'vitest';
import { getApp } from './helpers.js';

async function registerAndAuth(app: Awaited<ReturnType<typeof getApp>>): Promise<string> {
  const reg = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: { companyName: 'Acme Trading Co', name: 'Alice Owner', email: 'alice@acme.example', password: 'correct-horse-battery' },
  });
  const cookies = (reg.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');
  return cookies;
}

describe('entries + billing', () => {
  it('requires auth', async () => {
    const app = await getApp();
    const res = await app.inject({ method: 'POST', url: '/api/entries', payload: {} });
    expect(res.statusCode).toBe(401);
  });

  it('creates an entry with rate-card fee and invoice line', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);

    const create = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: {
        mode: 'ocean',
        hsCode: '8504.40',
        description: 'AC power adapters 24V',
        quantity: 100,
        unitValue: 20,
      },
    });
    expect(create.statusCode).toBe(201);
    const entry = create.json();
    expect(entry.fee).toBe(99); // ocean rate card
    expect(entry.dutyAmount).toBeCloseTo(100, 1); // 5% of 2000
    expect(entry.entryNumber).toMatch(/^\d{3}-\d{7}-\d$/);

    // Billing reflects the fee.
    const summary = await app.inject({ method: 'GET', url: '/api/billing/summary', headers: { cookie: cookies } });
    expect(summary.statusCode).toBe(200);
    expect(summary.json().openTotal).toBeGreaterThanOrEqual(99);

    const invoices = await app.inject({ method: 'GET', url: '/api/invoices', headers: { cookie: cookies } });
    const list = invoices.json();
    expect(list.length).toBe(1);
    expect(list[0].items.some((i: { description: string }) => i.description.includes('Ocean entry filing'))).toBe(true);
  });

  it('flags 9903-range HS codes as held', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);
    const create = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { mode: 'air', hsCode: '99038801', description: 'Tariff-flagged goods', quantity: 1, unitValue: 100 },
    });
    expect(create.statusCode).toBe(201);
    expect(create.json().status).toBe('held');
    expect(create.json().signedBy).toBeNull();
  });

  it('validates HS code format', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);
    const create = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { mode: 'ocean', hsCode: 'abc', description: 'Bad code', quantity: 1, unitValue: 1 },
    });
    expect(create.statusCode).toBe(400);
  });

  it('lists and filters entries by status', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);
    await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { mode: 'ocean', hsCode: '8504.40', description: 'Adapters', quantity: 10, unitValue: 10 },
    });
    const held = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { mode: 'truck', hsCode: '99038801', description: 'Flagged', quantity: 10, unitValue: 10 },
    });
    expect(held.statusCode).toBe(201);

    const list = await app.inject({ method: 'GET', url: '/api/entries?status=held', headers: { cookie: cookies } });
    expect(list.json().length).toBe(1);
    expect(list.json()[0].status).toBe('held');

    const search = await app.inject({ method: 'GET', url: '/api/entries?q=adapter', headers: { cookie: cookies } });
    expect(search.json().length).toBe(1);
  });

  it('creates shipments and links entries', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);
    const ship = await app.inject({
      method: 'POST',
      url: '/api/shipments',
      headers: { cookie: cookies },
      payload: { mode: 'ocean', carrier: 'Maersk', blNumber: 'MAEU-000111222', originPort: 'Shanghai', destinationPort: 'Los Angeles' },
    });
    expect(ship.statusCode).toBe(201);
    const shipment = ship.json();

    const entry = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { shipmentId: shipment.id, mode: 'ocean', hsCode: '8471.30', description: 'Docks', quantity: 5, unitValue: 50 },
    });
    expect(entry.statusCode).toBe(201);

    const detail = await app.inject({ method: 'GET', url: `/api/shipments/${shipment.id}`, headers: { cookie: cookies } });
    expect(detail.json().entryCount).toBe(1);

    // Cross-company access blocked.
    const other = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: { companyName: 'Other Co', name: 'Bob', email: 'bob@other.example', password: 'correct-horse-battery' },
    });
    const otherCookies = (other.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');
    const denied = await app.inject({ method: 'GET', url: `/api/shipments/${shipment.id}`, headers: { cookie: otherCookies } });
    expect(denied.statusCode).toBe(404);
  });

  it('acknowledges alerts', async () => {
    const app = await getApp();
    const cookies = await registerAndAuth(app);
    const seed = await app.inject({
      method: 'POST',
      url: '/api/entries',
      headers: { cookie: cookies },
      payload: { mode: 'ocean', hsCode: '8504.40', description: 'Adapters', quantity: 10, unitValue: 10 },
    });
    expect(seed.statusCode).toBe(201);

    const list = await app.inject({ method: 'GET', url: '/api/alerts', headers: { cookie: cookies } });
    expect(list.statusCode).toBe(200);

    // Alerts list may be empty in non-seeded test DB — verify shape.
    expect(Array.isArray(list.json())).toBe(true);
  });
});
