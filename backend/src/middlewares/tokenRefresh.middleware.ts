import { Request, Response, NextFunction } from 'express';
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from '../utils/jwt';
import {
  findRefreshToken,
  revokeRefreshToken,
  createRefreshToken,
} from '../services/refreshToken.service';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { selectTokens, getCookieNames } from '../utils/tokenUtils';

const prisma = new PrismaClient();

/**
 * Extract token from Authorization header
 */
const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
};

/**
 * Middleware to handle automatic token refresh
 * This middleware checks if the access token is expired and attempts to refresh it
 * Handles different token names for admin and frontend applications
 * Implements intelligent token selection to avoid conflicts
 */
export const handleTokenRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Get access token from Authorization header
    const accessToken = extractTokenFromHeader(req.headers.authorization);

    if (!accessToken) {
      // No access token, try to get from cookies with intelligent selection
      const tokenSelection = selectTokens(req);
      const cookieAccessToken = tokenSelection.accessToken;

      if (!cookieAccessToken) {
        next();
        return;
      }

      // Verify the cookie access token
      const decoded = verifyAccessToken(cookieAccessToken);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
        next();
        return;
      }
    } else {
      // Verify the header access token
      const decoded = verifyAccessToken(accessToken);
      if (decoded) {
        req.user = {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
        };
        next();
        return;
      }
    }

    // Access token is invalid or expired, try to refresh
    // Use intelligent refresh token selection
    const tokenSelection = selectTokens(req);
    const refreshToken = tokenSelection.refreshToken;

    if (!refreshToken) {
      next();
      return;
    }

    // Verify refresh token
    const refreshDecoded = verifyRefreshToken(refreshToken);
    if (!refreshDecoded) {
      next();
      return;
    }

    // Check if refresh token exists in database
    const refreshTokenRecord = await findRefreshToken(refreshDecoded.tokenId);
    if (!refreshTokenRecord) {
      next();
      return;
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: refreshDecoded.userId },
      include: { admin: true, student: true },
    });

    if (!user) {
      next();
      return;
    }

    // Determine token type based on user role and route context
    const isAdmin = user.role === 'ADMIN' && user.admin;
    const isStudent = user.role === 'STUDENT' && user.student;
    const isAdminRoute = req.path.startsWith('/admin');
    const isStudentRoute = req.path.startsWith('/student') || req.path.startsWith('/mylearning');

    let tokenType: 'admin' | 'frontend';

    // Handle admin routes - only use admin tokens
    if (isAdminRoute) {
      if (isAdmin) {
        tokenType = 'admin';
      } else {
        // If not an admin user on admin route, this is an error
        logger.warn('Non-admin user attempting to access admin route', {
          userId: user.id,
          role: user.role,
          path: req.path,
        });
        tokenType = 'admin'; // Still use admin token type for proper error handling
      }
    } else if (isStudentRoute) {
      // Handle student routes - only use frontend tokens
      if (isStudent) {
        tokenType = 'frontend';
      } else {
        // If not a student user on student route, this is an error
        logger.warn('Non-student user attempting to access student route', {
          userId: user.id,
          role: user.role,
          path: req.path,
        });
        tokenType = 'frontend'; // Still use frontend token type for proper error handling
      }
    } else {
      // For ambiguous routes, use the user role to determine token type
      if (isAdmin) {
        tokenType = 'admin';
      } else if (isStudent) {
        tokenType = 'frontend';
      } else {
        // Default to frontend for ambiguous routes
        tokenType = 'frontend';
      }
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Revoke old refresh token and create new one (token rotation)
    await revokeRefreshToken(refreshDecoded.tokenId);
    const newRefreshTokenRecord = await createRefreshToken(user.id);
    const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenRecord.tokenId);

    // Set new cookies based on token type
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieNames = getCookieNames(tokenType);

    res.cookie(cookieNames.accessToken, newAccessToken, {
      httpOnly: tokenType === 'admin', // httpOnly for admin, not for frontend
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    res.cookie(cookieNames.refreshToken, newRefreshToken, {
      httpOnly: tokenType === 'admin', // httpOnly for admin, not for frontend
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    // Set user info for the request
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    logger.info('Token refreshed automatically', {
      userId: user.id,
      tokenType,
    });
    next();
  } catch (error) {
    logger.error('Error in token refresh middleware', { error });
    next();
  }
};
