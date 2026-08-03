import {
  pgTable,
  pgEnum,
  uuid,
  text,
  timestamp,
  integer,
  numeric,
  date,
  boolean,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['owner', 'admin', 'broker', 'compliance']);
export const shipmentModeEnum = pgEnum('shipment_mode', ['ocean', 'air', 'truck']);
export const shipmentStatusEnum = pgEnum('shipment_status', [
  'draft',
  'booked',
  'in_transit',
  'cleared',
  'delayed',
  'cancelled',
]);
export const entryStatusEnum = pgEnum('entry_status', [
  'processing',
  'review',
  'filed',
  'accepted',
  'released',
  'held',
  'cancelled',
]);
export const alertTypeEnum = pgEnum('alert_type', ['tariff_change', 'hold', 'expiry', 'refund_window']);
export const alertSeverityEnum = pgEnum('alert_severity', ['info', 'warning', 'critical']);
export const alertStatusEnum = pgEnum('alert_status', ['open', 'acknowledged', 'resolved']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['open', 'paid', 'void']);

const uuidPk = () =>
  uuid('id')
    .primaryKey()
    .default(sql`gen_random_uuid()`);

const now = () => timestamp('created_at', { withTimezone: true }).defaultNow().notNull();

export const companies = pgTable('companies', {
  id: uuidPk(),
  name: text('name').notNull(),
  createdAt: now(),
});

export const users = pgTable(
  'users',
  {
    id: uuidPk(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    email: text('email').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: roleEnum('role').notNull().default('owner'),
    createdAt: now(),
  },
  (t) => [uniqueIndex('users_email_unique').on(t.email)],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuidPk(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    familyId: uuid('family_id').notNull(),
    tokenHash: text('token_hash').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: now(),
  },
  (t) => [
    uniqueIndex('refresh_tokens_hash_unique').on(t.tokenHash),
    index('refresh_tokens_family_idx').on(t.familyId),
  ],
);

export const leads = pgTable('leads', {
  id: uuidPk(),
  email: text('email').notNull(),
  companyName: text('company_name'),
  createdAt: now(),
});

export const shipments = pgTable(
  'shipments',
  {
    id: uuidPk(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    mode: shipmentModeEnum('mode').notNull(),
    carrier: text('carrier').notNull(),
    blNumber: text('bl_number').notNull(),
    originPort: text('origin_port'),
    destinationPort: text('destination_port'),
    eta: date('eta'),
    status: shipmentStatusEnum('status').notNull().default('booked'),
    createdAt: now(),
  },
  (t) => [index('shipments_company_idx').on(t.companyId)],
);

export const entries = pgTable(
  'entries',
  {
    id: uuidPk(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    shipmentId: uuid('shipment_id').references(() => shipments.id, { onDelete: 'set null' }),
    entryNumber: text('entry_number').notNull(),
    status: entryStatusEnum('status').notNull().default('processing'),
    mode: shipmentModeEnum('mode').notNull(),
    hsCode: text('hs_code').notNull(),
    description: text('description').notNull(),
    quantity: numeric('quantity', { precision: 12, scale: 2 }).notNull(),
    unitValue: numeric('unit_value', { precision: 14, scale: 2 }).notNull(),
    dutyAmount: numeric('duty_amount', { precision: 14, scale: 2 }).notNull(),
    fee: numeric('fee', { precision: 10, scale: 2 }).notNull(),
    signedBy: text('signed_by'),
    createdAt: now(),
  },
  (t) => [index('entries_company_idx').on(t.companyId)],
);

export const refundAudits = pgTable('refund_audits', {
  id: uuidPk(),
  email: text('email').notNull(),
  companyName: text('company_name'),
  status: text('status').notNull().default('completed'),
  totalEstimate: numeric('total_estimate', { precision: 16, scale: 2 }).notNull().default('0'),
  interestEstimate: numeric('interest_estimate', { precision: 16, scale: 2 }).notNull().default('0'),
  eligibleCount: integer('eligible_count').notNull().default(0),
  summary: text('summary').notNull(),
  disclaimer: text('disclaimer').notNull(),
  createdAt: now(),
});

export const refundAuditItems = pgTable(
  'refund_audit_items',
  {
    id: uuidPk(),
    auditId: uuid('audit_id')
      .notNull()
      .references(() => refundAudits.id, { onDelete: 'cascade' }),
    entryNumber: text('entry_number').notNull(),
    eligible: boolean('eligible').notNull(),
    estimate: numeric('estimate', { precision: 16, scale: 2 }).notNull().default('0'),
    reason: text('reason').notNull(),
  },
  (t) => [index('audit_items_audit_idx').on(t.auditId)],
);

export const alerts = pgTable(
  'alerts',
  {
    id: uuidPk(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    type: alertTypeEnum('type').notNull(),
    severity: alertSeverityEnum('severity').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    status: alertStatusEnum('status').notNull().default('open'),
    createdAt: now(),
  },
  (t) => [index('alerts_company_idx').on(t.companyId)],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuidPk(),
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, { onDelete: 'cascade' }),
    number: text('number').notNull(),
    total: numeric('total', { precision: 14, scale: 2 }).notNull().default('0'),
    status: invoiceStatusEnum('status').notNull().default('open'),
    createdAt: now(),
  },
  (t) => [uniqueIndex('invoices_number_unique').on(t.number), index('invoices_company_idx').on(t.companyId)],
);

export const invoiceItems = pgTable(
  'invoice_items',
  {
    id: uuidPk(),
    invoiceId: uuid('invoice_id')
      .notNull()
      .references(() => invoices.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  },
  (t) => [index('invoice_items_invoice_idx').on(t.invoiceId)],
);

export const schema = {
  companies,
  users,
  refreshTokens,
  leads,
  shipments,
  entries,
  refundAudits,
  refundAuditItems,
  alerts,
  invoices,
  invoiceItems,
};
