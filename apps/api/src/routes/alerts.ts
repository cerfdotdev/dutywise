import type { FastifyInstance } from 'fastify';
import { and, eq } from 'drizzle-orm';
import { schema, type Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { AppError } from '../lib/errors.js';

const statusEnum = ['open', 'acknowledged', 'resolved'] as const;

export async function alertRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.get('/api/alerts', { preHandler: requireAuth }, async (req) => {
    const companyId = req.user!.companyId;
    const status = (req.query as { status?: string }).status;
    const statusValid = status && (statusEnum as readonly string[]).includes(status);

    const rows = await db.query.alerts.findMany({
      where: statusValid ? and(eq(schema.alerts.companyId, companyId), eq(schema.alerts.status, status as never)) : eq(schema.alerts.companyId, companyId),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    });
    return rows.map(serializeAlert);
  });

  app.post('/api/alerts/:id/ack', { preHandler: requireAuth }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const result = await db
      .update(schema.alerts)
      .set({ status: 'acknowledged' })
      .where(and(eq(schema.alerts.id, id), eq(schema.alerts.companyId, req.user!.companyId)))
      .returning();
    if (result.length === 0) throw new AppError(404, 'not_found', 'Alert not found');
    return reply.code(204).send();
  });
}

function serializeAlert(a: { id: string; type: string; severity: string; title: string; message: string; status: string; createdAt: Date }) {
  return { id: a.id, type: a.type, severity: a.severity, title: a.title, message: a.message, status: a.status, createdAt: a.createdAt };
}
