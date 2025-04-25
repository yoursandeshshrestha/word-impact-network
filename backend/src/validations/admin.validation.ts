import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required',
  }),
  fullName: Joi.string().required().messages({
    'any.required': 'Full name is required',
  }),
  adminCreationSecret: Joi.string().required().messages({
    'any.required': 'Admin creation secret is required',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required',
  }),
});

export const validateAdminRegister = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = registerSchema.validate(req.body, { abortEarly: false });

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

export const validateAdminLogin = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = loginSchema.validate(req.body, { abortEarly: false });

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
