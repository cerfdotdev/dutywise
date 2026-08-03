import { migrateDb } from '../src/db/migrate.js';

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgres://postgres:postgres@localhost:5433/dutywise_test';

// Runs once in the main process before any test worker starts.
export default async function setup(): Promise<void> {
  await migrateDb(TEST_DATABASE_URL);
}
