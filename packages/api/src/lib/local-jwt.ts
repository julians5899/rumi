import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'rumi-local-dev-secret';
const EXPIRES_IN = '7d';

export interface LocalJwtPayload {
  sub: string;
  email: string;
}

export function signLocalToken(payload: LocalJwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyLocalToken(token: string): LocalJwtPayload {
  return jwt.verify(token, SECRET) as LocalJwtPayload;
}
