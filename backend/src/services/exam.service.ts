import { PrismaClient, Question } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Define an extended question type that includes the restrictedUpdate property
interface QuestionWithRestriction extends Question {
  restrictedUpdate?: boolean;
  message?: string;
}

// Create a new exam for a chapter
export async function createExamForChapter(
  chapterId: string,
  adminId: string,
  examData: {
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimit?: number | null;
  },
) {
  try {
    logger.info('Creating new exam for chapter', { chapterId, adminId });

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { exam: true },
    });

    if (!chapter) {
      logger.warn('Create exam failed - chapter not found', { chapterId });
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if exam already exists for this chapter
    if (chapter.exam) {
      logger.warn('Create exam failed - exam already exists for chapter', {
        chapterId,
        examId: chapter.exam.id,
      });
      throw new AppError('Exam already exists for this chapter', 400, ErrorTypes.DUPLICATE);
    }

    // Create new exam
    const exam = await prisma.exam.create({
      data: {
        title: examData.title,
        description: examData.description,
        passingScore: examData.passingScore,
        timeLimit: examData.timeLimit,
        chapter: {
          connect: { id: chapterId },
        },
        createdBy: {
          connect: { id: adminId },
        },
      },
    });

    logger.info('Exam created successfully', { examId: exam.id, chapterId });
    return exam;
  } catch (error) {
    logger.error('Error in createExamForChapter', {
      chapterId,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get exam by ID
export async function getExamByIdWithQuestions(examId: string) {
  try {
    logger.info('Fetching exam by ID', { examId });

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        chapter: {
          select: {
            id: true,
            title: true,
            courseId: true,
          },
        },
        questions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        createdBy: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
    });

    if (!exam) {
      logger.warn('Get exam failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    logger.info('Exam retrieved successfully', { examId });
    return exam;
  } catch (error) {
    logger.error('Error in getExamByIdWithQuestions', {
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update exam
export async function updateExamById(
  examId: string,
  adminId: string,
  examData: {
    title: string;
    description?: string | null;
    passingScore: number;
    timeLimit?: number | null;
  },
) {
  try {
    logger.info('Updating exam', { examId, adminId });

    // Check if exam exists and admin has permission
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      logger.warn('Update exam failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Update exam
    const updatedExam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: examData.title,
        description: examData.description,
        passingScore: examData.passingScore,
        timeLimit: examData.timeLimit,
      },
      include: {
        questions: true,
      },
    });

    logger.info('Exam updated successfully', { examId });
    return updatedExam;
  } catch (error) {
    logger.error('Error in updateExamById', {
      examId,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Delete exam
export async function deleteExamById(examId: string, adminId: string) {
  try {
    logger.info('Deleting exam', { examId, adminId });

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        examAttempts: {
          take: 1,
        },
      },
    });

    if (!exam) {
      logger.warn('Delete exam failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if there are exam attempts - if so, don't allow deletion
    if (exam.examAttempts.length > 0) {
      logger.warn('Delete exam failed - exam has attempts', { examId });
      throw new AppError(
        'Cannot delete exam with existing student attempts',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Delete all questions first
    await prisma.question.deleteMany({
      where: {
        examId: examId,
      },
    });

    // Then delete the exam
    await prisma.exam.delete({
      where: { id: examId },
    });

    logger.info('Exam deleted successfully', { examId });
    return { success: true };
  } catch (error) {
    logger.error('Error in deleteExamById', {
      examId,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Add question to exam
export async function addQuestionToExam(
  examId: string,
  adminId: string,
  questionData: {
    text: string;
    questionType: string;
    options?: any | null;
    correctAnswer?: string | null;
    points: number;
  },
) {
  try {
    logger.info('Adding question to exam', { examId, adminId });

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
    });

    if (!exam) {
      logger.warn('Add question failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Validate options for multiple choice
    if (
      questionData.questionType === 'multiple_choice' &&
      (!questionData.options ||
        !Array.isArray(questionData.options) ||
        questionData.options.length < 2)
    ) {
      throw new AppError(
        'Multiple choice questions require at least 2 options',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Ensure options is stored as JSON
    let optionsJson = null;
    if (questionData.options) {
      optionsJson = Array.isArray(questionData.options)
        ? questionData.options
        : typeof questionData.options === 'string'
          ? JSON.parse(questionData.options)
          : questionData.options;
    }

    // Create new question
    const question = await prisma.question.create({
      data: {
        text: questionData.text,
        questionType: questionData.questionType,
        options: optionsJson,
        correctAnswer: questionData.correctAnswer,
        points: questionData.points,
        exam: {
          connect: { id: examId },
        },
      },
    });

    logger.info('Question added successfully', { questionId: question.id, examId });
    return question;
  } catch (error) {
    logger.error('Error in addQuestionToExam', {
      examId,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update question
export async function updateQuestionById(
  questionId: string,
  adminId: string,
  questionData: {
    text: string;
    questionType: string;
    options?: any | null;
    correctAnswer?: string | null;
    points: number;
  },
  examId?: string,
): Promise<QuestionWithRestriction> {
  try {
    logger.info('Updating question', { questionId, adminId, examId });

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: true,
      },
    });

    if (!question) {
      logger.warn('Update question failed - question not found', { questionId });
      throw new AppError('Question not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify question belongs to the specified exam if provided
    if (examId && question.exam.id !== examId) {
      logger.warn('Update question failed - question does not belong to specified exam', {
        questionId,
        questionExamId: question.exam.id,
        providedExamId: examId,
      });
      throw new AppError('Question does not belong to this exam', 400, ErrorTypes.VALIDATION);
    }

    // Validate options for multiple choice
    if (
      questionData.questionType === 'multiple_choice' &&
      (!questionData.options ||
        !Array.isArray(questionData.options) ||
        questionData.options.length < 2)
    ) {
      throw new AppError(
        'Multiple choice questions require at least 2 options',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Ensure options is stored as JSON
    let optionsJson = null;
    if (questionData.options) {
      optionsJson = Array.isArray(questionData.options)
        ? questionData.options
        : typeof questionData.options === 'string'
          ? JSON.parse(questionData.options)
          : questionData.options;
    }

    // Check if question already has answers - if so, restrict updates
    const hasAnswers = await prisma.answer.findFirst({
      where: {
        questionId: questionId,
      },
    });

    if (hasAnswers) {
      logger.warn('Restricted question update - question has answers', { questionId });

      // Only allow updating text and points if question has answers
      const updatedQuestion = await prisma.question.update({
        where: { id: questionId },
        data: {
          text: questionData.text,
          points: questionData.points,
        },
      });

      logger.info('Question partially updated (has answers)', { questionId });
      return {
        ...updatedQuestion,
        restrictedUpdate: true,
        message: 'Question has answers - only text and points were updated',
      };
    }

    // Full update if no answers exist
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: questionData.text,
        questionType: questionData.questionType,
        options: optionsJson,
        correctAnswer: questionData.correctAnswer,
        points: questionData.points,
      },
    });

    logger.info('Question updated successfully', { questionId });
    return updatedQuestion;
  } catch (error) {
    logger.error('Error in updateQuestionById', {
      questionId,
      adminId,
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Delete question
export async function deleteQuestionById(questionId: string, adminId: string, examId?: string) {
  try {
    logger.info('Deleting question', { questionId, adminId, examId });

    // Check if question exists
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        exam: true,
      },
    });

    if (!question) {
      logger.warn('Delete question failed - question not found', { questionId });
      throw new AppError('Question not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify question belongs to the specified exam if provided
    if (examId && question.exam.id !== examId) {
      logger.warn('Delete question failed - question does not belong to specified exam', {
        questionId,
        questionExamId: question.exam.id,
        providedExamId: examId,
      });
      throw new AppError('Question does not belong to this exam', 400, ErrorTypes.VALIDATION);
    }

    // Check if question has answers
    const hasAnswers = await prisma.answer.findFirst({
      where: {
        questionId: questionId,
      },
    });

    if (hasAnswers) {
      logger.warn('Delete question failed - question has answers', { questionId });
      throw new AppError(
        'Cannot delete question with existing answers',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Delete the question
    await prisma.question.delete({
      where: { id: questionId },
    });

    logger.info('Question deleted successfully', { questionId });
    return { success: true };
  } catch (error) {
    logger.error('Error in deleteQuestionById', {
      questionId,
      adminId,
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
