import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// Make sure to add these to your .env file
const JWT_SECRET = (process.env.JWT_SECRET as string) || 'your-secret-key';
const JWT_REFRESH_SECRET = (process.env.JWT_REFRESH_SECRET as string) || 'your-refresh-secret-key';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN as string) || '15m'; // Short-lived access tokens
const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN as string) || '7d'; // Long-lived refresh tokens

interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  tokenType: 'access' | 'refresh';
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string; // Unique identifier for refresh token
  tokenType: 'refresh';
}

/**
 * Generate a JWT access token for a user
 * @param payload User data to include in the token
 * @returns JWT token string
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'tokenType'>): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign({ ...payload, tokenType: 'access' as const }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Generate a JWT refresh token for a user
 * @param userId User ID
 * @param tokenId Unique token identifier
 * @returns JWT refresh token string
 */
export const generateRefreshToken = (userId: string, tokenId: string): string => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  return jwt.sign({ userId, tokenId, tokenType: 'refresh' as const }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  } as jwt.SignOptions);
};

/**
 * Verify and decode a JWT access token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Ensure it's an access token
    if (decoded.tokenType !== 'access') {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};

/**
 * Verify and decode a JWT refresh token
 * @param token JWT refresh token to verify
 * @returns Decoded refresh token payload or null if invalid
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not defined');
  }

  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;

    // Ensure it's a refresh token
    if (decoded.tokenType !== 'refresh') {
      return null;
    }

    return decoded;
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

/**
 * Generate a unique token ID for refresh tokens
 * @returns Unique token identifier
 */
export const generateTokenId = (): string => {
  return `rt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if a token is expired
 * @param token JWT token
 * @param secret JWT secret to use for verification
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string, secret: string): boolean => {
  try {
    const decoded = jwt.decode(token) as any;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};
