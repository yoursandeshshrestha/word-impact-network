import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Gender } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '@/utils/logger';

// Student registration validation schema (no password required)
const studentRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .required(),
  dateOfBirth: Joi.date().required(),
  phoneNumber: Joi.string().required(),
  country: Joi.string().required(),
  academicQualification: Joi.string().required(),
  desiredDegree: Joi.string().required(),
  referredBy: Joi.string().optional(),
  referrerContact: Joi.string().optional(),
  agreesToTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms and conditions',
  }),
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const studentProfileUpdateSchema = Joi.object({
  fullName: Joi.string().trim().optional().min(3).max(25),
  phoneNumber: Joi.string().trim().optional(),
  country: Joi.string().trim().optional(),
  dateOfBirth: Joi.date().optional(),
  gender: Joi.string().valid('MALE', 'FEMALE', 'OTHER').optional(),
}).messages({
  'string.empty': '{{#label}} cannot be empty',
  'date.base': '{{#label}} must be a valid date',
  'any.only': '{{#label}} must be one of [MALE, FEMALE, OTHER]',
});

// Video progress update validation schema
const videoProgressUpdateSchema = Joi.object({
  watchedPercent: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': 'Watched percent must be a number',
    'number.integer': 'Watched percent must be an integer',
    'number.min': 'Watched percent must be at least 0',
    'number.max': 'Watched percent must be at most 100',
    'any.required': 'Watched percent is required',
  }),
});

// Exam submission validation schema
const examSubmissionSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().uuid().required().messages({
          'string.uuid': 'Question ID must be a valid UUID',
          'any.required': 'Question ID is required for each answer',
        }),
        answer: Joi.string().required().messages({
          'string.empty': 'Answer cannot be empty',
          'any.required': 'Answer is required for each question',
        }),
      }),
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one answer is required',
      'any.required': 'Answers are required',
    }),
});

// Validation middleware for student registration
export const validateStudentRegistration = (req: Request, res: Response, next: NextFunction) => {
  // Convert string 'true'/'false' to boolean
  if (req.body.agreesToTerms === 'true') {
    req.body.agreesToTerms = true;
  } else if (req.body.agreesToTerms === 'false') {
    req.body.agreesToTerms = false;
  }

  const { error, value } = studentRegistrationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new AppError(errorMessage, 400, ErrorTypes.VALIDATION));
  }

  req.body = value;
  next();
};

// Validation middleware for student login
export const validateStudentLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');

    return next(new AppError(errorMessage, 400));
  }

  req.body = value;
  next();
};

// Validate student profile update
export const validateStudentProfileUpdate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { error } = studentProfileUpdateSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Student profile update validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate video progress update
export const validateVideoProgressUpdate = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { error } = videoProgressUpdateSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Video progress update validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate exam submission
export const validateExamSubmission = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { error } = examSubmissionSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Exam submission validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};
