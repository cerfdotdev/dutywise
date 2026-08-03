import type { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get('/api/healthz', async () => ({
    status: 'ok',
    version: '0.1.0',
  }));
}
