import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorTypes } from '@/utils/appError';

// Exam validation schema
const examSchema = Joi.object({
  title: Joi.string().required().trim().min(3).max(100),
  description: Joi.string().allow('', null),
  timeLimit: Joi.number().allow(null).min(1),
});

// Question validation schema
const questionSchema = Joi.object({
  text: Joi.string().required().trim().min(3),
  questionType: Joi.string().required().valid('multiple_choice', 'true_false', 'essay'),
  options: Joi.when('questionType', {
    is: 'multiple_choice',
    then: Joi.array().min(2).required(),
    otherwise: Joi.allow(null),
  }),
  correctAnswer: Joi.when('questionType', {
    is: Joi.valid('multiple_choice', 'true_false'),
    then: Joi.string().required(),
    otherwise: Joi.allow(null),
  }),
  points: Joi.number().default(1).min(1),
}).unknown(false);

// Validate exam request
export const validateExam = (req: Request, res: Response, next: NextFunction) => {
  const { error } = examSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new AppError(errorMessage, 400, ErrorTypes.VALIDATION));
  }

  next();
};

// Validate question request
export const validateQuestion = (req: Request, res: Response, next: NextFunction) => {
  const { error } = questionSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    return next(new AppError(errorMessage, 400, ErrorTypes.VALIDATION));
  }

  next();
};
