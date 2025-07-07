import { PrismaClient } from '@prisma/client';
import { generateTokenId } from '../utils/jwt';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export interface RefreshTokenData {
  id: string;
  userId: string;
  tokenId: string;
  expiresAt: Date;
  isRevoked: boolean;
  createdAt: Date;
}

/**
 * Create a new refresh token record
 */
export const createRefreshToken = async (userId: string): Promise<RefreshTokenData> => {
  const tokenId = generateTokenId();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = await prisma.refreshToken.create({
    data: {
      tokenId,
      userId,
      expiresAt,
      isRevoked: false,
    },
  });

  logger.info('Refresh token created', { userId, tokenId });
  return refreshToken;
};

/**
 * Find a refresh token by tokenId
 */
export const findRefreshToken = async (tokenId: string): Promise<RefreshTokenData | null> => {
  return await prisma.refreshToken.findFirst({
    where: {
      tokenId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
  });
};

/**
 * Revoke a refresh token
 */
export const revokeRefreshToken = async (tokenId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: {
      tokenId,
    },
    data: {
      isRevoked: true,
    },
  });

  logger.info('Refresh token revoked', { tokenId });
};

/**
 * Revoke all refresh tokens for a user
 */
export const revokeAllUserRefreshTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      isRevoked: false,
    },
    data: {
      isRevoked: true,
    },
  });

  logger.info('All refresh tokens revoked for user', { userId });
};

/**
 * Clean up expired refresh tokens
 */
export const cleanupExpiredRefreshTokens = async (): Promise<number> => {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        {
          expiresAt: {
            lt: new Date(),
          },
        },
        {
          isRevoked: true,
        },
      ],
    },
  });

  logger.info('Expired refresh tokens cleaned up', { count: result.count });
  return result.count;
};

/**
 * Get active refresh tokens for a user
 */
export const getUserActiveRefreshTokens = async (userId: string): Promise<RefreshTokenData[]> => {
  return await prisma.refreshToken.findMany({
    where: {
      userId,
      isRevoked: false,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
};
