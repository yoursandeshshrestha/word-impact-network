import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Make sure to add these to your .env file
const JWT_SECRET = (process.env.JWT_SECRET as string) || 'your-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as string) || '7d';

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

/**
 * Generate a JWT token for a user
 * @param payload User data to include in the token
 * @returns JWT token string
 */
export const generateToken = (payload: TokenPayload): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1d',
  });
};

/**
 * Verify and decode a JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};

/**
 * Extract token from Authorization header
 * @param authHeader Authorization header value
 * @returns Token string or null if not found
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.split(' ')[1];
};
