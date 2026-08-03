import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { schema, type Db } from '../db/index.js';

const leadSchema = z.object({
  email: z.string().email().max(254),
  companyName: z.string().max(120).optional().nullable(),
});

export async function leadRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.post(
    '/api/leads',
    { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } },
    async (req, reply) => {
      const body = leadSchema.parse(req.body);
      const [lead] = await db
        .insert(schema.leads)
        .values({ email: body.email.toLowerCase(), companyName: body.companyName ?? null })
        .returning();
      if (!lead) throw new Error('lead insert failed');
      return reply.code(201).send({
        id: lead.id,
        email: lead.email,
        companyName: lead.companyName,
        createdAt: lead.createdAt,
      });
    },
  );
}
