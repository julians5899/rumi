import type { FastifyReply, FastifyRequest } from 'fastify';
import * as documentsService from './documents.service';

export async function getUploadUrlHandler(request: FastifyRequest, reply: FastifyReply) {
  const { applicationId, documentType, contentType, fileName } = request.body as {
    applicationId: string;
    documentType: string;
    contentType: string;
    fileName: string;
  };
  const result = await documentsService.getDocumentUploadUrl(
    request.user!.sub,
    applicationId,
    documentType,
    contentType,
    fileName,
  );
  return reply.send(result);
}

export async function createDocumentHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = request.body as {
    applicationId: string;
    type: string;
    fileKey: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  };
  const document = await documentsService.createDocument(request.user!.sub, data);
  return reply.status(201).send(document);
}

export async function getDocumentsByApplicationHandler(request: FastifyRequest, reply: FastifyReply) {
  const { applicationId } = request.params as { applicationId: string };
  const documents = await documentsService.getDocumentsByApplication(request.user!.sub, applicationId);
  return reply.send(documents);
}

export async function approveDocumentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const document = await documentsService.approveDocument(request.user!.sub, id);
  return reply.send(document);
}

export async function rejectDocumentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { rejectionNote } = request.body as { rejectionNote: string };
  const document = await documentsService.rejectDocument(request.user!.sub, id, rejectionNote);
  return reply.send(document);
}

export async function deleteDocumentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await documentsService.deleteDocument(request.user!.sub, id);
  return reply.status(204).send();
}
