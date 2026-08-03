import type { FastifyInstance } from 'fastify';
import type { Db } from '../db/index.js';
import { healthRoutes } from './health.js';
import { authRoutes } from './auth.js';
import { meRoutes } from './me.js';
import { leadRoutes } from './leads.js';
import { auditRoutes } from './audits.js';
import { shipmentRoutes } from './shipments.js';
import { entryRoutes } from './entries.js';
import { alertRoutes } from './alerts.js';
import { invoiceRoutes } from './invoices.js';
import { billingRoutes } from './billing.js';
import { monitoringRoutes } from './monitoring.js';

export function registerRoutes(app: FastifyInstance, db: Db): void {
  void app.register(healthRoutes);
  void app.register(authRoutes, { db });
  void app.register(meRoutes, { db });
  void app.register(leadRoutes, { db });
  void app.register(auditRoutes, { db });
  void app.register(shipmentRoutes, { db });
  void app.register(entryRoutes, { db });
  void app.register(alertRoutes, { db });
  void app.register(invoiceRoutes, { db });
  void app.register(billingRoutes, { db });
  void app.register(monitoringRoutes, { db });
}
