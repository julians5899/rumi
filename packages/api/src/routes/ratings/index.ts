import type { FastifyPluginAsync } from 'fastify';
import { createRatingHandler, getGivenRatingsHandler, getReceivedRatingsHandler } from './ratings.handler';

const ratingsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/', { preHandler: [app.requireAuth] }, createRatingHandler);
  app.get('/given', { preHandler: [app.requireAuth] }, getGivenRatingsHandler);
  app.get('/received', { preHandler: [app.requireAuth] }, getReceivedRatingsHandler);
};

export default ratingsRoutes;
