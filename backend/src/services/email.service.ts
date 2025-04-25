import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

const createTransporter = () => {
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

// Base email sending function with logging
export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@wordimpactnetwork.com',
      to,
      subject,
      html,
    };

    logger.info(`Sending email to ${to} with subject: ${subject}`);
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

    logger.info(`Email sent successfully to ${to}`);
    return info;
  } catch (error) {
    // Log failed email
    logger.error(`Failed to send email to ${to}`, { error });

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

// Admin emails
export async function sendAdminWelcomeEmail(email: string, name: string) {
  const subject = 'Welcome to Word Impact Network Admin Portal';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Word Impact Network!</h1>
        </div>
        <div class="content">
          <h2>Welcome ${name}!</h2>
          <p>Your admin account has been successfully created.</p>
          <p>You can now log in to the admin portal using your credentials.</p>
          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Student application confirmation email
export async function sendApplicationConfirmationEmail(
  email: string,
  name: string,
  applicationId: string,
) {
  const subject = 'Your Word Impact Network Application';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .application-id { background-color: #f5f5f5; padding: 10px; font-weight: bold; text-align: center; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Word Impact Network</h1>
        </div>
        <div class="content">
          <h2>Thank you for applying, ${name}!</h2>
          <p>We have received your application for Word Impact Network.</p>
          <p>Your application ID is:</p>
          <div class="application-id">${applicationId}</div>
          <p>We will review your application and get back to you shortly. You will receive another email when your application status changes.</p>
          <p>If you have any questions about your application, please contact our admissions team.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Application approved email
export async function sendApplicationApprovedEmail(
  email: string,
  name: string,
  tempPassword: string,
) {
  const subject = 'Your Word Impact Network Application has been Approved!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .credentials { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #4a6fdc; }
        .warning { color: #d83737; font-weight: bold; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Approved!</h1>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}!</h2>
          <p>Your application to Word Impact Network has been approved.</p>
          <p>You can now log in to the student portal with the following credentials:</p>
          <div class="credentials">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${tempPassword}</p>
          </div>
          <p class="warning">Please log in and change your password as soon as possible.</p>
          <p>We're excited to have you join our learning community!</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Application rejected email
export async function sendApplicationRejectedEmail(email: string, name: string, reason: string) {
  const subject = 'Your Word Impact Network Application Status';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .reason { background-color: #f5f5f5; padding: 15px; margin: 15px 0; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Application Status Update</h1>
        </div>
        <div class="content">
          <h2>Application Status</h2>
          <p>Dear ${name},</p>
          <p>Thank you for your interest in Word Impact Network.</p>
          <p>After careful review, we regret to inform you that we were unable to approve your application at this time.</p>
          <div class="reason">
            <p><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>If you wish to apply again in the future or have any questions, please feel free to contact our admissions team.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Password reset email
export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://wordimpactnetwork.com'}/reset-password?token=${token}`;

  const subject = 'Reset Your Word Impact Network Password';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a6fdc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .warning { color: #d83737; font-size: 14px; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset</h1>
        </div>
        <div class="content">
          <h2>Reset Your Password</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password for Word Impact Network.</p>
          <p>Click the button below to reset your password. This link is valid for 1 hour.</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>If you can't click the button, copy and paste this URL into your browser:</p>
          <p>${resetUrl}</p>
          <p class="warning">If you didn't request this, you can safely ignore this email.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Payment confirmation email
export async function sendPaymentConfirmationEmail(
  email: string,
  name: string,
  amount: string,
  transactionId: string,
) {
  const subject = 'Payment Confirmation - Word Impact Network';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .payment-details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Confirmation</h1>
        </div>
        <div class="content">
          <h2>Thank You for Your Payment</h2>
          <p>Hello ${name},</p>
          <p>We have received your payment for Word Impact Network.</p>
          <div class="payment-details">
            <p><strong>Amount:</strong> ${amount}</p>
            <p><strong>Transaction ID:</strong> ${transactionId}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <p>Thank you for your payment. You now have full access to your enrolled courses.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Course enrollment confirmation email
export async function sendCourseEnrollmentEmail(email: string, name: string, courseName: string) {
  const subject = 'Course Enrollment Confirmation - Word Impact Network';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .course-info { background-color: #f5f5f5; padding: 15px; margin: 15px 0; border-left: 4px solid #4a6fdc; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Course Enrollment</h1>
        </div>
        <div class="content">
          <h2>Enrollment Confirmation</h2>
          <p>Hello ${name},</p>
          <p>You have successfully enrolled in the following course:</p>
          <div class="course-info">
            <p><strong>${courseName}</strong></p>
          </div>
          <p>You can now access all course materials, videos, and exams through your student dashboard.</p>
          <p>We wish you success in your learning journey!</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Exam passed email
export async function sendExamPassedEmail(
  email: string,
  name: string,
  examTitle: string,
  score: number,
) {
  const subject = 'Exam Passed - Word Impact Network';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .result { background-color: #f5f5f5; padding: 15px; margin: 15px 0; }
        .score { font-size: 24px; color: #4a6fdc; font-weight: bold; text-align: center; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Exam Results</h1>
        </div>
        <div class="content">
          <h2>Congratulations on Passing Your Exam!</h2>
          <p>Hello ${name},</p>
          <p>Great news! You have passed the exam: <strong>${examTitle}</strong>.</p>
          <div class="result">
            <p>Your score:</p>
            <p class="score">${score}%</p>
          </div>
          <p>Keep up the good work as you continue your studies.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Year certification email
export async function sendYearCertificationEmail(
  email: string,
  name: string,
  courseName: string,
  year: number,
  certificateUrl: string,
) {
  const subject = `Year ${year} Certificate - ${courseName}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .certificate-link { display: inline-block; padding: 10px 20px; background-color: #4a6fdc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Certificate is Ready!</h1>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}!</h2>
          <p>You have successfully completed Year ${year} of <strong>${courseName}</strong>.</p>
          <p>Your certificate is now available. You can view and download it by clicking the link below:</p>
          <a href="${certificateUrl}" class="certificate-link">View Certificate</a>
          <p>This is a tremendous achievement! We're proud of your dedication and hard work.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Payment reminder email
export async function sendPaymentReminderEmail(
  email: string,
  name: string,
  amount: string,
  dueDate: Date,
) {
  const formattedDueDate = dueDate.toLocaleDateString();
  const subject = 'Payment Reminder - Word Impact Network';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .payment-details { background-color: #f5f5f5; padding: 15px; margin: 15px 0; }
        .due-date { color: #d83737; font-weight: bold; }
        .payment-link { display: inline-block; padding: 10px 20px; background-color: #4a6fdc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Reminder</h1>
        </div>
        <div class="content">
          <h2>Pending Payment</h2>
          <p>Hello ${name},</p>
          <p>This is a friendly reminder that your payment for Word Impact Network is due soon.</p>
          <div class="payment-details">
            <p><strong>Amount Due:</strong> ${amount}</p>
            <p><strong>Due Date:</strong> <span class="due-date">${formattedDueDate}</span></p>
          </div>
          <p>Please ensure that your payment is made before the due date to maintain access to your courses.</p>
          <a href="${process.env.FRONTEND_URL || 'https://wordimpactnetwork.com'}/student/payment" class="payment-link">Make Payment</a>
          <p>If you have already made the payment, please disregard this email.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}

// Account activation email
export async function sendAccountActivationEmail(
  email: string,
  name: string,
  activationToken: string,
) {
  const activationUrl = `${process.env.FRONTEND_URL || 'https://wordimpactnetwork.com'}/activate-account?token=${activationToken}`;

  const subject = 'Activate Your Word Impact Network Account';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4a6fdc; color: white; padding: 10px 20px; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .button { display: inline-block; padding: 10px 20px; background-color: #4a6fdc; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
        .expiry { font-size: 14px; color: #777; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Activate Your Account</h1>
        </div>
        <div class="content">
          <h2>Welcome to Word Impact Network!</h2>
          <p>Hello ${name},</p>
          <p>Thank you for registering with Word Impact Network. To complete your registration, please activate your account by clicking the button below:</p>
          <a href="${activationUrl}" class="button">Activate Account</a>
          <p class="expiry">This activation link will expire in 24 hours.</p>
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          <p>Best regards,<br>Word Impact Network Team</p>
        </div>
        <div class="footer">
          <p>This is an automated message. Please do not reply to this email.</p>
          <p>&copy; ${new Date().getFullYear()} Word Impact Network. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail(email, subject, html);
}
