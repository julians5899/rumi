import { z } from 'zod';

export const recordPropertyViewSchema = z.object({
  propertyId: z.string().uuid(),
});

export const propertyViewResponseSchema = z.object({
  propertyId: z.string().uuid(),
  viewedAt: z.string(),
});
