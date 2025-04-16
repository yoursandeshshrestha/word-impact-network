import { PrismaClient } from '@prisma/client';
import type { User } from '@prisma/client';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: Role;
}

/**
 * Register a new user
 */
export const registerUser = async (userData: CreateUserInput): Promise<Omit<User, 'password'>> => {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create the user
    const newUser = await prisma.user.create({
      data: {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: hashedPassword,
        phoneNumber: userData.phoneNumber,
        role: userData.role || Role.STUDENT,
      },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to register user: ${error.message}`);
    }
    throw new Error('Failed to register user');
  }
};

/**
 * Find user by email (for authentication)
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Compare password for login
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
