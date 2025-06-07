import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError, ErrorTypes } from '../utils/appError';
import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { logger } from '../utils/logger';

// Middleware to handle 404 routes
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(AppError.notFound(`Route not found: ${req.originalUrl}`));
};

// Handle Prisma errors and convert them to AppError format
const handlePrismaErrors = (err: Error) => {
  // Handle Prisma's known request errors (e.g., unique constraint violations)
  if (err instanceof PrismaClientKnownRequestError) {
    // P2002 is Prisma's error code for unique constraint violations
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[]) || ['field'];
      return AppError.duplicate(`Duplicate value for ${target.join(', ')}`);
    }

    // P2025 is Prisma's error code for record not found
    if (err.code === 'P2025') {
      return AppError.notFound('Record not found');
    }

    return AppError.database(`Database error: ${err.message}`);
  }

  // Handle Prisma validation errors (e.g., invalid data types)
  if (err instanceof PrismaClientValidationError) {
    return AppError.validation(`Invalid input data: ${err.message}`);
  }

  return err;
};

// Handle JWT errors
const handleJWTErrors = (err: Error) => {
  if (err.name === 'JsonWebTokenError') {
    return AppError.unauthorized('Invalid token. Please log in again.');
  }

  if (err.name === 'TokenExpiredError') {
    return AppError.unauthorized('Your token has expired. Please log in again.');
  }

  return err;
};

// Handle Joi validation errors
const handleJoiErrors = (err: any) => {
  if (err.name === 'ValidationError' && err.details) {
    const errors = err.details.map((detail: any) => detail.message);
    return AppError.validation('Validation error', errors);
  }
  return err;
};

// Global error handler middleware
export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  // Transform known error types into AppError format
  let error = err;
  error = handlePrismaErrors(error);
  error = handleJWTErrors(error);
  error = handleJoiErrors(error);

  // Log the error with our structured logger
  if (error instanceof AppError) {
    logger.error(error.message, {
      statusCode: error.statusCode,
      path: req.path,
      method: req.method,
      errorType: error.errorType,
      ...(error.errors && error.errors.length > 0 && { errors: error.errors }),
    });

    // For operational errors, send the error message to the client
    const response: any = {
      status: error.status,
      message: error.message,
      errorType: error.errorType,
    };

    // Include error details if available
    if (error.errors && error.errors.length > 0) {
      response.errors = error.errors;
    }

    // Include error stack in development mode
    if (process.env.NODE_ENV === 'development' && !error.isOperational) {
      response.stack = error.stack;
    }

    res.status(error.statusCode).json(response);
    return;
  }

  // For unknown errors, log with our structured logger
  logger.error('Unhandled error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    request: {
      path: req.path,
      method: req.method,
      body: req.body,
      query: req.query,
      params: req.params,
      headers: req.headers,
    },
  });

  // For unknown errors, send a generic message in production
  const statusCode = 500;
  const response: any = {
    status: 'error',
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong'
        : error.message || 'Something went wrong',
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

// Async handler to avoid try-catch blocks in controllers
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
