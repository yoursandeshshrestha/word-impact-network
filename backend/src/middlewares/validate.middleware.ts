import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: Joi.Schema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        status: 'error',
        message: error.details.map((detail) => detail.message).join(', '),
      });
      return;
    }

    next();
  };
};
