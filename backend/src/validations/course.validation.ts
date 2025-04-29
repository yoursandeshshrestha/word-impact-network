import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorTypes } from '../utils/appError';

// Create course validation schema
const createCourseSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  durationYears: Joi.string()
    .required()
    .custom((value, helpers) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        return helpers.error('any.invalid');
      }
      return num;
    }, 'durationYears conversion'),
  coverImageUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional().default(true),
});

// Update course validation schema
const updateCourseSchema = Joi.object({
  title: Joi.string().optional(),
  description: Joi.string().optional(),
  durationYears: Joi.string()
    .optional()
    .allow('')
    .custom((value, helpers) => {
      if (!value) return undefined; // Return undefined if empty string or not provided
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        return helpers.error('any.invalid');
      }
      return num;
    }, 'durationYears conversion'),
  coverImageUrl: Joi.string().uri().optional(),
  isActive: Joi.boolean().optional(),
});

// Validation middleware for creating a course
export const validateCreateCourse = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createCourseSchema.validate(req.body, {
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

// Validation middleware for updating a course
export const validateUpdateCourse = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateCourseSchema.validate(req.body, {
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
