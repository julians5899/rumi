import type { FastifyPluginAsync } from 'fastify';
import { listMatchesHandler, unmatchHandler } from './matches.handler';

const matchesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', { preHandler: [app.requireAuth] }, listMatchesHandler);
  app.delete('/:id', { preHandler: [app.requireAuth] }, unmatchHandler);
};

export default matchesRoutes;
