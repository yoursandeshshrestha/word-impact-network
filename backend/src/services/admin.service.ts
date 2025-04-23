import { User, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';

interface CreateAdminInput {
  email: string;
  password: string;
  fullName: string;
}

/**
 * Create a new admin user
 * @param data Admin user data
 * @returns The created admin user
 */
export const createAdmin = async (data: CreateAdminInput): Promise<User> => {
  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error('Email already in use');
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create the admin user with transaction
  return prisma.$transaction(async (tx) => {
    // Create user with admin role
    const user = await tx.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
        role: UserRole.ADMIN,
      },
    });

    // Create admin profile
    await tx.adminProfile.create({
      data: {
        userId: user.id,
      },
    });

    return user;
  });
};
