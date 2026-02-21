import { z } from 'zod';

export const lifestyleSchema = z.object({
  smoking: z.boolean().optional(),
  pets: z.boolean().optional(),
  schedule: z.enum(['early_bird', 'night_owl', 'flexible']).optional(),
  cleanliness: z.enum(['very_clean', 'clean', 'moderate', 'relaxed']).optional(),
  guests: z.enum(['often', 'sometimes', 'rarely', 'never']).optional(),
});

export const createRoommateProfileSchema = z.object({
  budget: z.number().positive(),
  preferredCity: z.string().min(2).max(100),
  preferredNeighborhoods: z.array(z.string()).default([]),
  moveInDate: z.string().optional(),
  bio: z.string().max(2000).optional(),
  occupation: z.string().max(200).optional(),
  age: z.number().int().min(18).max(120).optional(),
  lifestyle: lifestyleSchema.optional(),
});

export const updateRoommateProfileSchema = createRoommateProfileSchema.partial();

export const swipeActionEnum = z.enum(['LIKE', 'PASS']);

export const recordSwipeSchema = z.object({
  candidateId: z.string().uuid(),
  action: swipeActionEnum,
});
