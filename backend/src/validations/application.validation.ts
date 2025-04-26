// src/validations/application.validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApplicationStatus } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';

// Application status update validation schema (no applicationId in body)
const applicationStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(ApplicationStatus))
    .required(),
  rejectionReason: Joi.when('status', {
    is: ApplicationStatus.REJECTED,
    then: Joi.string().required().min(10).max(500),
    otherwise: Joi.optional(),
  }),
});

// Validation middleware for application status update
export const validateApplicationStatusUpdate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { error, value } = applicationStatusSchema.validate(req.body, {
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
