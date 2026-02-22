import type { FastifyReply, FastifyRequest } from 'fastify';
import * as leasesService from './leases.service';

export async function createLeaseHandler(request: FastifyRequest, reply: FastifyReply) {
  const data = request.body as {
    applicationId: string;
    startDate: string;
    endDate: string;
    monthlyRent: number;
  };
  const lease = await leasesService.createLease(request.user!.sub, data);
  return reply.status(201).send(lease);
}

export async function getMyLeasesHandler(request: FastifyRequest, reply: FastifyReply) {
  const leases = await leasesService.getMyLeases(request.user!.sub);
  return reply.send(leases);
}

export async function getLeaseByIdHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const lease = await leasesService.getLeaseById(request.user!.sub, id);
  return reply.send(lease);
}

export async function endLeaseHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  const lease = await leasesService.endLease(request.user!.sub, id);
  return reply.send(lease);
}
