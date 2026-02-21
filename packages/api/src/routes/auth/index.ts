import type { FastifyPluginAsync } from 'fastify';
import { syncHandler, registerHandler, loginHandler } from './auth.handler';

const authRoutes: FastifyPluginAsync = async (app) => {
  // Cognito sync (dev/prod) — requires existing auth
  app.post('/sync', { preHandler: [app.requireAuth] }, syncHandler);

  // Local auth (localdev only) — no auth required (these issue tokens)
  app.post('/register', registerHandler);
  app.post('/login', loginHandler);
};

export default authRoutes;
