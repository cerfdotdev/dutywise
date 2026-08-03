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
  reply.clearCookie(ACCESS_COOKIE, { path: '/' });
  reply.clearCookie(REFRESH_COOKIE, { path: '/' });
}
