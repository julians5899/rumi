import type { FastifyPluginAsync } from 'fastify';
import { createApplicationHandler, getSentApplicationsHandler, getReceivedApplicationsHandler, updateApplicationStatusHandler, getApplicationWorkflowHandler } from './applications.handler';

const applicationsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.requireAuth] }, createApplicationHandler);
  app.get('/sent', { preHandler: [app.requireAuth] }, getSentApplicationsHandler);
  app.get('/received', { preHandler: [app.requireAuth] }, getReceivedApplicationsHandler);
  app.put('/:id/status', { preHandler: [app.requireAuth] }, updateApplicationStatusHandler);
  app.get('/:id/workflow', { preHandler: [app.requireAuth] }, getApplicationWorkflowHandler);
};

export default applicationsRoutes;
