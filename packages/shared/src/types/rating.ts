import { z } from 'zod';
import { createRatingSchema, ratingBreakdownSchema } from '../schemas/rating.schema';

export type CreateRatingInput = z.infer<typeof createRatingSchema>;
export type RatingBreakdown = z.infer<typeof ratingBreakdownSchema>;

export interface RatingResponse {
  id: string;
  raterId: string;
  ratedUserId: string;
  context: 'LANDLORD' | 'TENANT' | 'ROOMMATE';
  score: number;
  comment: string | null;
  createdAt: string;
  rater?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
}
