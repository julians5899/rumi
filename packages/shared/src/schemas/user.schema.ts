import { z } from 'zod';

export const seekingModeEnum = z.enum(['NONE', 'TENANT', 'ROOMMATE']);

export const updateUserSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

export const updateSeekingModeSchema = z.object({
  seekingMode: seekingModeEnum,
});

export const userResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  bio: z.string().nullable(),
  seekingMode: seekingModeEnum,
  createdAt: z.string(),
});
