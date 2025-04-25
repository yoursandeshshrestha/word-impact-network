import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@wordimpactnetwork.com',
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);

    // Log the email in the database
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        content: html,
        status: 'sent',
      },
    });

    return info;
  } catch (error) {
    // Log failed email
    await prisma.emailLog.create({
      data: {
        to,
        subject,
        content: html,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      },
    });

    throw error;
  }
}

export async function sendAdminWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to Word Impact Network Admin Portal';
  const html = `
    <h1>Welcome ${name}!</h1>
    <p>Your admin account has been successfully created.</p>
    <p>You can now log in to the admin portal using your credentials.</p>
    <p>Best regards,<br>Word Impact Network Team</p>
  `;

  return sendEmail(email, subject, html);
}
