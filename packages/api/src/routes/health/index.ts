import type { FastifyPluginAsync } from 'fastify';

const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    return reply.send({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'rumi-api',
      version: '0.0.0',
    });
  });
};

export default healthRoutes;
