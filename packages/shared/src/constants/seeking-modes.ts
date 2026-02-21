export const SEEKING_MODES = {
  NONE: 'NONE',
  TENANT: 'TENANT',
  ROOMMATE: 'ROOMMATE',
} as const;

export type SeekingMode = (typeof SEEKING_MODES)[keyof typeof SEEKING_MODES];
