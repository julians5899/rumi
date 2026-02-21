import { z } from 'zod';
import {
  createRoommateProfileSchema,
  updateRoommateProfileSchema,
  recordSwipeSchema,
  lifestyleSchema,
} from '../schemas/roommate.schema';

export type CreateRoommateProfileInput = z.infer<typeof createRoommateProfileSchema>;
export type UpdateRoommateProfileInput = z.infer<typeof updateRoommateProfileSchema>;
export type RecordSwipeInput = z.infer<typeof recordSwipeSchema>;
export type Lifestyle = z.infer<typeof lifestyleSchema>;

export interface RoommateProfileResponse {
  id: string;
  userId: string;
  budget: number;
  preferredCity: string;
  preferredNeighborhoods: string[];
  moveInDate: string | null;
  bio: string | null;
  occupation: string | null;
  age: number | null;
  lifestyle: Lifestyle | null;
  createdAt: string;
}

export interface RoommateCandidateResponse {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  roommateProfile: RoommateProfileResponse;
}

export interface SwipeResultResponse {
  matched: boolean;
  matchId?: string;
}
