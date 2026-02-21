import { z } from 'zod';

export const propertyTypeEnum = z.enum(['APARTMENT', 'HOUSE', 'ROOM', 'STUDIO']);
export const listingTypeEnum = z.enum(['RENT', 'SALE']);

export const createPropertySchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(20).max(5000),
  propertyType: propertyTypeEnum,
  listingType: listingTypeEnum,
  price: z.number().positive(),
  bedrooms: z.number().int().min(0).max(20),
  bathrooms: z.number().int().min(1).max(10),
  area: z.number().positive().optional(),
  address: z.string().min(5).max(500),
  city: z.string().min(2).max(100),
  neighborhood: z.string().max(100).optional(),
  department: z.string().min(2).max(100),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  amenities: z.array(z.string()).default([]),
});

export const updatePropertySchema = createPropertySchema.partial();

export const propertyFiltersSchema = z.object({
  city: z.string().optional(),
  department: z.string().optional(),
  propertyType: propertyTypeEnum.optional(),
  listingType: listingTypeEnum.optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  minBedrooms: z.coerce.number().int().min(0).optional(),
  maxBedrooms: z.coerce.number().int().min(0).optional(),
  amenities: z.array(z.string()).optional(),
  excludeViewed: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
