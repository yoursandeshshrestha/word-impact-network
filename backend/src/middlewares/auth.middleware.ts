import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { extractTokenFromHeader, verifyAccessToken, verifyRefreshToken } from '../utils/jwt';
import { findRefreshToken } from '../services/refreshToken.service';
import { AppError } from '../utils/appError';
import { sendError } from '../utils/responseHandler';
import { ErrorTypes } from '../utils/appError';

// Extend Express Request type to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

/**
 * Middleware to validate JWT and attach user to request
 * Supports both Authorization header and HTTP-only cookies
 * Handles different token names for admin and frontend applications
 * Implements intelligent token selection to avoid conflicts
 */
/**
 * Authenticate admin users using admin tokens
 */
export const authenticateAdmin = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = extractTokenFromHeader(req.headers.authorization);

    // If no token in header, try to get admin token from cookies
    if (!token) {
      token = req.cookies['accessToken'] || null;
    }

    if (!token) {
      console.log('No admin token found');
      sendError(res, 401, 'Admin authentication required');
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      console.log('Admin token verification failed');
      sendError(res, 401, 'Invalid or expired admin token');
      return;
    }

    // Verify it's an admin user
    if (decoded.role !== 'ADMIN') {
      console.log('Non-admin user attempting to access admin route');
      sendError(res, 403, 'Admin access required');
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log('Admin authentication error:', error);
    sendError(res, 401, 'Admin authentication failed');
    return;
  }
};

/**
 * Authenticate student users using frontend tokens
 */
export const authenticateStudent = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = extractTokenFromHeader(req.headers.authorization);

    // If no token in header, try to get frontend token from cookies
    if (!token) {
      token = req.cookies['client-access-token-win'] || null;
    }

    if (!token) {
      console.log('No student token found');
      sendError(res, 401, 'Student authentication required');
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      console.log('Student token verification failed');
      sendError(res, 401, 'Invalid or expired student token');
      return;
    }

    // Verify it's a student user
    if (decoded.role !== 'STUDENT') {
      console.log('Non-student user attempting to access student route');
      sendError(res, 403, 'Student access required');
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log('Student authentication error:', error);
    sendError(res, 401, 'Student authentication failed');
    return;
  }
};

/**
 * Generic authentication - tries both admin and student tokens
 * Use this only when you need to support both user types
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    let token = extractTokenFromHeader(req.headers.authorization);

    // If no token in header, try to get from cookies
    if (!token) {
      // Try admin token first, then student token
      token = req.cookies['accessToken'] || req.cookies['client-access-token-win'] || null;
    }

    if (!token) {
      console.log('No token found in authentication middleware');
      sendError(res, 401, 'Authentication required');
      return;
    }

    const decoded = verifyAccessToken(token);

    if (!decoded) {
      console.log('Token verification failed in authentication middleware');
      sendError(res, 401, 'Invalid or expired token');
      return;
    }

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    console.log('Authentication middleware error:', error);
    sendError(res, 401, 'Authentication failed');
    return;
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 401, 'Authentication required');
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    sendError(res, 403, 'Admin access required');
    return;
  }

  next();
};

/**
 * Middleware to check if user has student role
 */
export const requireStudent = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    sendError(res, 401, 'Authentication required');
    return;
  }

  if (req.user.role !== UserRole.STUDENT) {
    sendError(res, 403, 'Student access required');
    return;
  }

  next();
};

/**
 * Role-based access control middleware
 * @param roles - Array of roles allowed to access the route
 */
export const restrictTo = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, 401, 'Authentication required');
      return;
    }

    if (!roles.includes(req.user.role)) {
      sendError(res, 403, 'You do not have permission to perform this action');
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is authenticated and owns the requested resource
 * @param paramName The name of the parameter containing the resource ID
 * @param findResource The function to find the resource
 */
export const requireOwnership = (
  paramName: string,
  findResource: (id: string) => Promise<{ userId: string } | null>,
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 401, 'Authentication required');
        return;
      }

      const resourceId = req.params[paramName];

      if (!resourceId) {
        sendError(res, 400, `${paramName} parameter is required`);
        return;
      }

      const resource = await findResource(resourceId);

      if (!resource) {
        sendError(res, 404, 'Resource not found');
        return;
      }

      if (resource.userId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        sendError(res, 403, 'Access denied');
        return;
      }

      next();
    } catch (error) {
      sendError(res, 500, 'Server error');
      return;
    }
  };
};

/**
 * Middleware factory to check resource ownership without admin override
 */
export const requireStrictOwnership = (
  paramName: string,
  findResource: (id: string) => Promise<{ userId: string } | null>,
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        sendError(res, 401, 'Authentication required');
        return;
      }

      const resourceId = req.params[paramName];

      if (!resourceId) {
        sendError(res, 400, `${paramName} parameter is required`);
        return;
      }

      const resource = await findResource(resourceId);

      if (!resource) {
        sendError(res, 404, 'Resource not found');
        return;
      }

      // Strictly check ownership without admin override
      if (resource.userId !== req.user.userId) {
        sendError(res, 403, 'Access denied - you must be the owner of this resource');
        return;
      }

      next();
    } catch (error) {
      sendError(res, 500, 'Server error');
      return;
    }
  };
};

export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('Unauthorized access', 403, ErrorTypes.AUTHORIZATION));
    }

    next();
  };
};
