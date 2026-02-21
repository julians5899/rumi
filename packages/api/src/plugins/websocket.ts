import fp from 'fastify-plugin';
import websocket from '@fastify/websocket';
import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';

// In-memory connection store: userId → Set of WebSocket connections
// A user can have multiple tabs/devices open
const connectionStore = new Map<string, Set<WebSocket>>();

export function getConnectionStore() {
  return connectionStore;
}

export function addConnection(userId: string, socket: WebSocket) {
  if (!connectionStore.has(userId)) {
    connectionStore.set(userId, new Set());
  }
  connectionStore.get(userId)!.add(socket);
}

export function removeConnection(userId: string, socket: WebSocket) {
  const sockets = connectionStore.get(userId);
  if (sockets) {
    sockets.delete(socket);
    if (sockets.size === 0) {
      connectionStore.delete(userId);
    }
  }
}

export function pushToUser(userId: string, data: unknown) {
  const sockets = connectionStore.get(userId);
  if (!sockets) return;

  const payload = JSON.stringify(data);
  for (const socket of sockets) {
    if (socket.readyState === socket.OPEN) {
      socket.send(payload);
    }
  }
}

async function websocketPlugin(app: FastifyInstance) {
  // Only register WebSocket support in non-Lambda environments
  if (process.env.AWS_LAMBDA_FUNCTION_NAME) return;

  await app.register(websocket);
}

export default fp(websocketPlugin, { name: 'websocket' });
