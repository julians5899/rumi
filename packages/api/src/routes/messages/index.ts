import type { FastifyPluginAsync } from 'fastify';
import { listConversationsHandler, getMessagesHandler, sendMessageHandler } from './messages.handler';
import wsRoutes from './ws';

const messagesRoutes: FastifyPluginAsync = async (app) => {
  app.get('/conversations', { preHandler: [app.requireAuth] }, listConversationsHandler);
  app.get('/conversations/:id', { preHandler: [app.requireAuth] }, getMessagesHandler);
  app.post('/conversations/:id', { preHandler: [app.requireAuth] }, sendMessageHandler);

  // WebSocket route for real-time messaging
  await app.register(wsRoutes);
};

export default messagesRoutes;
