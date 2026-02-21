export const PROPERTY_TYPES = {
  APARTMENT: 'APARTMENT',
  HOUSE: 'HOUSE',
  ROOM: 'ROOM',
  STUDIO: 'STUDIO',
} as const;

export type PropertyType = (typeof PROPERTY_TYPES)[keyof typeof PROPERTY_TYPES];

export const LISTING_TYPES = {
  RENT: 'RENT',
  SALE: 'SALE',
} as const;

export type ListingType = (typeof LISTING_TYPES)[keyof typeof LISTING_TYPES];

export const AMENITIES = [
  'wifi',
  'parking',
  'laundry',
  'gym',
  'pool',
  'security',
  'elevator',
  'furnished',
  'pets_allowed',
  'balcony',
  'air_conditioning',
  'hot_water',
] as const;

export type Amenity = (typeof AMENITIES)[number];
