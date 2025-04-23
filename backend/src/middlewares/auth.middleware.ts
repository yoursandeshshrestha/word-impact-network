import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { extractTokenFromHeader, verifyToken } from '../utils/jwt';

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
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      res.status(401).json({ message: 'Invalid or expired token' });
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
    res.status(401).json({ message: 'Authentication failed' });
    return;
  }
};

/**
 * Middleware to check if user has admin role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
};

/**
 * Middleware to check if user has student role
 */
export const requireStudent = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.STUDENT) {
    res.status(403).json({ message: 'Student access required' });
    return;
  }

  next();
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
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const resourceId = req.params[paramName];

      if (!resourceId) {
        res.status(400).json({ message: `${paramName} parameter is required` });
        return;
      }

      const resource = await findResource(resourceId);

      if (!resource) {
        res.status(404).json({ message: 'Resource not found' });
        return;
      }

      if (resource.userId !== req.user.userId && req.user.role !== UserRole.ADMIN) {
        res.status(403).json({ message: 'Access denied' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
      return;
    }
  };
};
