import type { FastifyInstance } from 'fastify';
import type { Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { AppError } from '../lib/errors.js';
import { listCompanyInvoices } from '../services/invoiceService.js';

export async function invoiceRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.get('/api/invoices', { preHandler: requireAuth }, async (req) => {
    const invoices = await listCompanyInvoices(db, req.user!.companyId);
    return invoices.map(serializeInvoice);
  });

  app.get('/api/invoices/:id', { preHandler: requireAuth }, async (req) => {
    const { id } = req.params as { id: string };
    const invoice = await db.query.invoices.findFirst({
      where: (i, { and: a, eq: e }) => a(e(i.id, id), e(i.companyId, req.user!.companyId)),
    });
    if (!invoice) throw new AppError(404, 'not_found', 'Invoice not found');
    const items = await db.query.invoiceItems.findMany({ where: (t, { eq }) => eq(t.invoiceId, invoice.id) });
    return serializeInvoice({ ...invoice, items });
  });
}

function serializeInvoice(i: {
  id: string;
  number: string;
  total: string;
  status: string;
  createdAt: Date;
  items: Array<{ description: string; amount: string }>;
}) {
  return {
    id: i.id,
    number: i.number,
    total: Number(i.total),
    status: i.status,
    items: i.items.map((t) => ({ description: t.description, amount: Number(t.amount) })),
    createdAt: i.createdAt,
  };
}

