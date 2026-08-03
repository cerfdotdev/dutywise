import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema.js';

export type Db = ReturnType<typeof drizzle<typeof schema>>;

export function createDb(databaseUrl: string): Db {
  const client = postgres(databaseUrl, {
    prepare: false, // required behind proxies/poolers (Pgbouncer-style)
    max: 10,
    idle_timeout: 30,
  });
  return drizzle(client, { schema });
}

export { schema };
