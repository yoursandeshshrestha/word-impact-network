// src/controllers/student.controller.ts
import { Request, Response } from 'express';
import { registerStudent as registerStudentService } from '../services/student.service';
import { sendSuccess } from '../utils/responseHandler';
import { catchAsync } from '../utils/catchAsync';
import { Gender } from '@prisma/client';

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
    applicationId: student.applicationId,
    applicationStatus: student.applicationStatus,
  });
});
