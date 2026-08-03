import { describe, expect, it } from 'vitest';
import { getApp } from './helpers.js';

async function register(app: ReturnType<typeof getApp> extends Promise<infer T> ? T : never) {
  const res = await app.inject({
    method: 'POST',
    url: '/api/auth/register',
    payload: {
      companyName: 'Acme Trading Co',
      name: 'Alice Owner',
      email: 'alice@acme.example',
      password: 'correct-horse-battery',
    },
  });
  return res;
}

describe('auth', () => {
  it('registers a company + user and sets auth cookies', async () => {
    const app = await getApp();
    const res = await register(app);
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.user.email).toBe('alice@acme.example');
    expect(body.user.role).toBe('owner');
    expect(body.company.name).toBe('Acme Trading Co');
    const setCookies = res.headers['set-cookie'] as unknown as string[];
    expect(setCookies.some((c) => c.startsWith('__Host-dw_access='))).toBe(true);
    expect(setCookies.some((c) => c.startsWith('__Host-dw_refresh='))).toBe(true);
  });

  it('rejects duplicate email registration', async () => {
    const app = await getApp();
    await register(app);
    const res = await register(app);
    expect(res.statusCode).toBe(409);
  });

  it('logs in with valid credentials and returns /api/me', async () => {
    const app = await getApp();
    await register(app);

    const login = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'alice@acme.example', password: 'correct-horse-battery' },
    });
    expect(login.statusCode).toBe(200);

    const cookieHeader = login.headers['set-cookie'] as unknown as string[];
    const me = await app.inject({
      method: 'GET',
      url: '/api/me',
      headers: { cookie: cookieHeader.map((c) => c.split(';')[0]).join('; ') },
    });
    expect(me.statusCode).toBe(200);
    expect(me.json().user.email).toBe('alice@acme.example');
  });

  it('rejects wrong password', async () => {
    const app = await getApp();
    await register(app);
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'alice@acme.example', password: 'wrong-password' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('rotates refresh tokens and detects reuse (revokes family)', async () => {
    const app = await getApp();
    const reg = await register(app);
    const cookies = (reg.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');

    // First refresh — valid, rotates.
    const r1 = await app.inject({ method: 'POST', url: '/api/auth/refresh', headers: { cookie: cookies } });
    expect(r1.statusCode).toBe(200);
    const newCookies = (r1.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');

    // Reuse the OLD refresh cookie → reuse detected → 401 + family revoked.
    const r2 = await app.inject({ method: 'POST', url: '/api/auth/refresh', headers: { cookie: cookies } });
    expect(r2.statusCode).toBe(401);

    // Even the NEW (rotated) token is now dead because the family was revoked.
    const r3 = await app.inject({ method: 'POST', url: '/api/auth/refresh', headers: { cookie: newCookies } });
    expect(r3.statusCode).toBe(401);
  });

  it('logs out and revokes the refresh family', async () => {
    const app = await getApp();
    const reg = await register(app);
    const cookies = (reg.headers['set-cookie'] as unknown as string[]).map((c) => c.split(';')[0]).join('; ');

    const logout = await app.inject({ method: 'POST', url: '/api/auth/logout', headers: { cookie: cookies } });
    expect(logout.statusCode).toBe(204);

    const refresh = await app.inject({ method: 'POST', url: '/api/auth/refresh', headers: { cookie: cookies } });
    expect(refresh.statusCode).toBe(401);
  });
});
