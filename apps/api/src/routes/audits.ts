import type { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { schema, type Db } from '../db/index.js';
import { runRefundScreen, parseAuditCsv, type AuditInputEntry } from '../services/refundEngine.js';
import { AppError, badRequest } from '../lib/errors.js';

const MAX_ENTRIES = 5000;

const auditJsonSchema = z.object({
  email: z.string().email().max(254),
  companyName: z.string().max(120).optional().nullable(),
  entries: z
    .array(
      z.object({
        entryNumber: z.string().min(3).max(30),
        amountPaid: z.number().nonnegative().optional().nullable(),
      }),
    )
    .min(1)
    .max(MAX_ENTRIES),
});

export async function auditRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.post('/api/audits', { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } }, async (req, reply) => {
    const contentType = String(req.headers['content-type'] ?? '');
    let email: string;
    let entries: AuditInputEntry[];

    if (contentType.includes('text/csv')) {
      const csv = String(req.body ?? '');
      email = String(req.headers['x-audit-email'] ?? '').toLowerCase();
      if (!email || !z.string().email().safeParse(email).success) {
        throw badRequest('Email header x-audit-email is required for CSV uploads');
      }
      entries = parseAuditCsv(csv);
    } else {
      const body = auditJsonSchema.parse(req.body);
      email = body.email.toLowerCase();
      entries = body.entries;
    }

    if (entries.length === 0) throw badRequest('No entries found in upload');
    if (entries.length > MAX_ENTRIES) throw badRequest(`Maximum ${MAX_ENTRIES} entries per audit`);

    const result = runRefundScreen(entries);

    const [audit] = await db
      .insert(schema.refundAudits)
      .values({
        email,
        companyName: null,
        status: 'completed',
        totalEstimate: String(result.totalEstimate),
        interestEstimate: String(result.interestEstimate),
        eligibleCount: result.eligibleCount,
        summary: result.summary,
        disclaimer: result.disclaimer,
      })
      .returning();
    if (!audit) throw new AppError(500, 'internal', 'audit creation failed');

    await db.insert(schema.refundAuditItems).values(
      result.items.map((i) => ({
        auditId: audit.id,
        entryNumber: i.entryNumber,
        eligible: i.eligible,
        estimate: String(i.estimate),
        reason: i.reason,
      })),
    );

    return reply.code(201).send({ auditId: audit.id });
  });

  app.get('/api/audits/sample', async (_req, reply) => {
    const demo = await db.query.refundAudits.findFirst({
      where: (a, { eq }) => eq(a.email, 'demo@dutywise.app'),
      orderBy: (a, { desc }) => [desc(a.createdAt)],
    });
    if (!demo) return reply.code(404).send({ error: { code: 'not_found', message: 'Sample audit not available yet' } });
    const items = await db.query.refundAuditItems.findMany({ where: (t, { eq }) => eq(t.auditId, demo.id) });
    return reply.send(serializeAudit(demo, items));
  });

  app.get('/api/audits/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    if (!isUuid(id)) return reply.code(404).send({ error: { code: 'not_found', message: 'Audit not found' } });
    const audit = await db.query.refundAudits.findFirst({ where: (a, { eq }) => eq(a.id, id) });
    if (!audit) return reply.code(404).send({ error: { code: 'not_found', message: 'Audit not found' } });
    const items = await db.query.refundAuditItems.findMany({ where: (t, { eq }) => eq(t.auditId, audit.id) });
    return reply.send(serializeAudit(audit, items));
  });
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

function serializeAudit(
  audit: { id: string; status: string; totalEstimate: string; interestEstimate: string; eligibleCount: number; summary: string; disclaimer: string; createdAt: Date },
  items: Array<{ entryNumber: string; eligible: boolean; estimate: string; reason: string }>,
) {
  return {
    id: audit.id,
    status: audit.status,
    totalEstimate: Number(audit.totalEstimate),
    interestEstimate: Number(audit.interestEstimate),
    eligibleCount: audit.eligibleCount,
    entries: items.map((i) => ({ entryNumber: i.entryNumber, eligible: i.eligible, estimate: Number(i.estimate), reason: i.reason })),
    summary: audit.summary,
    disclaimer: audit.disclaimer,
    createdAt: audit.createdAt,
  };
}
