import type { FastifyPluginAsync } from 'fastify';
import { getMeHandler, updateMeHandler, updateSeekingModeHandler, updatePreferencesHandler, deleteAccountHandler, getPublicProfileHandler, getUserRatingsHandler } from './users.handler';

const usersRoutes: FastifyPluginAsync = async (app) => {
  app.get('/me', { preHandler: [app.requireAuth] }, getMeHandler);
  app.put('/me', { preHandler: [app.requireAuth] }, updateMeHandler);
  app.put('/me/preferences', { preHandler: [app.requireAuth] }, updatePreferencesHandler);
  app.put('/me/seeking-mode', { preHandler: [app.requireAuth] }, updateSeekingModeHandler);
  app.delete('/me', { preHandler: [app.requireAuth] }, deleteAccountHandler);
  app.get('/:id', getPublicProfileHandler);
  app.get('/:id/ratings', getUserRatingsHandler);
};

export default usersRoutes;
