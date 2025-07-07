import { Request, Response } from 'express';
import {
  completePasswordReset,
  createAdmin,
  getAdminDashboardStats,
  getAdminProfileById,
  getAllStudentsWithSearch,
  initiatePasswordReset,
  loginAdmin,
} from '../services/admin.service';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { createRefreshToken } from '../services/refreshToken.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';
import { PrismaClient } from '@prisma/client';
import { clearAdminAuthCookies } from '../utils/tokenUtils';

const prisma = new PrismaClient();

// Register a new admin
export const registerAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password, fullName, adminCreationSecret } = req.body;

  const admin = await createAdmin(email, password, fullName, adminCreationSecret);

  sendSuccess(res, 201, 'Admin created successfully', {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role,
  });
});

// Login an admin
export const loginAdminController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await loginAdmin(email, password);

  // Create refresh token record
  const refreshTokenRecord = await createRefreshToken(admin.userId);

  // Generate tokens
  const accessToken = generateAccessToken({
    userId: admin.userId,
    email: admin.email,
    role: admin.role,
  });

  const refreshToken = generateRefreshToken(admin.userId, refreshTokenRecord.tokenId);

  // Set secure HTTP-only cookies
  const isProduction = process.env.NODE_ENV === 'production';

  // Determine cookie domain for production
  const cookieDomain = isProduction ? '.wordimpactnetwork.org' : undefined;

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: cookieDomain,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: cookieDomain,
  });

  sendSuccess(res, 200, 'Login successful', {
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    },
  });
});

// Get admin profile
export const getAdminProfile = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const userId = req.user.userId;
  const adminProfile = await getAdminProfileById(userId);

  sendSuccess(res, 200, 'Admin profile retrieved successfully', adminProfile);
});

// Request password reset
export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { oldPassword, newPassword } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  // Validate password requirements
  if (newPassword.length < 8) {
    throw new AppError(
      'New password must be at least 8 characters long',
      400,
      ErrorTypes.VALIDATION,
    );
  }

  // Request the password reset and send email with secret code
  const resetData = await initiatePasswordReset(userId, oldPassword, newPassword);

  sendSuccess(res, 200, 'Password reset verification code sent to your email', {
    message: 'Please check your email for the verification code',
    resetId: resetData.resetId,
  });
});

// Verify password reset
export const verifyPasswordReset = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const { resetId, verificationCode } = req.body;

  if (!userId) {
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  if (!resetId || !verificationCode) {
    throw new AppError('Reset ID and verification code are required', 400, ErrorTypes.VALIDATION);
  }

  // Complete the password reset
  await completePasswordReset(userId, resetId, verificationCode);

  sendSuccess(res, 200, 'Password reset successful', {
    message: 'Your password has been updated successfully',
  });
});

// Logout admin
export const logoutAdmin = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // Clear only admin authentication cookies
  clearAdminAuthCookies(res);

  // Revoke all refresh tokens for the user
  const { revokeAllUserRefreshTokens } = await import('../services/refreshToken.service');
  await revokeAllUserRefreshTokens(req.user.userId);

  sendSuccess(res, 200, 'Logout successful', null);
});

// Refresh access token
export const refreshAccessToken = catchAsync(async (req: Request, res: Response) => {
  // Get admin refresh token
  const { getAdminTokens } = await import('../utils/tokenUtils');
  const tokenSelection = getAdminTokens(req);

  const refreshToken = tokenSelection.refreshToken;

  if (!refreshToken) {
    throw new AppError('Refresh token required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { verifyRefreshToken } = await import('../utils/jwt');
  const { findRefreshToken, revokeRefreshToken } = await import('../services/refreshToken.service');

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
    include: { admin: true },
  });

  if (!user || !user.admin) {
    throw new AppError('User not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Generate new access token
  const { generateAccessToken } = await import('../utils/jwt');
  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Revoke old refresh token and create new one (token rotation)
  await revokeRefreshToken(decoded.tokenId);
  const newRefreshTokenRecord = await createRefreshToken(user.id);
  const newRefreshToken = generateRefreshToken(user.id, newRefreshTokenRecord.tokenId);

  // Set new cookies using the appropriate cookie names
  const isProduction = process.env.NODE_ENV === 'production';
  const { getCookieNames } = await import('../utils/tokenUtils');
  const cookieNames = getCookieNames('admin');

  // Determine cookie domain for production
  const cookieDomain = isProduction ? '.wordimpactnetwork.org' : undefined;

  res.cookie(cookieNames.accessToken, newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
    domain: cookieDomain,
  });

  res.cookie(cookieNames.refreshToken, newRefreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
    domain: cookieDomain,
  });

  sendSuccess(res, 200, 'Token refreshed successfully', {
    admin: {
      id: user.admin.id,
      email: user.email,
      fullName: user.admin.fullName,
      role: user.role,
    },
  });
});

// get all students
export const getAllStudentsController = catchAsync(async (req: Request, res: Response) => {
  const search = req.query.search as string | undefined;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '10', 10);

  const { students, total, totalPages } = await getAllStudentsWithSearch(search, page, limit);

  sendSuccess(res, 200, 'Students retrieved successfully', {
    students,
    pagination: {
      total,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

// Get admin dashboard statistics
export const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // Get dashboard statistics
  const dashboardStats = await getAdminDashboardStats();

  sendSuccess(res, 200, 'Dashboard statistics retrieved successfully', dashboardStats);
});
