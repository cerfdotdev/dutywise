import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'node:url';

const LOCK_KEY = 7_242_001;

/**
 * Applies pending Drizzle migrations with a Postgres advisory lock so
 * concurrent replicas never race. Safe to call from the app boot path
 * (single-replica Dokploy deploy) or as a one-shot job.
 */
export async function migrateDb(databaseUrl: string): Promise<void> {
  const client = postgres(databaseUrl, { prepare: false, max: 1 });
  const db = drizzle(client);

  const [locked] = await client<[{ locked: boolean }]>`SELECT pg_try_advisory_lock(${LOCK_KEY}) AS locked`;
  if (!locked?.locked) {
    await client.end();
    throw new Error('Another migration is already running.');
  }

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
  } finally {
    await client`SELECT pg_advisory_unlock(${LOCK_KEY})`;
    await client.end();
  }
}

// Standalone execution: tsx src/db/migrate.ts
// NOTE: in the tsup bundle argv[1] is index.js, so this only fires when run directly.
const isMain = !!process.argv[1] && /migrate\.(ts|js)$/.test(process.argv[1]);
if (isMain) {
  const { config } = await import('../config.js');
  migrateDb(config.databaseUrl)
    .then(() => {
      console.log('Migrations applied.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}
