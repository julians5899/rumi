import { z } from 'zod';

export const applicationStatusEnum = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN']);

export const createApplicationSchema = z.object({
  propertyId: z.string().uuid(),
  message: z.string().max(2000).optional(),
});

export const updateApplicationStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED']),
});
