import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schema, type Db } from '../db/index.js';
import { hashPassword, verifyPassword } from '../auth/password.js';
import { signAccessToken, newRefreshPair } from '../auth/tokens.js';
import { setAuthCookies, clearAuthCookies, ACCESS_COOKIE, REFRESH_COOKIE } from '../auth/cookies.js';
import { rotateRefresh, revokeRefreshFamily } from '../auth/guards.js';
import { AppError, conflict, badRequest } from '../lib/errors.js';

const registerSchema = z.object({
  companyName: z.string().min(2).max(120),
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function authRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  const authRateLimit = { max: 10, timeWindow: '1 minute' } as const;

  app.post('/api/auth/register', { config: { rateLimit: authRateLimit } }, async (req, reply) => {
    const body = registerSchema.parse(req.body);

    const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, body.email) });
    if (existing) throw conflict('Email already registered');

    const [company] = await db.insert(schema.companies).values({ name: body.companyName }).returning();
    if (!company) throw new AppError(500, 'internal', 'failed to create company');

    const [user] = await db
      .insert(schema.users)
      .values({
        companyId: company.id,
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        role: 'owner',
      })
      .returning();
    if (!user) throw new AppError(500, 'internal', 'failed to create user');

    const pair = newRefreshPair();
    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      familyId: pair.familyId,
      tokenHash: pair.hash,
      expiresAt: pair.expiresAt,
    });

    const accessToken = await signAccessToken({ sub: user.id, companyId: company.id, role: user.role });
    setAuthCookies(reply, accessToken, pair.token);

    return reply.code(201).send({ user: publicUser(user), company: { id: company.id, name: company.name } });
  });

  app.post('/api/auth/login', { config: { rateLimit: authRateLimit } }, async (req, reply) => {
    const body = loginSchema.parse(req.body);

    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, body.email.toLowerCase()) });
    if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
      throw new AppError(401, 'invalid_credentials', 'Invalid email or password');
    }

    const pair = newRefreshPair();
    await db.insert(schema.refreshTokens).values({
      userId: user.id,
      familyId: pair.familyId,
      tokenHash: pair.hash,
      expiresAt: pair.expiresAt,
    });

    const accessToken = await signAccessToken({ sub: user.id, companyId: user.companyId, role: user.role });
    setAuthCookies(reply, accessToken, pair.token);

    const company = await db.query.companies.findFirst({ where: (c, { eq }) => eq(c.id, user.companyId) });
    return reply.send({ user: publicUser(user), company: company ? { id: company.id, name: company.name } : null });
  });

  app.post('/api/auth/refresh', { config: { rateLimit: authRateLimit } }, async (req, reply) => {
    const session = await rotateRefresh(req, reply, db);
    if (!session) {
      throw new AppError(401, 'invalid_refresh', 'Session expired — please sign in again');
    }
    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, session.userId) });
    const company = user ? await db.query.companies.findFirst({ where: (c, { eq }) => eq(c.id, user.companyId) }) : null;
    if (!user || !company) throw new AppError(401, 'invalid_refresh', 'Session expired');

    setAuthCookies(reply, session.accessToken, session.refreshToken);
    return reply.send({ user: publicUser(user), company: { id: company.id, name: company.name } });
  });

  app.post('/api/auth/logout', async (req, reply) => {
    const refresh = req.cookies[REFRESH_COOKIE];
    if (refresh) {
      // Revoke the presented token's family (best-effort).
      const { hashRefreshToken } = await import('../auth/tokens.js');
      const row = await db.query.refreshTokens.findFirst({
        where: (t, { eq }) => eq(t.tokenHash, hashRefreshToken(refresh)),
      });
      if (row) await revokeRefreshFamily(row.familyId, db);
    }
    clearAuthCookies(reply);
    return reply.code(204).send();
  });

  void ACCESS_COOKIE;
  void badRequest;
}

function publicUser(user: { id: string; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
