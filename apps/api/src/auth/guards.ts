import type { FastifyReply, FastifyRequest } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { verifyAccessToken, signAccessToken, newRefreshPair, hashRefreshToken } from './tokens.js';
import { schema, type Db } from '../db/index.js';

export interface AuthUser {
  userId: string;
  companyId: string;
  role: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function requireAuth(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const token = req.cookies['__Host-dw_access'];
  if (!token) {
    return reply.code(401).send({ error: { code: 'unauthorized', message: 'Authentication required' } });
  }
  try {
    const claims = await verifyAccessToken(token);
    req.user = { userId: claims.sub, companyId: claims.companyId, role: claims.role };
  } catch {
    return reply.code(401).send({ error: { code: 'unauthorized', message: 'Invalid or expired session' } });
  }
}

export interface RotatedSession {
  userId: string;
  companyId: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

/**
 * Refresh-token rotation with reuse detection (OWASP §4.12 / Auth0 pattern):
 * - Valid, unrevoked refresh token → rotate (revoke old, issue new in same family).
 * - Already-revoked token → reuse detected → revoke the entire family + 401.
 */
export async function rotateRefresh(req: FastifyRequest, reply: FastifyReply, db: Db): Promise<RotatedSession | null> {
  const token = req.cookies['__Host-dw_refresh'];
  if (!token) return null;

  const tokenHash = hashRefreshToken(token);
  const row = await db.query.refreshTokens.findFirst({ where: (t, { eq }) => eq(t.tokenHash, tokenHash) });

  if (!row) return null;

  if (row.revokedAt || row.expiresAt < new Date()) {
    // Reuse or expiry: if revoked → reuse detected → revoke family.
    if (row.revokedAt) {
      await db
        .update(schema.refreshTokens)
        .set({ revokedAt: new Date() })
        .where(eq(schema.refreshTokens.familyId, row.familyId));
      reply.clearCookie('__Host-dw_access', { path: '/' });
      reply.clearCookie('__Host-dw_refresh', { path: '/' });
    }
    return null;
  }

  const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, row.userId) });
  if (!user) return null;

  // Rotate: revoke current, issue successor in the same family.
  await db.update(schema.refreshTokens).set({ revokedAt: new Date() }).where(eq(schema.refreshTokens.id, row.id));

  const pair = newRefreshPair();
  await db.insert(schema.refreshTokens).values({
    userId: user.id,
    familyId: row.familyId,
    tokenHash: pair.hash,
    expiresAt: pair.expiresAt,
  });

  const accessToken = await signAccessToken({ sub: user.id, companyId: user.companyId, role: user.role });
  return { userId: user.id, companyId: user.companyId, role: user.role, accessToken, refreshToken: pair.token };
}

export async function revokeRefreshFamily(familyId: string, db: Db): Promise<void> {
  await db
    .update(schema.refreshTokens)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.refreshTokens.familyId, familyId)));
}
