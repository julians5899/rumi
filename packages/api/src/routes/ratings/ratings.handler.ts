import type { FastifyReply, FastifyRequest } from 'fastify';
import * as ratingsService from './ratings.service';

export async function createRatingHandler(request: FastifyRequest, reply: FastifyReply) {
  const rating = await ratingsService.createRating(request.user!.sub, request.body as Record<string, unknown>);
  return reply.status(201).send(rating);
}

export async function getGivenRatingsHandler(request: FastifyRequest, reply: FastifyReply) {
  const ratings = await ratingsService.getGivenRatings(request.user!.sub);
  return reply.send(ratings);
}

export async function getReceivedRatingsHandler(request: FastifyRequest, reply: FastifyReply) {
  const ratings = await ratingsService.getReceivedRatings(request.user!.sub);
  return reply.send(ratings);
}
