import type { FastifyReply, FastifyRequest } from 'fastify';
import * as roommatesService from './roommates.service';

export async function getProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const profile = await roommatesService.getRoommateProfile(request.user!.sub);
  if (!profile) {
    return reply.status(404).send({ error: 'Not Found', message: 'Perfil de compañero no encontrado', statusCode: 404 });
  }
  return reply.send(profile);
}

export async function updateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const profile = await roommatesService.upsertRoommateProfile(request.user!.sub, request.body as Record<string, unknown>);
  return reply.send(profile);
}

export async function getCandidatesHandler(request: FastifyRequest, reply: FastifyReply) {
  const { limit } = request.query as { limit?: string };
  const candidates = await roommatesService.getCandidates(request.user!.sub, Number(limit) || 10);
  return reply.send(candidates);
}

export async function recordSwipeHandler(request: FastifyRequest, reply: FastifyReply) {
  const { candidateId, action } = request.body as { candidateId: string; action: string };
  const result = await roommatesService.recordSwipe(request.user!.sub, candidateId, action);
  return reply.send(result);
}
