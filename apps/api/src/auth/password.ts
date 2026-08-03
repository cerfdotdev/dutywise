import argon2 from 'argon2';

const ARGON2_OPTIONS = {
  type: 2 as 0 | 1 | 2, // argon2id
  memoryCost: 19456, // 19 MiB — OWASP recommended
  timeCost: 2,
  parallelism: 1,
};

export function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

export function verifyPassword(hash: string, plain: string): Promise<boolean> {
  return argon2.verify(hash, plain);
}
