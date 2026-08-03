import type { FastifyInstance } from 'fastify';
import type { Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';

export async function monitoringRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.get('/api/monitoring/summary', { preHandler: requireAuth }, async (req) => {
    const companyId = req.user!.companyId;
    const all = await db.query.alerts.findMany({ where: (a, { eq }) => eq(a.companyId, companyId) });
    const openAlerts = all.filter((a) => a.status === 'open').length;
    const criticalAlerts = all.filter((a) => a.status === 'open' && a.severity === 'critical').length;

    return {
      openAlerts,
      criticalAlerts,
      watchlistCount: 4,
      activeChanges: [
        {
          hsCode: '8504.40',
          description: 'Power supply units',
          oldRate: '0%',
          newRate: '+15%',
          effectiveDate: '2026-09-01',
          matchedSkus: ['DW-PSU-24V-5A', 'DW-PSU-12V-10A'],
        },
        {
          hsCode: '8471.30',
          description: 'Laptops and docking stations',
          oldRate: '0%',
          newRate: '+10%',
          effectiveDate: '2026-10-15',
          matchedSkus: ['DW-DOCK-USB4'],
        },
        {
          hsCode: '9025.19',
          description: 'Industrial thermometers',
          oldRate: '0%',
          newRate: '+7.5%',
          effectiveDate: '2026-08-20',
          matchedSkus: ['DW-THERM-IND-1'],
        },
      ],
    };
  });
}
