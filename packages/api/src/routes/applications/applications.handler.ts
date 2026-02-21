import type { FastifyReply, FastifyRequest } from 'fastify';
import * as applicationsService from './applications.service';

export async function createApplicationHandler(request: FastifyRequest, reply: FastifyReply) {
  const application = await applicationsService.createApplication(request.user!.sub, request.body as Record<string, unknown>);
  return reply.status(201).send(application);
}

export async function getSentApplicationsHandler(request: FastifyRequest, reply: FastifyReply) {
  const applications = await applicationsService.getSentApplications(request.user!.sub);
  return reply.send(applications);
}

export async function getReceivedApplicationsHandler(request: FastifyRequest, reply: FastifyReply) {
  const applications = await applicationsService.getReceivedApplications(request.user!.sub);
  return reply.send(applications);
}

export async function updateApplicationStatusHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const { status } = request.body as { status: string };
  const application = await applicationsService.updateApplicationStatus(request.user!.sub, id, status);
  return reply.send(application);
}
