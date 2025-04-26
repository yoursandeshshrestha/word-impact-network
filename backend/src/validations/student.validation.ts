import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Gender } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';

// Student registration validation schema (no password required)
const studentRegistrationSchema = Joi.object({
  email: Joi.string().email().required(),
  fullName: Joi.string().required(),
  gender: Joi.string()
    .valid(...Object.values(Gender))
    .required(),
  dateOfBirth: Joi.date().required(),
  phoneNumber: Joi.string().required(),
  country: Joi.string().required(),
  academicQualification: Joi.string().required(),
  desiredDegree: Joi.string().required(),
  referredBy: Joi.string().optional(),
  referrerContact: Joi.string().optional(),
  agreesToTerms: Joi.boolean().valid(true).required().messages({
    'any.only': 'You must agree to the terms and conditions',
  }),
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// Validation middleware for student registration
export const validateStudentRegistration = (req: Request, res: Response, next: NextFunction) => {
  // Convert string 'true'/'false' to boolean
  if (req.body.agreesToTerms === 'true') {
    req.body.agreesToTerms = true;
  } else if (req.body.agreesToTerms === 'false') {
    req.body.agreesToTerms = false;
  }

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
  const { error, value } = loginSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');

    return next(new AppError(errorMessage, 400));
  }

  req.body = value;
  next();
};
