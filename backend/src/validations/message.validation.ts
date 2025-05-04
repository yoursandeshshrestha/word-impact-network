import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

// Message creation validation schema - simplified for single admin
const messageSchema = Joi.object({
  content: Joi.string().trim().required().min(1).max(2000).messages({
    'string.empty': 'Message content cannot be empty',
    'string.min': 'Message content must be at least 1 character',
    'string.max': 'Message content cannot exceed 2000 characters',
    'any.required': 'Message content is required',
  }),
});

// Message filter validation schema
const messageFilterSchema = Joi.object({
  filter: Joi.string().valid('all', 'sent', 'received', 'unread').default('all').messages({
    'any.only': 'Filter must be one of: all, sent, received, unread',
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be greater than 0',
  }),
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50',
  }),
});

// Validate message creation
export const validateMessage = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { error } = messageSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Message validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate message filter parameters
export const validateMessageFilter = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Convert query parameters to the right types
    if (req.query.page) {
      req.query.page = parseInt(req.query.page as string) as any;
    }

    if (req.query.limit) {
      req.query.limit = parseInt(req.query.limit as string) as any;
    }

    const { error, value } = messageFilterSchema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Message filter validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    // Apply validated and defaulted values
    req.query = value;

    next();
  } catch (error) {
    next(error);
  }
};
