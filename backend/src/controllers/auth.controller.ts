import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { applicationSchema, loginSchema } from '../validators/user.validator';
import { createApplication } from '../services/user.service';
import { authenticate } from '../services/auth.service';
import { sendApplicationSubmissionEmail } from '../services/email.service';

/**
 * Handle user application submission
 * @param req Express request
 * @param res Express response
 */
export const applyController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = applicationSchema.parse(req.body);

    // Create application
    const application = await createApplication(validatedData);

    // Send application submission confirmation email
    await sendApplicationSubmissionEmail(application);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        id: application.id,
        email: application.email,
        status: application.status,
        createdAt: application.createdAt,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof Error && error.message === 'Email already in use') {
      res.status(409).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
    });
  }
};

/**
 * Handle user login
 * @param req Express request
 * @param res Express response
 */
export const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Authenticate user
    const authResult = await authenticate(validatedData);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: authResult,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    if (error instanceof Error && error.message === 'Invalid email or password') {
      res.status(401).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authenticate',
    });
  }
};

/**
 * Get current authenticated user profile
 * @param req Express request
 * @param res Express response
 */
export const getMeController = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is attached to request by auth middleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        id: req.user.userId,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile',
    });
  }
};
