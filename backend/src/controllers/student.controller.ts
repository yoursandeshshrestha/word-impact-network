import { Request, Response } from 'express';
import {
  getStudentProfileByUserId,
  loginStudent,
  registerStudent as registerStudentService,
} from '../services/student.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { Gender } from '@prisma/client';
import { generateToken } from '@/utils/jwt';
import { ErrorTypes } from '@/utils/appError';
import { AppError } from '@/utils/appError';
import { logger } from '@/utils/logger';

// Register a new student
export const registerStudent = catchAsync(async (req: Request, res: Response) => {
  const {
    email,
    fullName,
    gender,
    dateOfBirth,
    phoneNumber,
    country,
    academicQualification,
    desiredDegree,
    referredBy,
    referrerContact,
    agreesToTerms,
  } = req.body;

  // Get files if they exist
  const files = req.files as
    | {
        [fieldname: string]: Express.Multer.File[];
      }
    | undefined;

  // Extract files if they exist
  const certificateFile = files?.certificate?.[0];
  const recommendationLetterFile = files?.recommendationLetter?.[0];

  const student = await registerStudentService(
    email,
    fullName,
    gender as Gender,
    new Date(dateOfBirth),
    phoneNumber,
    country,
    academicQualification,
    desiredDegree,
    certificateFile,
    recommendationLetterFile,
    referredBy,
    referrerContact,
    agreesToTerms === 'true' || agreesToTerms === true,
  );

  sendSuccess(res, 201, 'Student registered successfully. Your application is pending approval.', {
    id: student.id,
    email: student.email,
    fullName: student.fullName,
    applicationStatus: student.applicationStatus,
  });
});

// Login a student
export const loginStudentController = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const student = await loginStudent(email, password);

  // Generate JWT token
  const token = generateToken({
    userId: student.userId,
    email: student.email,
    role: student.role,
  });

  sendSuccess(res, 200, 'Login successful', {
    student: {
      id: student.id,
      email: student.email,
      fullName: student.fullName,
      role: student.role,
      applicationStatus: student.applicationStatus,
    },
    token,
  });
});

// Get student profile
export const getStudentProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    logger.error('User ID is required');
    throw new AppError('User ID is required', 400, ErrorTypes.VALIDATION);
  }

  const studentProfile = await getStudentProfileByUserId(userId);

  sendSuccess(res, 200, 'Student profile retrieved successfully', studentProfile);
});
