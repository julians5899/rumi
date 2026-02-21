import type { FastifyPluginAsync } from 'fastify';
import { createApplicationHandler, getSentApplicationsHandler, getReceivedApplicationsHandler, updateApplicationStatusHandler } from './applications.handler';

const applicationsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.requireAuth] }, createApplicationHandler);
  app.get('/sent', { preHandler: [app.requireAuth] }, getSentApplicationsHandler);
  app.get('/received', { preHandler: [app.requireAuth] }, getReceivedApplicationsHandler);
  app.put('/:id/status', { preHandler: [app.requireAuth] }, updateApplicationStatusHandler);
};

export default applicationsRoutes;
