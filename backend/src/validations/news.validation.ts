import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorTypes } from '../utils/appError';

// Create news validation schema
const createNewsSchema = Joi.object({
  title: Joi.string().required().min(1).max(255),
  description: Joi.string().optional().allow('').max(5000),
  isActive: Joi.boolean().optional().default(true),
});

// Update news validation schema
const updateNewsSchema = Joi.object({
  title: Joi.string().optional().min(1).max(255),
  description: Joi.string().optional().allow('').max(5000),
  isActive: Joi.boolean().optional(),
});

// Validation middleware for creating news
export const validateCreateNews = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = createNewsSchema.validate(req.body, {
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

// Validation middleware for updating news
export const validateUpdateNews = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = updateNewsSchema.validate(req.body, {
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
