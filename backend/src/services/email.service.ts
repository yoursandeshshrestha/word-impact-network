import nodemailer from 'nodemailer';
import { Application, ApplicationStatus } from '@prisma/client';

// Create a transporter with SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'apikey', // SendGrid uses 'apikey' as the username
    pass: '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',
  },
});

// The verified email that you registered with SendGrid
// You MUST change this to an email that you've verified with SendGrid
const VERIFIED_SENDER = 'yoursandeshshrestha@gmail.com';

/**
 * Send application status notification email
 * @param application Application data
 * @returns Information about the sent email
 */
export const sendApplicationStatusEmail = async (application: Application): Promise<void> => {
  const { email, fullName, status } = application;

  let subject: string;
  let content: string;

  if (status === ApplicationStatus.APPROVED) {
    subject = 'Your Application has been Approved!';
    content = `
      <h1>Congratulations, ${fullName}!</h1>
      <p>We are pleased to inform you that your application has been approved.</p>
      <p>You will receive further instructions to set up your account shortly.</p>
      <p>Thank you for choosing our learning platform.</p>
    `;
  } else if (status === ApplicationStatus.REJECTED) {
    subject = 'Update on Your Application';
    content = `
      <h1>Dear ${fullName},</h1>
      <p>Thank you for your interest in our learning platform.</p>
      <p>We regret to inform you that we are unable to approve your application at this time.</p>
      <p>You are welcome to apply again in the future with updated information.</p>
    `;
  } else {
    return; // Don't send emails for pending status
  }

  try {
    await transporter.sendMail({
      from: VERIFIED_SENDER, // Must be a verified sender
      to: email,
      subject,
      html: content,
    });

    console.log(`Email sent to ${email} with status: ${status}`);
  } catch (error) {
    console.error('Error sending status email:', error);
    // Don't throw the error to prevent blocking the application flow
  }
};

/**
 * Send account creation email with temporary password
 * @param email User email
 * @param fullName User full name
 * @param tempPassword Temporary password
 */
export const sendAccountCreationEmail = async (
  email: string,
  fullName: string,
  tempPassword: string,
): Promise<void> => {
  const subject = 'Your Learning Platform Account';
  const content = `
    <h1>Welcome to our Learning Platform, ${fullName}!</h1>
    <p>Your account has been created. You can now log in using your email and the temporary password below:</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Temporary Password:</strong> ${tempPassword}</p>
    <p>For security reasons, we recommend changing your password after your first login.</p>
    <p>Thank you for joining our learning community!</p>
  `;

  try {
    await transporter.sendMail({
      from: VERIFIED_SENDER, // Must be a verified sender
      to: email,
      subject,
      html: content,
    });

    console.log(`Account creation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending account creation email:', error);
    // Don't throw the error to prevent blocking the application flow
  }
};

/**
 * Generate a random temporary password
 * @returns Random password string
 */
export const generateTemporaryPassword = (): string => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
};
