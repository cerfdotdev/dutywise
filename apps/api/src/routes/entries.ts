import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { type SQL } from 'drizzle-orm';
import { schema, type Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { AppError, badRequest } from '../lib/errors.js';
import { feeForEntry, estimateDuty } from '../services/pricing.js';
import { appendInvoiceLine } from '../services/invoiceService.js';

const createSchema = z.object({
  shipmentId: z.string().uuid().optional().nullable(),
  mode: z.enum(['ocean', 'air', 'truck']).default('ocean'),
  hsCode: z.string().regex(/^[\d.]{6,11}$/, 'HS code must be 6–10 digits').transform((s) => s.replace(/\./g, '')),
  description: z.string().min(3).max(255),
  quantity: z.number().positive(),
  unitValue: z.number().positive(),
  countryOfOrigin: z.string().max(2).optional().nullable(),
});

const statusEnum = ['processing', 'review', 'filed', 'accepted', 'released', 'held', 'cancelled'] as const;
type EntryStatus = (typeof statusEnum)[number];

export async function entryRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.post('/api/entries', { preHandler: requireAuth }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const companyId = req.user!.companyId;

    if (body.shipmentId) {
      const shipment = await db.query.shipments.findFirst({
        where: (s, { and: a, eq: e }) => a(e(s.id, body.shipmentId as string), e(s.companyId, companyId)),
      });
      if (!shipment) throw badRequest('Shipment not found for this company');
    }

    const duty = estimateDuty(body.quantity, body.unitValue);
    const fee = feeForEntry(body.mode);
    const entryNumber = generateEntryNumber();
    // Sandbox realism: HS codes in the 9903 range (tariff overlap) start "held".
    const status = body.hsCode.startsWith('9903') ? 'held' : 'processing';
    const signedBy = status === 'held' ? null : 'DutyWise Licensed Broker · Sandbox';

    const [entry] = await db
      .insert(schema.entries)
      .values({
        companyId,
        shipmentId: body.shipmentId ?? null,
        entryNumber,
        status,
        mode: body.mode,
        hsCode: body.hsCode,
        description: body.description,
        quantity: String(body.quantity),
        unitValue: String(body.unitValue),
        dutyAmount: String(duty),
        fee: String(fee),
        signedBy,
      })
      .returning();
    if (!entry) throw new AppError(500, 'internal', 'entry creation failed');

    await appendInvoiceLine(db, companyId, `${modeLabel(body.mode)} entry filing · ${entryNumber}`, fee);

    return reply.code(201).send(serializeEntry(entry));
  });

  app.get('/api/entries', { preHandler: requireAuth }, async (req) => {
    const companyId = req.user!.companyId;
    const { status, q } = req.query as { status?: string; q?: string };
    const statusValid = status && (statusEnum as readonly string[]).includes(status);
    const search = q && q.trim().length > 0 ? `%${q.trim()}%` : null;

    const rows = await db.query.entries.findMany({
      where: (e, { and, eq: eq2, or, ilike }) => {
        const conds: SQL[] = [eq2(e.companyId, companyId)];
        if (statusValid) conds.push(eq2(e.status, status as EntryStatus));
        if (search) conds.push(or(ilike(e.entryNumber, search), ilike(e.description, search), ilike(e.hsCode, search)) as SQL);
        return and(...conds);
      },
      orderBy: (e, { desc }) => [desc(e.createdAt)],
    });
    return rows.map(serializeEntry);
  });

  app.get('/api/entries/:id', { preHandler: requireAuth }, async (req) => {
    const { id } = req.params as { id: string };
    const entry = await db.query.entries.findFirst({
      where: (e, { and: a, eq: e2 }) => a(e2(e.id, id), e2(e.companyId, req.user!.companyId)),
    });
    if (!entry) throw new AppError(404, 'not_found', 'Entry not found');
    return serializeEntry(entry);
  });
}

function modeLabel(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

function generateEntryNumber(): string {
  const importer = String(Math.floor(100 + Math.random() * 900));
  const serial = String(Math.floor(1000000 + Math.random() * 9000000));
  const check = Math.floor(Math.random() * 10);
  return `${importer}-${serial}-${check}`;
}

function serializeEntry(e: {
  id: string;
  entryNumber: string;
  status: string;
  mode: string;
  hsCode: string;
  description: string;
  quantity: string;
  unitValue: string;
  dutyAmount: string;
  fee: string;
  signedBy: string | null;
  createdAt: Date;
}) {
  return {
    id: e.id,
    entryNumber: e.entryNumber,
    status: e.status,
    mode: e.mode,
    hsCode: e.hsCode,
    description: e.description,
    quantity: Number(e.quantity),
    unitValue: Number(e.unitValue),
    dutyAmount: Number(e.dutyAmount),
    fee: Number(e.fee),
    signedBy: e.signedBy,
    createdAt: e.createdAt,
  };
}

