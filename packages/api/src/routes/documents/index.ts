import type { FastifyPluginAsync } from 'fastify';
import {
  getUploadUrlHandler,
  createDocumentHandler,
  getDocumentsByApplicationHandler,
  approveDocumentHandler,
  rejectDocumentHandler,
  deleteDocumentHandler,
} from './documents.handler';

const documentsRoutes: FastifyPluginAsync = async (app) => {
  app.post('/upload-url', { preHandler: [app.requireAuth] }, getUploadUrlHandler);
  app.post('/', { preHandler: [app.requireAuth] }, createDocumentHandler);
  app.get('/by-application/:applicationId', { preHandler: [app.requireAuth] }, getDocumentsByApplicationHandler);
  app.put('/:id/approve', { preHandler: [app.requireAuth] }, approveDocumentHandler);
  app.put('/:id/reject', { preHandler: [app.requireAuth] }, rejectDocumentHandler);
  app.delete('/:id', { preHandler: [app.requireAuth] }, deleteDocumentHandler);
};

export default documentsRoutes;
