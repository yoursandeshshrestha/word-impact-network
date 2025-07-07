import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { sendError } from '../utils/responseHandler';
import { ErrorTypes } from '../utils/appError';

/**
 * Validate create video request
 */
export const validateCreateVideo = (req: Request, res: Response, next: NextFunction) => {
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
    duration: Joi.number().integer().min(1).required().messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be at least 1 second',
      'any.required': 'Duration is required',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [error.details[0].message]);
  }

  if (!req.file) {
    return sendError(res, 400, 'Video file is required', ['Video file is required']);
  }

  next();
};

/**
 * Validate create video with Vimeo ID (for direct-to-Vimeo uploads)
 */
export const validateCreateVideoWithVimeo = (req: Request, res: Response, next: NextFunction) => {
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
    duration: Joi.number().integer().min(1).required().messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be at least 1 second',
      'any.required': 'Duration is required',
    }),
    vimeoId: Joi.string().required().messages({
      'string.base': 'Vimeo ID must be a string',
      'string.empty': 'Vimeo ID is required',
      'any.required': 'Vimeo ID is required',
    }),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [error.details[0].message]);
  }

  next();
};

/**
 * Validate update video request
 */
export const validateUpdateVideo = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    title: Joi.string().trim().min(3).max(100).messages({
      'string.base': 'Title must be a string',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title must not exceed 100 characters',
    }),
    description: Joi.string().required().trim().min(10).messages({
      'string.base': 'Description must be a string',
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'any.required': 'Description is required',
    }),
    orderIndex: Joi.number().integer().min(0).messages({
      'number.base': 'Order index must be a number',
      'number.integer': 'Order index must be an integer',
      'number.min': 'Order index must be a positive number',
    }),
    duration: Joi.number().integer().min(1).messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be an integer',
      'number.min': 'Duration must be at least 1 second',
    }),
  }).min(1); // At least one field should be provided

  const { error } = schema.validate(req.body);
  if (error) {
    return sendError(res, 400, error.details[0].message, [error.details[0].message]);
  }

  next();
};
