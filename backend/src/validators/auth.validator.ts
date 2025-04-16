import Joi from 'joi';

export const registerSchema = Joi.object({
  firstName: Joi.string().required().trim().min(2).max(50),
  lastName: Joi.string().required().trim().min(2).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  phoneNumber: Joi.string().optional(),
});
