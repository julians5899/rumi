import type { FastifyPluginAsync } from 'fastify';
import { getProfileHandler, updateProfileHandler, getCandidatesHandler, recordSwipeHandler } from './roommates.handler';

const roommatesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/profile', { preHandler: [app.requireAuth] }, getProfileHandler);
  app.put('/profile', { preHandler: [app.requireAuth] }, updateProfileHandler);
  app.get('/candidates', { preHandler: [app.requireAuth] }, getCandidatesHandler);
  app.post('/swipe', { preHandler: [app.requireAuth] }, recordSwipeHandler);
};

export default roommatesRoutes;
