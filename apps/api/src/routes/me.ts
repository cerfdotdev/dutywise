import type { FastifyInstance } from 'fastify';
import { type Db } from '../db/index.js';
import { requireAuth } from '../auth/guards.js';
import { AppError } from '../lib/errors.js';

export async function meRoutes(app: FastifyInstance, opts: { db: Db }): Promise<void> {
  const { db } = opts;

  app.get('/api/me', { preHandler: requireAuth }, async (req) => {
    const user = await db.query.users.findFirst({ where: (u, { eq }) => eq(u.id, req.user!.userId) });
    if (!user) throw new AppError(404, 'not_found', 'User not found');
    const company = await db.query.companies.findFirst({ where: (c, { eq }) => eq(c.id, user.companyId) });
    if (!company) throw new AppError(404, 'not_found', 'Company not found');

    return {
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
      company: { id: company.id, name: company.name, licenseNote: 'Licensed customs brokerage · Sandbox mode' },
    };
  });
}
