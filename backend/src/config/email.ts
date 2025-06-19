import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

export const createTransport = () => {
  // Check for required Hostinger SMTP environment variables
  if (!process.env.SMTP_SERVER || !process.env.SMTP_USERNAME || !process.env.SMTP_PASSWORD) {
    logger.error(
      'Hostinger SMTP configuration is missing. Please check SMTP_SERVER, SMTP_USERNAME, and SMTP_PASSWORD environment variables.',
    );
    throw new Error('Hostinger SMTP configuration is missing');
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // Use SSL for port 465
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates if needed
    },
  });
};
