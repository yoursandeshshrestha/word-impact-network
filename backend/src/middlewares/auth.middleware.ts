  // src/middlewares/auth.middleware.ts
  import { Request, Response, NextFunction } from 'express';
  import { UserRole } from '@prisma/client';
  import { extractTokenFromHeader, verifyToken } from '../utils/jwt';
  import { AppError } from '../utils/appError';
  import { sendError } from '../utils/responseHandler';

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
   */
  export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const token = extractTokenFromHeader(req.headers.authorization);

      if (!token) {
        sendError(res, 401, 'Authentication required');
        return;
      }

      const decoded = verifyToken(token);

      if (!decoded) {
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
