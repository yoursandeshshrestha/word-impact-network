import { Application, User, UserRole, ApplicationStatus, Degree, Gender } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { ApplicationInput } from '../validators/user.validator';
import prisma from '../config/prisma';

/**
 * Create a new application
 * @param data Application data
 * @returns The created application
 */
export const createApplication = async (data: ApplicationInput): Promise<Application> => {
  // Check if email already exists in applications or users
  const existingApplication = await prisma.application.findUnique({
    where: { email: data.email },
  });

  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingApplication || existingUser) {
    throw new Error('Email already in use');
  }

  const dateOfBirth = new Date(data.dateOfBirth);

  return prisma.application.create({
    data: {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      country: data.country,
      academicQualification: data.academicQualification,
      desiredDegree: data.desiredDegree as Degree,
      certificateUrl: data.certificateUrl,
      recommendationLetterUrl: data.recommendationLetterUrl,
      wasReferred: data.wasReferred,
      referrerName: data.referrerName,
      dateOfBirth,
      status: ApplicationStatus.PENDING,
      gender: data.gender as Gender, // Added missing required field
    },
  });
};

/**
 * Get application by ID
 * @param id Application ID
 * @returns Application or null if not found
 */
export const getApplicationById = async (id: string): Promise<Application | null> => {
  return prisma.application.findUnique({
    where: { id },
  });
};

/**
 * Update application status
 * @param id Application ID
 * @param status New status
 * @returns Updated application
 */
export const updateApplicationStatus = async (
  id: string,
  status: ApplicationStatus,
): Promise<Application> => {
  return prisma.application.update({
    where: { id },
    data: { status },
  });
};

/**
 * Create a new user from an approved application
 * @param applicationId Application ID
 * @param password Password for the new user
 * @returns The created user
 */
export const createUserFromApplication = async (
  applicationId: string,
  password: string,
): Promise<User> => {
  // Start a transaction
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    if (application.status !== ApplicationStatus.APPROVED) {
      throw new Error('Cannot create user from unapproved application');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await tx.user.create({
      data: {
        email: application.email,
        password: hashedPassword,
        fullName: application.fullName,
        role: UserRole.STUDENT,
        studentProfile: {
          create: {
            gender: application.gender,
            dateOfBirth: application.dateOfBirth,
            phoneNumber: application.phoneNumber,
            country: application.country,
            academicQualification: application.academicQualification,
          },
        },
      },
    });

    // Update the application with the user ID
    await tx.application.update({
      where: { id: applicationId },
      data: { userId: user.id },
    });

    return user;
  });
};

/**
 * Find user by email
 * @param email User email
 * @returns User or null if not found
 */
export const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Find user by ID
 * @param id User ID
 * @returns User or null if not found
 */
export const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Verify password
 * @param plainPassword Plain text password
 * @param hashedPassword Hashed password
 * @returns True if password matches
 */
export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
