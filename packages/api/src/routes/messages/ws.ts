import type { FastifyPluginAsync } from 'fastify';
import { addConnection, removeConnection } from '../../plugins/websocket';

const wsRoutes: FastifyPluginAsync = async (app) => {
  // Skip if WebSocket support is not registered (Lambda environment)
  if (!app.websocketServer) return;

  app.get('/ws', { websocket: true }, (socket, request) => {
    // Authenticate via query param token
    const url = new URL(request.url, `http://${request.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      socket.close(4001, 'Token requerido');
      return;
    }

    let userSub: string;
    try {
      if (process.env.STAGE === 'localdev') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { verifyLocalToken } = require('../../lib/local-jwt');
        const payload = verifyLocalToken(token);
        userSub = payload.sub;
      } else {
        // For Cognito, we do a synchronous decode check here
        // Full async verification would require a different approach
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { verifyLocalToken } = require('../../lib/local-jwt');
        const payload = verifyLocalToken(token);
        userSub = payload.sub;
      }
    } catch {
      socket.close(4001, 'Token invalido');
      return;
    }

    // Look up user ID from cognitoSub
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getPrisma } = require('../../lib/prisma') as typeof import('../../lib/prisma');
    const prisma = getPrisma();

    prisma.user
      .findUnique({ where: { cognitoSub: userSub }, select: { id: true } })
      .then((user: { id: string } | null) => {
        if (!user) {
          socket.close(4001, 'Usuario no encontrado');
          return;
        }

        const userId = user.id;

        // Register connection
        addConnection(userId, socket);
        app.log.info(`WS connected: ${userId}`);

        // Handle incoming messages (e.g., ping/pong, typing indicators)
        socket.on('message', (raw: Buffer) => {
          try {
            const data = JSON.parse(raw.toString());
            // Currently we only use WS for server → client push
            // But the client can send keepalive pings
            if (data.type === 'ping') {
              socket.send(JSON.stringify({ type: 'pong' }));
            }
          } catch {
            // Ignore malformed messages
          }
        });

        // Cleanup on disconnect
        socket.on('close', () => {
          removeConnection(userId, socket);
          app.log.info(`WS disconnected: ${userId}`);
        });

        // Send confirmation
        socket.send(JSON.stringify({ type: 'connected', userId }));
      })
      .catch(() => {
        socket.close(4002, 'Error interno');
      });
  });
};

export default wsRoutes;
