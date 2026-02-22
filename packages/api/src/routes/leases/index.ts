import type { FastifyPluginAsync } from 'fastify';
import {
  createLeaseHandler,
  getMyLeasesHandler,
  getLeaseByIdHandler,
  endLeaseHandler,
} from './leases.handler';

const leasesRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.requireAuth] }, createLeaseHandler);
  app.get('/', { preHandler: [app.requireAuth] }, getMyLeasesHandler);
  app.get('/:id', { preHandler: [app.requireAuth] }, getLeaseByIdHandler);
  app.put('/:id/end', { preHandler: [app.requireAuth] }, endLeaseHandler);
};

export default leasesRoutes;
