import { Request, Response } from 'express';
import { registerUser } from '../services/user.service';
import { Role } from '@prisma/client';

/*** Register a new user ***/
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'First name, last name, email, and password are required',
      });
      return;
    }

    // Register the user
    const newUser = await registerUser({
      firstName,
      lastName,
      email,
      password,
      phoneNumber,
      role: Role.STUDENT, // Default role for registration
    });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: newUser,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        res.status(409).json({
          status: 'error',
          message: error.message,
        });
        return;
      }
    }

    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to register user',
    });
  }
};
