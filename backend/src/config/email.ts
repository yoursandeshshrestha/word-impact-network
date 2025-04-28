import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export const createTransporter = () => {
  if (!process.env.SENDGRID_API_KEY) {
    logger.error('SENDGRID_API_KEY is not defined in environment variables');
    throw new Error('SENDGRID_API_KEY is not defined in environment variables');
  }

  return nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: process.env.SENDGRID_API_KEY,
    },
  });
};
