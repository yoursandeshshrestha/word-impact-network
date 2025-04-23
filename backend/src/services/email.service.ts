import nodemailer from 'nodemailer';
import { Application, ApplicationStatus } from '@prisma/client';

// Create a transporter with SendGrid
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// The verified email that you registered with SendGrid
const VERIFIED_SENDER = process.env.VERIFIED_SENDER_EMAIL;

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

/**
 * Send application submission confirmation email
 * @param application Application data
 */
export const sendApplicationSubmissionEmail = async (application: Application): Promise<void> => {
  const { email, fullName } = application;

  const subject = 'Application Received - Thank You!';
  const content = `
    <h1>Thank you for your application, ${fullName}!</h1>
    <p>We have received your application and will review it shortly.</p>
    <p>You will be notified via email once we have made a decision regarding your application.</p>
    <p>If you have any questions in the meantime, please don't hesitate to reach out to us.</p>
    <p>Best regards,<br>The Learning Platform Team</p>
  `;

  try {
    await transporter.sendMail({
      from: VERIFIED_SENDER,
      to: email,
      subject,
      html: content,
    });

    console.log(`Application submission confirmation email sent to ${email}`);
  } catch (error) {
    console.error('Error sending application submission email:', error);
    // Don't throw the error to prevent blocking the application flow
  }
};
