import { User } from '@prisma/client';
import { findUserByEmail, verifyPassword } from './user.service';
import { generateToken } from '../utils/jwt';
import { LoginInput } from '../validators/user.validator';

interface AuthResult {
  user: {
    id: string;
    email: string;
    fullName: string;
    role: string;
  };
  token: string;
}

/**
 * Authenticate a user with email and password
 * @param loginData Login credentials
 * @returns Auth result with user data and token
 */
export const authenticate = async (loginData: LoginInput): Promise<AuthResult> => {
  const { email, password } = loginData;

  // Find user by email
  const user = await findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await verifyPassword(password, user.password);

  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // Return user data and token
  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    },
    token,
  };
};
