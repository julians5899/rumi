import type { FastifyReply, FastifyRequest } from 'fastify';
import * as propertiesService from './properties.service';

export async function createPropertyHandler(request: FastifyRequest, reply: FastifyReply) {
  const property = await propertiesService.createProperty(request.user!.sub, request.body as Record<string, unknown>);
  return reply.status(201).send(property);
}

export async function listPropertiesHandler(request: FastifyRequest, reply: FastifyReply) {
  const filters = request.query as Record<string, unknown>;
  const userId = request.user?.sub;
  const result = await propertiesService.listProperties(filters, userId);
  return reply.send(result);
}

export async function getPropertyHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const property = await propertiesService.getPropertyById(id);
  if (!property) {
    return reply.status(404).send({ error: 'Not Found', message: 'Propiedad no encontrada', statusCode: 404 });
  }
  return reply.send(property);
}

export async function updatePropertyHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const property = await propertiesService.updateProperty(id, request.user!.sub, request.body as Record<string, unknown>);
  return reply.send(property);
}

export async function deletePropertyHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await propertiesService.deleteProperty(id, request.user!.sub);
  return reply.status(204).send();
}

export async function getMyPropertiesHandler(request: FastifyRequest, reply: FastifyReply) {
  const properties = await propertiesService.getPropertiesByOwner(request.user!.sub);
  return reply.send(properties);
}

export async function recordViewHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const view = await propertiesService.recordPropertyView(request.user!.sub, id);
  return reply.send(view);
}

export async function getViewedPropertiesHandler(request: FastifyRequest, reply: FastifyReply) {
  const views = await propertiesService.getViewedProperties(request.user!.sub);
  return reply.send(views);
}

export async function uploadImageHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { contentType } = request.body as { contentType: string };
  const result = await propertiesService.getImageUploadUrl(id, request.user!.sub, contentType);
  return reply.send(result);
}
