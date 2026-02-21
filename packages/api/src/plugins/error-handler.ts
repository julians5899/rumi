import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { ZodError } from 'zod';

async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    // Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Los datos enviados no son validos',
        statusCode: 400,
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    // Fastify validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'Validation Error',
        message: 'Los datos enviados no son validos',
        statusCode: 400,
        details: error.validation,
      });
    }

    // Prisma known errors
    if (error.name === 'PrismaClientKnownRequestError') {
      const prismaError = error as { code?: string; meta?: Record<string, unknown> };

      if (prismaError.code === 'P2002') {
        return reply.status(409).send({
          error: 'Conflict',
          message: 'El recurso ya existe',
          statusCode: 409,
        });
      }

      if (prismaError.code === 'P2025') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Recurso no encontrado',
          statusCode: 404,
        });
      }
    }

    // Default error
    const statusCode = error.statusCode || 500;
    app.log.error(error);

    return reply.status(statusCode).send({
      error: statusCode >= 500 ? 'Internal Server Error' : error.message,
      message: statusCode >= 500 ? 'Error interno del servidor' : error.message,
      statusCode,
    });
  });
}

export default fp(errorHandlerPlugin, { name: 'error-handler' });
