import type { FastifyReply, FastifyRequest } from 'fastify';
import * as matchesService from './matches.service';

export async function listMatchesHandler(request: FastifyRequest, reply: FastifyReply) {
  const matches = await matchesService.getMatches(request.user!.sub);
  return reply.send(matches);
}

export async function unmatchHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as { id: string };
  await matchesService.unmatch(request.user!.sub, id);
  return reply.status(204).send();
}
