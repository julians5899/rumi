import { z } from 'zod';

export const ratingContextEnum = z.enum(['LANDLORD', 'TENANT', 'ROOMMATE']);

export const createRatingSchema = z.object({
  ratedUserId: z.string().uuid(),
  context: ratingContextEnum,
  score: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const ratingBreakdownSchema = z.object({
  overall: z.number().min(0).max(5).nullable(),
  landlord: z.object({
    average: z.number().min(0).max(5).nullable(),
    count: z.number().int(),
  }),
  tenant: z.object({
    average: z.number().min(0).max(5).nullable(),
    count: z.number().int(),
  }),
  roommate: z.object({
    average: z.number().min(0).max(5).nullable(),
    count: z.number().int(),
  }),
});
