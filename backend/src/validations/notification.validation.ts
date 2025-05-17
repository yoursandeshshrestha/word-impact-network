import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

// Notification query validation schema
const notificationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be greater than 0',
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
  }),
  unreadOnly: Joi.string().valid('true', 'false').default('false').messages({
    'any.only': 'unreadOnly must be either "true" or "false"',
  }),
});

// Validate notification id
export const validateNotificationId = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      logger.warn('Notification ID validation failed', { id });
      throw new AppError('Valid notification ID is required', 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate notification query parameters
export const validateNotificationQuery = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Convert string query params to numbers if possible
    const queryParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      unreadOnly: req.query.unreadOnly as string | undefined,
    };

    const { error, value } = notificationQuerySchema.validate(queryParams, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Notification query validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    // Store the validated values in a custom property
    (req as any).validatedQuery = value;

    next();
  } catch (error) {
    next(error);
  }
};
