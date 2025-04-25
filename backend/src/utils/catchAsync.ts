import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper function to eliminate try/catch blocks in route handlers
 * Automatically catches errors and passes them to the next middleware
 */
export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
