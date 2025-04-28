import { Request, Response } from 'express';
import { createAdmin, getAdminProfileById, loginAdmin } from '../services/admin.service';
import { generateToken } from '../utils/jwt';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';

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
  const token = generateToken({
    userId: admin.userId,
    email: admin.email,
    role: admin.role,
  });

  sendSuccess(res, 200, 'Login successful', {
    admin: {
      id: admin.id,
      email: admin.email,
      fullName: admin.fullName,
      role: admin.role,
    },
    token,
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
