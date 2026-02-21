import Fastify from 'fastify';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import corsPlugin from './plugins/cors';
import authPlugin from './plugins/auth';
import errorHandlerPlugin from './plugins/error-handler';
import websocketPlugin from './plugins/websocket';
import { registerRoutes } from './routes';

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'info',
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Register plugins
  await app.register(corsPlugin);
  await app.register(authPlugin);
  await app.register(errorHandlerPlugin);
  await app.register(websocketPlugin);

  // Register routes
  await app.register(registerRoutes, { prefix: '/api/v1' });

  return app;
}
