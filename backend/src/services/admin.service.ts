import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendAdminWelcomeEmail } from './email.service';
import { AppError } from '../utils/appError';

const prisma = new PrismaClient();

export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
  adminCreationSecret: string,
) {
  try {
    // Verify admin creation secret
    if (adminCreationSecret !== process.env.ADMIN_CREATION_SECRET) {
      throw new AppError('Invalid admin creation secret', 401);
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new AppError('Admin with this email already exists', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and admin in a transaction
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

    // Send welcome email
    try {
      await sendAdminWelcomeEmail(email, fullName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Don't throw error here, just log it
    }

    return {
      id: admin.id,
      email: user.email,
      fullName: admin.fullName,
      role: user.role,
    };
  } catch (error) {
    console.error('Error in createAdmin:', error);
    throw error;
  }
}

export async function loginAdmin(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (!user || user.role !== UserRole.ADMIN || !user.admin?.id) {
      throw new AppError('Invalid credentials', 401);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    return {
      id: user.admin.id,
      email: user.email,
      fullName: user.admin.fullName,
      role: user.role,
    };
  } catch (error) {
    console.error('Error in loginAdmin:', error);
    throw error;
  }
}
