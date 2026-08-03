import type { FastifyReply } from 'fastify';
import { config } from '../config.js';

export const ACCESS_COOKIE = '__Host-dw_access';
export const REFRESH_COOKIE = '__Host-dw_refresh';

const ACCESS_MAX_AGE = 15 * 60;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

function baseCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: config.isProduction,
    path: '/',
    maxAge,
  };
}

export function setAuthCookies(reply: FastifyReply, accessToken: string, refreshToken: string): void {
  reply.setCookie(ACCESS_COOKIE, accessToken, baseCookieOptions(ACCESS_MAX_AGE));
  reply.setCookie(REFRESH_COOKIE, refreshToken, baseCookieOptions(REFRESH_MAX_AGE));
}

export function clearAuthCookies(reply: FastifyReply): void {
  // __Host- cookies are Secure; a clearing Set-Cookie without the matching
  // attributes (esp. Secure + Path=/) is rejected by browsers, so the session
  // cookies would survive logout. Mirror the original attributes + maxAge 0.
  const opts = {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: config.isProduction,
    path: '/',
    maxAge: 0,
  };
  reply.setCookie(ACCESS_COOKIE, '', opts);
  reply.setCookie(REFRESH_COOKIE, '', opts);
}
