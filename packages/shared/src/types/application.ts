import { z } from 'zod';
import { createApplicationSchema, updateApplicationStatusSchema } from '../schemas/application.schema';

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationStatusInput = z.infer<typeof updateApplicationStatusSchema>;

export interface ApplicationResponse {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    city: string;
    price: number;
  };
  applicant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
  createdAt: string;
}
