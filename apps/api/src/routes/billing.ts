import type { FastifyInstance } from 'fastify';
import { eq } from 'drizzle-orm';
import type { Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { listCompanyInvoices } from '../services/invoiceService.js';

export async function billingRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.get('/api/billing/summary', { preHandler: requireAuth }, async (req) => {
    const companyId = req.user!.companyId;
    const invoices = await listCompanyInvoices(db, companyId);

    const openTotal = invoices.filter((i) => i.status === 'open').reduce((s, i) => s + Number(i.total), 0);
    const paidTotal = invoices.filter((i) => i.status === 'paid').reduce((s, i) => s + Number(i.total), 0);

    const now = new Date();
    const currentMonthTotal = invoices
      .filter((i) => {
        const d = new Date(i.createdAt);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((s, i) => s + Number(i.total), 0);

    const monthly = new Map<string, number>();
    for (const inv of invoices) {
      const key = inv.createdAt.toISOString().slice(0, 7);
      monthly.set(key, (monthly.get(key) ?? 0) + Number(inv.total));
    }
    const monthlySeries = [...monthly.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6)
      .map(([month, total]) => ({ month, total: Math.round(total * 100) / 100 }));

    return { openTotal: round2(openTotal), paidTotal: round2(paidTotal), currentMonthTotal: round2(currentMonthTotal), monthlySeries };
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

void eq;
