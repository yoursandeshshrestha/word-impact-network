import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import {
  createExamForChapter,
  getExamByIdWithQuestions,
  updateExamById,
  deleteExamById,
  addQuestionToExam,
  updateQuestionById,
  deleteQuestionById,
} from '@/services/exam.service';
import { catchAsync } from '@/utils/catchAsync';
import { sendSuccess } from '@/utils/responseHandler';
import { AppError, ErrorTypes } from '@/utils/appError';
import { logger } from '@/utils/logger';

const prisma = new PrismaClient();

// Create Exam for Chapter
export const createExam = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can create exams', 403, ErrorTypes.AUTHORIZATION);
  }

  const { chapterId } = req.params;
  const userId = req.user.userId;
  const examData = {
    title: req.body.title,
    description: req.body.description,
    timeLimit: req.body.timeLimit,
  };

  // Log the incoming request data
  logger.info('Creating exam for chapter', {
    chapterId,
    userId,
    examData: JSON.stringify(examData),
  });

  try {
    // First find the admin record using the userId from the token
    const admin = await prisma.admin.findFirst({
      where: { userId: userId },
    });

    if (!admin) {
      logger.warn('Admin record not found for userId', { userId });
      throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
    }

    logger.info('Found admin record', { adminId: admin.id, userId });

    // Now we have the actual adminId to pass to the service
    const exam = await createExamForChapter(chapterId, admin.id, examData);

    sendSuccess(res, 201, 'Exam created successfully', exam);
  } catch (error) {
    logger.error('Error in createExam controller', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw error;
  }
});

// Get Exam by ID
export const getExamById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const exam = await getExamByIdWithQuestions(id);

  sendSuccess(res, 200, 'Exam retrieved successfully', exam);
});

// Update Exam
export const updateExam = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can update exams', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id } = req.params;
  const userId = req.user.userId;
  const examData = {
    title: req.body.title,
    description: req.body.description,
    timeLimit: req.body.timeLimit,
  };

  // Find the admin record
  const admin = await prisma.admin.findFirst({
    where: { userId: userId },
  });

  if (!admin) {
    throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
  }

  const updatedExam = await updateExamById(id, admin.id, examData);

  sendSuccess(res, 200, 'Exam updated successfully', updatedExam);
});

// Delete Exam
export const deleteExam = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can delete exams', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id } = req.params;
  const userId = req.user.userId;

  // Find the admin record
  const admin = await prisma.admin.findFirst({
    where: { userId: userId },
  });

  if (!admin) {
    throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
  }

  await deleteExamById(id, admin.id);

  sendSuccess(res, 200, 'Exam deleted successfully', null);
});

// Add Question to Exam
export const addQuestion = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can add questions', 403, ErrorTypes.AUTHORIZATION);
  }

  const { examId } = req.params;
  const userId = req.user.userId;
  const questionData = req.body;

  // Find the admin record
  const admin = await prisma.admin.findFirst({
    where: { userId: userId },
  });

  if (!admin) {
    throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
  }

  const question = await addQuestionToExam(examId, admin.id, questionData);

  sendSuccess(res, 201, 'Question added successfully', question);
});

// Update Question
export const updateQuestion = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can update questions', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id, examId } = req.params;
  const userId = req.user.userId;
  const questionData = req.body;

  // Find the admin record
  const admin = await prisma.admin.findFirst({
    where: { userId: userId },
  });

  if (!admin) {
    throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Validate question belongs to the specified exam
  const updatedQuestion = await updateQuestionById(id, admin.id, questionData, examId);

  // Check if the update was restricted due to existing answers
  const message =
    updatedQuestion.restrictedUpdate === true
      ? 'Question partially updated (some fields were restricted due to existing answers)'
      : 'Question updated successfully';

  sendSuccess(res, 200, message, updatedQuestion);
});

// Delete Question
export const deleteQuestion = catchAsync(async (req: Request, res: Response) => {
  // Verify admin role
  if (!req.user || req.user.role !== UserRole.ADMIN) {
    throw new AppError('Only admins can delete questions', 403, ErrorTypes.AUTHORIZATION);
  }

  const { id, examId } = req.params;
  const userId = req.user.userId;

  // Find the admin record
  const admin = await prisma.admin.findFirst({
    where: { userId: userId },
  });

  if (!admin) {
    throw new AppError('Admin record not found', 404, ErrorTypes.NOT_FOUND);
  }

  // Validate question belongs to the specified exam
  await deleteQuestionById(id, admin.id, examId);

  sendSuccess(res, 200, 'Question deleted successfully', null);
});
