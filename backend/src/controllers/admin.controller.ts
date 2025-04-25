import { Request, Response, NextFunction } from 'express';
import { createAdmin, loginAdmin } from '../services/admin.service';
import { generateToken } from '../utils/jwt';
import { sendSuccess } from '../utils/responseHandler';

// Simple wrapper to eliminate try/catch blocks
const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

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

export const loginAdminController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await loginAdmin(email, password);
  const token = generateToken({
    userId: admin.id,
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
