import { describe, expect, it } from 'vitest';
import { getApp } from './helpers.js';

describe('refund audits', () => {
  it('screens entries from JSON and returns a report', async () => {
    const app = await getApp();
    const create = await app.inject({
      method: 'POST',
      url: '/api/audits',
      payload: {
        email: 'buyer@example.com',
        entries: [
          { entryNumber: '123-7001123-1', amountPaid: 1000 },
          { entryNumber: '999-1112223-4', amountPaid: 500 },
          { entryNumber: 'bad-entry', amountPaid: 100 },
          { entryNumber: '777-8889990-2' },
        ],
      },
    });
    expect(create.statusCode).toBe(201);
    const { auditId } = create.json();
    expect(auditId).toBeTruthy();

    const report = await app.inject({ method: 'GET', url: `/api/audits/${auditId}` });
    expect(report.statusCode).toBe(200);
    const body = report.json();
    expect(body.eligibleCount).toBe(2);
    expect(body.totalEstimate).toBeCloseTo(225, 1); // 15% of 1000 + 15% of 500
    expect(body.interestEstimate).toBeGreaterThan(0);
    expect(body.entries).toHaveLength(4);
    expect(body.entries[0].eligible).toBe(true);
    expect(body.entries[2].eligible).toBe(false);
    expect(body.entries[3].eligible).toBe(false);
    expect(body.summary).toContain('We file, CBP pays');
    expect(body.disclaimer.toLowerCase()).toContain('not a claim');
  });

  it('parses CSV uploads (entry_number,amount_paid)', async () => {
    const app = await getApp();
    const csv = ['entry_number,amount_paid', '123-7001123-1,2000', '999-1112223-4,750', '', '123-0000000-0,'].join('\n');
    const create = await app.inject({
      method: 'POST',
      url: '/api/audits',
      headers: { 'content-type': 'text/csv', 'x-audit-email': 'csv@example.com' },
      payload: csv,
    });
    expect(create.statusCode).toBe(201);
    const { auditId } = create.json();
    const report = await app.inject({ method: 'GET', url: `/api/audits/${auditId}` });
    const body = report.json();
    expect(body.entries).toHaveLength(3);
    expect(body.entries[0].estimate).toBeCloseTo(300, 1);
    expect(body.entries[2].estimate).toBe(0); // no amount paid
  });

  it('rejects empty audits and oversized batches', async () => {
    const app = await getApp();
    const empty = await app.inject({
      method: 'POST',
      url: '/api/audits',
      payload: { email: 'a@b.example', entries: [] },
    });
    expect(empty.statusCode).toBe(400);

    const big = await app.inject({
      method: 'POST',
      url: '/api/audits',
      payload: { email: 'a@b.example', entries: Array.from({ length: 5001 }, (_, i) => ({ entryNumber: `123-${String(7000000 + i).padStart(7, '0')}-1` })) },
    });
    expect(big.statusCode).toBe(400);
  });

  it('returns 404 for unknown audits', async () => {
    const app = await getApp();
    const res = await app.inject({ method: 'GET', url: '/api/audits/00000000-0000-0000-0000-000000000000' });
    expect(res.statusCode).toBe(404);
  });
});
