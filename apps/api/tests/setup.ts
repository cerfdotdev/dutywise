// Test environment bootstrap — runs before any test module imports config.ts.
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5433/dutywise_test';
process.env.JWT_SECRET = 'test-secret-that-is-long-enough-32-chars-min';
process.env.SEED_DEMO = 'false';
process.env.SANDBOX_MODE = 'true';
