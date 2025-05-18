import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation schema for analytics period parameter
const analyticsPeriodSchema = Joi.object({
  period: Joi.string().valid('week', 'month', 'year').default('month').messages({
    'any.only': 'Period must be one of: week, month, year',
  }),
});

// Validation schema for pagination parameters
const analyticsPaginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 50',
  }),
});

// Validation schema for date range parameters
const analyticsDateRangeSchema = Joi.object({
  startDate: Joi.date().iso().messages({
    'date.base': 'Start date must be a valid date',
    'date.format': 'Start date must be in ISO format (YYYY-MM-DD)',
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.base': 'End date must be a valid date',
    'date.format': 'End date must be in ISO format (YYYY-MM-DD)',
    'date.min': 'End date must be greater than or equal to start date',
  }),
}).with('startDate', 'endDate');

/**
 * Middleware to validate analytics period
 */
export const validateAnalyticsPeriod = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = analyticsPeriodSchema.validate(req.query, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }

  next();
};

/**
 * Middleware to validate pagination parameters
 */
export const validateAnalyticsPagination = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  // Convert string to number for validation
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;

  const { error } = analyticsPaginationSchema.validate({ limit }, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }

  // Set the validated and potentially coerced value back to query
  if (limit) {
    req.query.limit = limit.toString();
  }

  next();
};

/**
 * Middleware to validate date range parameters
 */
export const validateAnalyticsDateRange = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const { error } = analyticsDateRangeSchema.validate(req.query, { abortEarly: false });

  if (error) {
    const errorMessages = error.details.map((detail) => detail.message);
    res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errorMessages,
    });
    return;
  }

  next();
};
