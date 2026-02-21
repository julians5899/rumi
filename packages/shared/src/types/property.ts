import { z } from 'zod';
import {
  createPropertySchema,
  updatePropertySchema,
  propertyFiltersSchema,
} from '../schemas/property.schema';

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;
export type UpdatePropertyInput = z.infer<typeof updatePropertySchema>;
export type PropertyFilters = z.infer<typeof propertyFiltersSchema>;

export interface PropertyImage {
  id: string;
  url: string;
  order: number;
}

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  propertyType: 'APARTMENT' | 'HOUSE' | 'ROOM' | 'STUDIO';
  listingType: 'RENT' | 'SALE';
  price: number;
  currency: string;
  bedrooms: number;
  bathrooms: number;
  area: number | null;
  address: string;
  city: string;
  neighborhood: string | null;
  department: string;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  images: PropertyImage[];
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  isActive: boolean;
  isViewed?: boolean;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
