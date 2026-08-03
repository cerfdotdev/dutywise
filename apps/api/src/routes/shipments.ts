import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { and, eq, count } from 'drizzle-orm';
import { schema, type Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { AppError } from '../lib/errors.js';

const createSchema = z.object({
  mode: z.enum(['ocean', 'air', 'truck']),
  carrier: z.string().min(2).max(120),
  blNumber: z.string().min(3).max(120),
  originPort: z.string().max(120).optional().nullable(),
  destinationPort: z.string().max(120).optional().nullable(),
  eta: z.string().date().optional().nullable(),
});

const statusEnum = ['draft', 'booked', 'in_transit', 'cleared', 'delayed', 'cancelled'] as const;

export async function shipmentRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.post('/api/shipments', { preHandler: requireAuth }, async (req, reply) => {
    const body = createSchema.parse(req.body);
    const companyId = req.user!.companyId;
    const [shipment] = await db
      .insert(schema.shipments)
      .values({
        companyId,
        mode: body.mode,
        carrier: body.carrier,
        blNumber: body.blNumber,
        originPort: body.originPort ?? null,
        destinationPort: body.destinationPort ?? null,
        eta: body.eta ?? null,
        status: 'booked',
      })
      .returning();
    if (!shipment) throw new AppError(500, 'internal', 'shipment creation failed');
    return reply.code(201).send(serializeShipment(shipment, 0));
  });

  app.get('/api/shipments', { preHandler: requireAuth }, async (req) => {
    const companyId = req.user!.companyId;
    const status = (req.query as { status?: string }).status;
    const statusValid = status && (statusEnum as readonly string[]).includes(status);

    const rows = await db.query.shipments.findMany({
      where: statusValid ? and(eq(schema.shipments.companyId, companyId), eq(schema.shipments.status, status as never)) : eq(schema.shipments.companyId, companyId),
      orderBy: (s, { desc }) => [desc(s.createdAt)],
    });

    const withCounts = await Promise.all(
      rows.map(async (s) => {
        const [row] = await db
          .select({ value: count() })
          .from(schema.entries)
          .where(eq(schema.entries.shipmentId, s.id));
        return serializeShipment(s, Number(row?.value ?? 0));
      }),
    );
    return withCounts;
  });

  app.get('/api/shipments/:id', { preHandler: requireAuth }, async (req) => {
    const { id } = req.params as { id: string };
    const shipment = await db.query.shipments.findFirst({
      where: (s, { and: a, eq: e }) => a(e(s.id, id), e(s.companyId, req.user!.companyId)),
    });
    if (!shipment) throw new AppError(404, 'not_found', 'Shipment not found');
    const [row] = await db.select({ value: count() }).from(schema.entries).where(eq(schema.entries.shipmentId, shipment.id));
    return serializeShipment(shipment, Number(row?.value ?? 0));
  });
}

function serializeShipment(s: { id: string; mode: string; carrier: string; blNumber: string; originPort: string | null; destinationPort: string | null; eta: string | null; status: string; createdAt: Date }, entryCount: number) {
  return {
    id: s.id,
    mode: s.mode,
    carrier: s.carrier,
    blNumber: s.blNumber,
    originPort: s.originPort,
    destinationPort: s.destinationPort,
    eta: s.eta,
    status: s.status,
    entryCount,
    createdAt: s.createdAt,
  };
}
