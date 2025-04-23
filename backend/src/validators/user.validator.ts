import { z } from 'zod';
import { Gender, Degree } from '@prisma/client';

const genderValues = Object.values(Gender);
const degreeValues = Object.values(Degree);

export const applicationSchema = z.object({
  fullName: z.string().min(3).max(100),
  gender: z.enum(genderValues as [string, ...string[]]),
  dateOfBirth: z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    { message: 'Invalid date format' },
  ),
  email: z.string().email(),
  phoneNumber: z.string().min(10).max(15),
  country: z.string().min(2).max(50),
  academicQualification: z.string().min(3).max(200),
  desiredDegree: z.enum(degreeValues as [string, ...string[]]),
  certificateUrl: z.string().url(),
  recommendationLetterUrl: z.string().url(),
  wasReferred: z.boolean(),
  referrerName: z.string().min(3).max(100).optional().nullable(),
  referrerContact: z.string().min(5).max(100).optional().nullable(),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export type LoginInput = z.infer<typeof loginSchema>;
