import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Gender } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';

// Student registration validation schema
const studentRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  fullName: Joi.string().required(),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .required(),
  dateOfBirth: Joi.date().required(),
  phoneNumber: Joi.string().required(),
  country: Joi.string().required(),
  academicQualification: Joi.string().required(),
  desiredDegree: Joi.string().required(),
  // These are optional 
  certificateUrl: Joi.string().optional(),
  recommendationLetterUrl: Joi.string().optional(),
  referredBy: Joi.string().optional(),
  referrerContact: Joi.string().optional(),
  agreesToTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms and conditions',
  }),
});

// Student login validation schema
const studentLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Student application status validation schema
const applicationStatusSchema = Joi.object({
  applicationId: Joi.string().uuid().required(),
  status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  rejectionReason: Joi.when('status', {
    is: 'REJECTED',
    then: Joi.string().required(),
    otherwise: Joi.optional(),
  }),
});

// Validation middleware for student registration
export const validateStudentRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = studentRegistrationSchema.validate(req.body, {
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

// Validation middleware for student login
export const validateStudentLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error, value } = studentLoginSchema.validate(req.body, {
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

// Validation middleware for application status update
export const validateApplicationStatus = (req: Request, res: Response, next: NextFunction) => {
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
