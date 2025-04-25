import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendAdminWelcomeEmail } from './email.service';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
  adminCreationSecret: string,
) {
  try {
    logger.info('Starting admin creation process', { email, fullName });

    // Verify admin creation secret
    if (adminCreationSecret !== process.env.ADMIN_CREATION_SECRET) {
      logger.warn('Invalid admin creation secret attempt', { email });
      throw new AppError('Invalid admin creation secret', 401, ErrorTypes.AUTHENTICATION);
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      logger.warn('Admin creation failed - email already exists', { email });
      throw new AppError('Admin with this email already exists', 400, ErrorTypes.DUPLICATE);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and admin in a transaction
    logger.info('Creating admin in database transaction', { email });
    const { user, admin } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      const admin = await tx.admin.create({
        data: {
          fullName,
          user: {
            connect: { id: user.id },
          },
        },
      });

      return { user, admin };
    });

    logger.info('Admin created successfully', { adminId: admin.id, email });

    // Send welcome email without blocking the admin creation process
    sendAdminWelcomeEmail(email, fullName).catch((emailError) => {
      logger.error('Failed to send admin welcome email', {
        adminId: admin.id,
        email,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    });

    return {
      id: admin.id,
      email: user.email,
      fullName: admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in createAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    logger.info('Admin login attempt', { email });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (!user || user.role !== UserRole.ADMIN || !user.admin?.id) {
      logger.warn('Admin login failed - invalid credentials', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Admin login failed - invalid password', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    logger.info('Admin login successful', { adminId: user.admin.id, email });

    return {
      id: user.admin.id,
      email: user.email,
      fullName: user.admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in loginAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
