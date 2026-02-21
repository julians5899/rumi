import { z } from 'zod';

export const sendMessageSchema = z.object({
  content: z.string().min(1).max(5000),
});

export const conversationParamsSchema = z.object({
  id: z.string().uuid(),
});

export const messagesPaginationSchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
