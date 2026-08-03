import { SignJWT, jwtVerify } from 'jose';
import { createHash, randomBytes } from 'node:crypto';
import { config } from '../config.js';

const ALG = 'HS256';
const secret = new TextEncoder().encode(config.jwtSecret);

export interface AccessClaims {
  sub: string; // user id
  companyId: string;
  role: string;
}

const ACCESS_TTL = 15 * 60; // 15 minutes
const REFRESH_TTL = 7 * 24 * 60 * 60; // 7 days

export async function signAccessToken(claims: AccessClaims): Promise<string> {
  return new SignJWT({ companyId: claims.companyId, role: claims.role })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL}s`)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, secret, { algorithms: [ALG] });
  if (!payload.sub || !payload.companyId) throw new Error('malformed token');
  return {
    sub: payload.sub,
    companyId: String(payload.companyId),
    role: String(payload.role ?? 'owner'),
  };
}

export interface RefreshPair {
  token: string;
  hash: string;
  expiresAt: Date;
  familyId: string;
}

export function newRefreshPair(): RefreshPair {
  const token = randomBytes(32).toString('base64url');
  const familyId = randomBytes(16).toString('hex');
  return {
    token,
    hash: hashRefreshToken(token),
    expiresAt: new Date(Date.now() + REFRESH_TTL * 1000),
    familyId,
  };
}

export function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function refreshExpiryMs(): number {
  return REFRESH_TTL * 1000;
}
