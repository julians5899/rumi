export const RATING_CONTEXTS = {
  LANDLORD: 'LANDLORD',
  TENANT: 'TENANT',
  ROOMMATE: 'ROOMMATE',
} as const;

export type RatingContext = (typeof RATING_CONTEXTS)[keyof typeof RATING_CONTEXTS];

export const RATING_CONTEXT_LABELS: Record<RatingContext, string> = {
  LANDLORD: 'Arrendador',
  TENANT: 'Inquilino',
  ROOMMATE: 'Compañero de cuarto',
};

export const MIN_RATING = 1;
export const MAX_RATING = 5;
