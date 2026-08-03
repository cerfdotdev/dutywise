import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  SEED_DEMO: z.coerce.boolean().default(true),
  SANDBOX_MODE: z.coerce.boolean().default(true),
  ALLOWED_ORIGIN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // no-console policy: startup logging
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  nodeEnv: parsed.data.NODE_ENV,
  port: parsed.data.PORT,
  databaseUrl: parsed.data.DATABASE_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  seedDemo: parsed.data.SEED_DEMO,
  sandboxMode: parsed.data.SANDBOX_MODE,
  allowedOrigin: parsed.data.ALLOWED_ORIGIN,
  isProduction: parsed.data.NODE_ENV === 'production',
} as const;

export type Config = typeof config;
