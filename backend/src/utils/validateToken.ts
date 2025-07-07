import express, { Request, Response, Router } from 'express';
import { verifyAccessToken, verifyRefreshToken } from './jwt';
import { findRefreshToken } from '../services/refreshToken.service';
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { sendSuccess, sendError } from './responseHandler';
import { catchAsync } from './catchAsync';
import { AppError, ErrorTypes } from './appError';
import dotenv from 'dotenv';

dotenv.config();

const router: express.Router = express.Router();
const prisma = new PrismaClient();

// Validate student token and return user info
(router as any).get(
  '/validate-token',
  catchAsync(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Missing or invalid Authorization header', 401, ErrorTypes.AUTHENTICATION);
    }

    const token = authHeader.split(' ')[1];

    // Verify the access token
    const decoded = verifyAccessToken(token);
    if (!decoded) {
      throw new AppError('Invalid or expired token', 401, ErrorTypes.AUTHENTICATION);
    }

    // Get user information from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if user is a student
    if (user.role !== 'STUDENT' || !user.student) {
      throw new AppError('Access denied - student account required', 403, ErrorTypes.AUTHORIZATION);
    }

    // Check if student's application is approved
    if (user.student.applicationStatus !== 'APPROVED') {
      throw new AppError('Student application not approved', 403, ErrorTypes.AUTHORIZATION);
    }

    sendSuccess(res, 200, 'Token is valid', {
      user: {
        userId: user.id,
        email: user.email,
        role: user.role,
        student: {
          id: user.student.id,
          fullName: user.student.fullName,
          applicationStatus: user.student.applicationStatus,
        },
      },
    });
  }),
);

// Validate refresh token
(router as any).get(
  '/validate-refresh-token',
  catchAsync(async (req: Request, res: Response) => {
    // Get refresh token from either admin or frontend cookies
    const adminRefreshToken = req.cookies['refreshToken'];
    const frontendRefreshToken = req.cookies['client-refresh-token-win'];
    const refreshToken = adminRefreshToken || frontendRefreshToken;

    if (!refreshToken) {
      throw new AppError('Refresh token required', 401, ErrorTypes.AUTHENTICATION);
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new AppError('Invalid refresh token', 401, ErrorTypes.AUTHENTICATION);
    }

    // Check if refresh token exists in database and is not revoked
    const refreshTokenRecord = await findRefreshToken(decoded.tokenId);
    if (!refreshTokenRecord) {
      throw new AppError('Refresh token not found or revoked', 401, ErrorTypes.AUTHENTICATION);
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { student: true, admin: true },
    });

    if (!user) {
      throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Handle admin users
    if (user.role === 'ADMIN' && user.admin) {
      sendSuccess(res, 200, 'Refresh token is valid', {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          admin: {
            id: user.admin.id,
            fullName: user.admin.fullName,
          },
        },
      });
      return;
    }

    // Handle student users
    if (user.role === 'STUDENT' && user.student) {
      // Check if student's application is approved
      if (user.student.applicationStatus !== 'APPROVED') {
        throw new AppError('Student application not approved', 403, ErrorTypes.AUTHORIZATION);
      }

      sendSuccess(res, 200, 'Refresh token is valid', {
        user: {
          userId: user.id,
          email: user.email,
          role: user.role,
          student: {
            id: user.student.id,
            fullName: user.student.fullName,
            applicationStatus: user.student.applicationStatus,
          },
        },
      });
      return;
    }

    throw new AppError('Invalid user type', 403, ErrorTypes.AUTHORIZATION);
  }),
);

export default router;
