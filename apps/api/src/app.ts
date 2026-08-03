import Fastify, { type FastifyInstance } from 'fastify';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import rateLimit from '@fastify/rate-limit';
import { ZodError } from 'zod';
import { config } from './config.js';
import { createDb, type Db } from './db/index.js';
import { AppError } from './lib/errors.js';
import { registerRoutes } from './routes/index.js';
import { seedDemo } from './db/seed.js';
import { migrateDb } from './db/migrate.js';

export interface BuildAppOptions {
  databaseUrl?: string;
  seedDemo?: boolean;
  runMigrations?: boolean;
  logger?: boolean;
}

export async function buildApp(opts: BuildAppOptions = {}): Promise<FastifyInstance> {
  const databaseUrl = opts.databaseUrl ?? config.databaseUrl;
  const db: Db = createDb(databaseUrl);

  if (opts.runMigrations ?? true) {
    await migrateDb(databaseUrl);
  }
  if (opts.seedDemo ?? config.seedDemo) {
    await seedDemo(db);
  }

  const app = Fastify({
    logger: opts.logger ?? true,
    trustProxy: true,
    bodyLimit: 5 * 1024 * 1024,
  });

  app.decorate('db', db);

  await app.register(helmet, { contentSecurityPolicy: false }); // web layer owns CSP
  await app.register(cookie);

  // Accept raw CSV bodies for the free refund-audit tool (POST /api/audits).
  app.addContentTypeParser('text/csv', { parseAs: 'string' }, (_req, body, done) => {
    try {
      done(null, String(body));
    } catch (err) {
      done(err as Error, undefined);
    }
  });
  await app.register(rateLimit, {
    global: true,
    max: 300,
    timeWindow: '1 minute',
    keyGenerator: (req) => (req.ip ?? 'unknown'),
  });

  // CSRF defense-in-depth: when an Origin header is present on mutating
  // requests, it must match the configured allowed origin (or the request host).
  app.addHook('onRequest', async (req, reply) => {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return;
    const origin = req.headers.origin;
    if (!origin) return;
    const allowed = config.allowedOrigin;
    if (allowed && origin !== allowed) {
      return reply.code(403).send({ error: { code: 'forbidden', message: 'Origin not allowed' } });
    }
  });

  app.setErrorHandler((err, _req, reply) => {
    if (err instanceof AppError) {
      return reply.code(err.statusCode).send({ error: { code: err.code, message: err.message } });
    }
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: { code: 'validation', message: err.issues[0]?.message ?? 'Invalid input' } });
    }
    const status = typeof err === 'object' && err !== null && 'statusCode' in err ? Number((err as { statusCode?: unknown }).statusCode) : 0;
    if (status && status < 500) {
      const code = typeof err === 'object' && err !== null && 'code' in err ? String((err as { code?: unknown }).code) : 'bad_request';
      return reply.code(status).send({ error: { code, message: err instanceof Error ? err.message : 'Bad request' } });
    }
    app.log.error(err);
    return reply.code(500).send({ error: { code: 'internal', message: 'Internal server error' } });
  });

  registerRoutes(app, db);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
  }
}
