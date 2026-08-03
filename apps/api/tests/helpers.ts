import { afterAll, beforeAll, beforeEach } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../src/app.js';
import { createDb } from '../src/db/index.js';
import { sql } from 'drizzle-orm';

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5433/dutywise_test';

let app: FastifyInstance;

export async function getApp(): Promise<FastifyInstance> {
  if (!app) {
    app = await buildApp({ databaseUrl: TEST_DATABASE_URL, seedDemo: false, runMigrations: false, logger: false });
  }
  return app;
}

const TABLES = [
  'refund_audit_items',
  'refund_audits',
  'invoice_items',
  'invoices',
  'alerts',
  'entries',
  'shipments',
  'refresh_tokens',
  'leads',
  'users',
  'companies',
];

export async function truncateAll(): Promise<void> {
  const db = createDb(TEST_DATABASE_URL);
  await db.execute(sql`TRUNCATE ${sql.raw(TABLES.join(', '))} RESTART IDENTITY CASCADE`);
  await db.$client.end();
}

beforeAll(async () => {
  await getApp();
});

afterAll(async () => {
  if (app) {
    await app.close();
    app = undefined as never;
  }
});

beforeEach(async () => {
  await truncateAll();
});
