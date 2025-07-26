import { Request, Response, NextFunction } from 'express';
import { getBackendStatus } from '../utils/backendControl';

export const backendControlMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip this middleware for the control endpoints themselves
  if (req.path.includes('/backend-control')) {
    next();
    return;
  }

  // Skip for health check and root endpoint
  if (req.path === '/health' || req.path === '/') {
    next();
    return;
  }

  const isEnabled = getBackendStatus();

  if (!isEnabled) {
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable',
      error: 'Backend is currently disabled',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
};
