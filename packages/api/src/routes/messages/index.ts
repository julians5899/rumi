import type { FastifyPluginAsync } from 'fastify';
import { listConversationsHandler, getMessagesHandler, sendMessageHandler } from './messages.handler';

const messagesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/conversations', { preHandler: [app.requireAuth] }, listConversationsHandler);
  app.get('/conversations/:id', { preHandler: [app.requireAuth] }, getMessagesHandler);
  app.post('/conversations/:id', { preHandler: [app.requireAuth] }, sendMessageHandler);
};

export default messagesRoutes;
