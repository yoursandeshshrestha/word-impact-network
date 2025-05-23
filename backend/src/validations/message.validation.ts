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

const adminMessageSchema = Joi.object({
  content: Joi.string().trim().required().min(1).max(2000).messages({
    'string.empty': 'Message content cannot be empty',
    'string.min': 'Message content must be at least 1 character',
    'string.max': 'Message content cannot exceed 2000 characters',
    'any.required': 'Message content is required',
  }),
  recipientId: Joi.string().required().messages({
    'string.empty': 'Recipient ID cannot be empty',
    'any.required': 'Recipient ID is required',
  }),
});

// Conversation query validation schema for pagination
const conversationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be greater than 0',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100',
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
    // Instead of modifying req.query, store the validated values separately
    const { error, value } = messageFilterSchema.validate(req.query, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Message filter validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    // Store the validated values in a custom property instead of overwriting req.query
    (req as any).validatedQuery = value;

    next();
  } catch (error) {
    next(error);
  }
};

// Validate admin message creation
export const validateAdminMessage = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { error } = adminMessageSchema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Admin message validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Validate conversation query parameters (for pagination)
export const validateConversationQuery = (req: Request, _res: Response, next: NextFunction) => {
  try {
    // Convert string query params to numbers if possible
    const queryParams = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    const { error, value } = conversationQuerySchema.validate(queryParams, { abortEarly: false });

    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      logger.warn('Conversation query validation failed', { errors: errorMessage });
      throw new AppError(errorMessage, 400, ErrorTypes.VALIDATION);
    }

    // Store the validated values in a custom property
    (req as any).validatedQuery = value;

    next();
  } catch (error) {
    next(error);
  }
};

// Validate conversation partner ID
export const validatePartnerId = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { partnerId } = req.params;

    if (!partnerId || typeof partnerId !== 'string' || partnerId.trim() === '') {
      logger.warn('Partner ID validation failed', { partnerId });
      throw new AppError('Valid partner ID is required', 400, ErrorTypes.VALIDATION);
    }

    next();
  } catch (error) {
    next(error);
  }
};
