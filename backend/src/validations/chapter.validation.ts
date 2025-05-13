import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/responseHandler';
import { ErrorTypes } from '../utils/appError';

/**
 * Validate create chapter request
 */
export const validateCreateChapter = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().required().trim().min(3).max(100).messages({
      'string.base': 'Title must be a string',
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 100 characters',
      'any.required': 'Title is required',
    }),
    description: Joi.string().required().trim().min(10).messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'any.required': 'Description is required',
    }),
    orderIndex: Joi.number().integer().min(0).required().messages({
      'number.base': 'Order index must be a number',
      'number.integer': 'Order index must be an integer',
      'number.min': 'Order index must be a positive number',
      'any.required': 'Order index is required',
    }),
    courseYear: Joi.number().integer().min(1).required().messages({
      'number.base': 'Course year must be a number',
      'number.integer': 'Course year must be an integer',
      'number.min': 'Course year must be at least 1',
      'any.required': 'Course year is required',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [ErrorTypes.VALIDATION]);
  }

  next();
};

/**
 * Validate update chapter request
 */
export const validateUpdateChapter = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(100).messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 100 characters',
    }),
    description: Joi.string().trim().min(10).messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must be at least 10 characters long',
    }),
    orderIndex: Joi.number().integer().min(0).messages({
      'number.base': 'Order index must be a number',
      'number.integer': 'Order index must be an integer',
      'number.min': 'Order index must be a positive number',
    }),
    courseYear: Joi.number().integer().min(1).messages({
      'number.base': 'Course year must be a number',
      'number.integer': 'Course year must be an integer',
      'number.min': 'Course year must be at least 1',
    }),
  }).min(1); // At least one field should be provided

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [ErrorTypes.VALIDATION]);
  }

  next();
};

/**
 * Validate reorder chapter request
 */
export const validateReorderChapter = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    newOrderIndex: Joi.number().integer().min(1).required().messages({
      'number.base': 'New order index must be a number',
      'number.integer': 'New order index must be an integer',
      'number.min': 'New order index must be at least 1',
      'any.required': 'New order index is required',
    }),
    newCourseYear: Joi.number().integer().min(1).optional().messages({
      'number.base': 'New course year must be a number',
      'number.integer': 'New course year must be an integer',
      'number.min': 'New course year must be at least 1',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [ErrorTypes.VALIDATION]);
  }

  next();
};
