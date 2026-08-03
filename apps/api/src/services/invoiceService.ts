import { and, eq, gte } from 'drizzle-orm';
import { schema, type Db } from '../db/index.js';

/**
 * One open invoice per company per month; entry fees and add-ons are
 * appended as line items. Numbering: DW-YYYYMM-NNNN.
 */
export async function appendInvoiceLine(db: Db, companyId: string, description: string, amount: number): Promise<{ invoiceId: string; number: string }> {
  const now = new Date();
  const prefix = `DW-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  // Current month's open invoice (if any).
  const candidates = await db
    .select()
    .from(schema.invoices)
    .where(and(eq(schema.invoices.companyId, companyId), eq(schema.invoices.status, 'open'), gte(schema.invoices.createdAt, monthStart)));
  let invoice = candidates.find((c) => c.createdAt < nextMonth) ?? null;

  if (!invoice) {
    const [created] = await db
      .insert(schema.invoices)
      .values({ companyId, number: `${prefix}-0001`, total: '0', status: 'open' })
      .returning();
    invoice = created ?? null;
  }
  if (!invoice) throw new Error('invoice creation failed');

  await db.insert(schema.invoiceItems).values({ invoiceId: invoice.id, description, amount: String(amount) });

  const currentTotal = Number(invoice.total) + amount;
  await db
    .update(schema.invoices)
    .set({ total: String(Math.round(currentTotal * 100) / 100) })
    .where(eq(schema.invoices.id, invoice.id));

  return { invoiceId: invoice.id, number: invoice.number };
}

export async function findOpenInvoiceByCompany(db: Db, companyId: string): Promise<{ id: string } | null> {
  const row = await db.query.invoices.findFirst({
    where: (i, { and: a, eq: e }) => a(e(i.companyId, companyId), e(i.status, 'open')),
  });
  return row ? { id: row.id } : null;
}

export async function listCompanyInvoices(db: Db, companyId: string) {
  const rows = await db.query.invoices.findMany({
    where: (i, { eq }) => eq(i.companyId, companyId),
    orderBy: (i, { desc }) => [desc(i.createdAt)],
  });
  const withItems = await Promise.all(
    rows.map(async (inv) => {
      const items = await db.query.invoiceItems.findMany({ where: (t, { eq }) => eq(t.invoiceId, inv.id) });
      return { ...inv, items };
    }),
  );
  return withItems;
}
