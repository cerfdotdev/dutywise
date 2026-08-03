import { createDb } from './index.js';
import { hashPassword } from '../auth/password.js';
import { config } from '../config.js';
import { migrateDb } from './migrate.js';

/**
 * Demo seed (SEED_DEMO=true). Idempotent: exits early if the demo user exists.
 * Demo credentials: demo@dutywise.app / demo-pass-1234
 */
export async function seedDemo(db: ReturnType<typeof createDb>): Promise<boolean> {
  const existing = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.email, 'demo@dutywise.app') });
  if (existing) return false;

  const [company] = await db.insert(schema.companies).values({ name: 'Demo Imports Inc' }).returning();
  if (!company) throw new Error('seed failed: company');

  const [user] = await db
    .insert(schema.users)
    .values({
      companyId: company.id,
      name: 'Demo Owner',
      email: 'demo@dutywise.app',
      passwordHash: await hashPassword('demo-pass-1234'),
      role: 'owner',
    })
    .returning();
  if (!user) throw new Error('seed failed: user');

  const companyId = company.id;

  const [s1, s2, s3] = await db
    .insert(schema.shipments)
    .values([
      { companyId, mode: 'ocean', carrier: 'Maersk Line', blNumber: 'MAEU-112233445', originPort: 'Shanghai', destinationPort: 'Los Angeles', status: 'in_transit' },
      { companyId, mode: 'air', carrier: 'Atlas Air', blNumber: 'ATA-99887766', originPort: 'Frankfurt', destinationPort: 'New York', status: 'cleared' },
      { companyId, mode: 'truck', carrier: 'Schneider', blNumber: 'SCHD-556677', originPort: 'Laredo', destinationPort: 'Dallas', status: 'booked' },
    ])
    .returning();
  if (!s1 || !s2 || !s3) throw new Error('seed failed: shipments');

  const entryRows: (typeof schema.entries.$inferInsert)[] = [
    { companyId, shipmentId: s1.id, entryNumber: '123-7001123-1', status: 'filed', mode: 'ocean', hsCode: '8504.40', description: 'AC power adapters 24V', quantity: '1200', unitValue: '18.5', dutyAmount: '1110', fee: '99', signedBy: 'DutyWise Broker · Sandbox' },
    { companyId, shipmentId: s1.id, entryNumber: '123-7001124-0', status: 'held', mode: 'ocean', hsCode: '8471.30', description: 'Laptop docking stations', quantity: '400', unitValue: '65', dutyAmount: '1300', fee: '99' },
    { companyId, shipmentId: s2.id, entryNumber: '123-7105543-9', status: 'released', mode: 'air', hsCode: '9025.19', description: 'Industrial thermometers', quantity: '250', unitValue: '42', dutyAmount: '525', fee: '89', signedBy: 'DutyWise Broker · Sandbox' },
    { companyId, shipmentId: s2.id, entryNumber: '123-7105544-8', status: 'accepted', mode: 'air', hsCode: '9030.33', description: 'Multimeters', quantity: '180', unitValue: '88', dutyAmount: '792', fee: '89', signedBy: 'DutyWise Broker · Sandbox' },
    { companyId, shipmentId: s3.id, entryNumber: '123-7201234-5', status: 'processing', mode: 'truck', hsCode: '3926.90', description: 'Plastic grommets', quantity: '5000', unitValue: '0.9', dutyAmount: '225', fee: '69' },
  ];
  await db.insert(schema.entries).values(entryRows);

  await db.insert(schema.alerts).values([
    { companyId, type: 'tariff_change', severity: 'critical', title: 'Rate change on HTS 8504.40', message: 'Section 301 rates on power supplies increase 15% effective 2026-09-01. 1 SKU on your watchlist is affected. Estimated duty impact: +$1,350/yr.', status: 'open' },
    { companyId, type: 'hold', severity: 'warning', title: 'Hold on entry 123-7001124-0', message: 'CBP issued a CF28 request for supplier documentation on entry 123-7001124-0. Response window closes in 14 days.', status: 'open' },
    { companyId, type: 'expiry', severity: 'info', title: 'POA renewal due', message: 'Your power of attorney with DutyWise renews 2026-12-31. Renewal takes 10 minutes in the portal.', status: 'open' },
    { companyId, type: 'refund_window', severity: 'info', title: 'IEEPA refund window open', message: 'Entries paid between Feb 2025 and Feb 24, 2026 may be refund-eligible. Your last audit found an estimated $12,480 recoverable.', status: 'open' },
  ]);

  await db.insert(schema.invoices).values([
    { companyId, number: 'DW-2026-0001', total: '376', status: 'open' },
    { companyId, number: 'DW-2026-0002', total: '257', status: 'paid' },
  ]);
  const invoiceRows = await db.query.invoices.findMany({ where: (i, { eq }) => eq(i.companyId, companyId) });
  const inv1 = invoiceRows.find((i) => i.number === 'DW-2026-0001');
  const inv2 = invoiceRows.find((i) => i.number === 'DW-2026-0002');
  if (inv1) {
    await db.insert(schema.invoiceItems).values([
      { invoiceId: inv1.id, description: 'Ocean entry filing · 123-7001123-1', amount: '99' },
      { invoiceId: inv1.id, description: 'Ocean entry filing · 123-7001124-0', amount: '99' },
      { invoiceId: inv1.id, description: 'Air entry filing · 123-7105543-9', amount: '89' },
      { invoiceId: inv1.id, description: 'Air entry filing · 123-7105544-8', amount: '89' },
    ]);
  }
  if (inv2) {
    await db.insert(schema.invoiceItems).values([
      { invoiceId: inv2.id, description: 'Truck entry filing · 123-7201234-5', amount: '69' },
      { invoiceId: inv2.id, description: 'ISF filing · 123-7201234-5', amount: '35' },
      { invoiceId: inv2.id, description: 'Monitoring (Core) — July 2026', amount: '99' },
      { invoiceId: inv2.id, description: 'Disbursement fees — July 2026 (2.5%)', amount: '54' },
    ]);
  }

  const [audit] = await db
    .insert(schema.refundAudits)
    .values({
      email: 'demo@dutywise.app',
      companyName: 'Demo Imports Inc',
      status: 'completed',
      totalEstimate: '12480',
      interestEstimate: '187',
      eligibleCount: 3,
      summary:
        '3 of 4 entries screened are likely eligible under the IEEPA refund program (reciprocal tariff deposits, Feb 2025 – Feb 24, 2026). Estimated refund: $12,480 plus $187 interest. Exclusions applied: §301, §232, AD/CVD. Estimates only — not a claim. We file, CBP pays.',
      disclaimer:
        'Estimates only, provided for screening purposes. Not a claim, not legal advice. Final eligibility is determined by CBP upon filing. DutyWise files refunds at no win, no fee — you only pay 10% of the refund actually received. We file, CBP pays.',
    })
    .returning();
  if (audit) {
    await db.insert(schema.refundAuditItems).values([
      { auditId: audit.id, entryNumber: '123-7001123-1', eligible: true, estimate: '1110', reason: 'IEEPA window · reciprocal tariff deposit likely refundable (15% of paid duty)' },
      { auditId: audit.id, entryNumber: '123-7001124-0', eligible: true, estimate: '1300', reason: 'IEEPA window · reciprocal tariff deposit likely refundable (15% of paid duty)' },
      { auditId: audit.id, entryNumber: '123-7105543-9', eligible: true, estimate: '10070', reason: 'IEEPA window · framework-country portion applies; partial refund estimate (7.5%)' },
      { auditId: audit.id, entryNumber: '123-7105544-8', eligible: false, estimate: '0', reason: '§301 list exclusion — not refundable under IEEPA' },
    ]);
  }

  console.log('Demo seed applied: demo@dutywise.app / demo-pass-1234');
  return true;
}

// Standalone execution: tsx src/db/seed.ts
import { fileURLToPath } from 'node:url';
import { schema } from '../db/index.js';

// Standalone execution: tsx src/db/seed.ts (never fires inside the tsup bundle).
const isMain = !!process.argv[1] && /seed\.(ts|js)$/.test(process.argv[1]);

if (isMain) {
  migrateDb(config.databaseUrl)
    .then(async () => {
      const db = createDb(config.databaseUrl);
      const applied = await seedDemo(db);
      console.log(applied ? 'Seed complete.' : 'Seed skipped — demo data already present.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
