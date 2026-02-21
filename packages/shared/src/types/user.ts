import { z } from 'zod';
import { updateUserSchema, updateSeekingModeSchema, userResponseSchema } from '../schemas/user.schema';

export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateSeekingModeInput = z.infer<typeof updateSeekingModeSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

export interface UserPublicProfile {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}
