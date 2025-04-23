import { Request, Response } from 'express';
import { z } from 'zod';
import { createAdmin } from '../services/admin.service';

// Schema for creating admin
const createAdminSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
  fullName: z.string().min(3).max(100),
  secretKey: z.string(), // A secret key for additional security
});

/**
 * Create new admin user
 * @param req Express request
 * @param res Express response
 */
export const createAdminController = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const validatedData = createAdminSchema.parse(req.body);

    // Check secret key for additional security
    const expectedSecretKey = process.env.ADMIN_CREATION_SECRET || 'admin-secret-key';

    if (validatedData.secretKey !== expectedSecretKey) {
      res.status(403).json({
        success: false,
        message: 'Invalid secret key',
      });
      return;
    }

    // Create admin user
    const admin = await createAdmin({
      email: validatedData.email,
      password: validatedData.password,
      fullName: validatedData.fullName,
    });

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      data: {
        id: admin.id,
        email: admin.email,
        fullName: admin.fullName,
        role: admin.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
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

    console.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user',
    });
  }
};
