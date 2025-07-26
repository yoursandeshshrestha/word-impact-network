import { PrismaClient } from '@prisma/client';
import Razorpay from 'razorpay';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { sendPaymentConfirmationEmail } from './email.service';

const prisma = new PrismaClient();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  studentId: string;
}

export interface CreateApplicationOrderRequest {
  amount: number;
  currency?: string;
  applicationId: string;
  email: string;
  fullName: string;
}

export interface PaymentVerificationRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Create a new payment order
export async function createPaymentOrder(data: CreateOrderRequest) {
  try {
    logger.info('Creating payment order', { studentId: data.studentId, amount: data.amount });

    // Validate student exists
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    });

    if (!student) {
      logger.warn('Payment order creation failed - student not found', {
        studentId: data.studentId,
      });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Validate amount
    if (data.amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400, ErrorTypes.VALIDATION);
    }

    if (data.amount > 100000) {
      throw new AppError('Amount cannot exceed ₹1,00,000', 400, ErrorTypes.VALIDATION);
    }

    if (!Number.isInteger(data.amount)) {
      throw new AppError('Amount must be a whole number', 400, ErrorTypes.VALIDATION);
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(data.amount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: data.currency || 'INR',
      receipt: `payment_${Date.now()}`,
      notes: {
        studentId: data.studentId,
        studentName: student.fullName,
      },
    });

    // Create payment record in database
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'INR',
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        studentId: data.studentId,
      },
    });

    logger.info('Payment order created successfully', {
      paymentId: payment.id,
      razorpayOrderId: razorpayOrder.id,
      studentId: data.studentId,
    });

    return {
      paymentId: payment.id,
      orderId: razorpayOrder.id,
      amount: data.amount,
      currency: data.currency || 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    logger.error('Error creating payment order', {
      studentId: data.studentId,
      amount: data.amount,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Create a payment order for application (before student account is created)
export async function createApplicationPaymentOrder(data: CreateApplicationOrderRequest) {
  try {
    logger.info('Creating application payment order', {
      applicationId: data.applicationId,
      amount: data.amount,
      email: data.email,
    });

    // Validate application exists
    const application = await prisma.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      logger.warn('Application payment order creation failed - application not found', {
        applicationId: data.applicationId,
      });
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Validate amount
    if (data.amount <= 0) {
      throw new AppError('Amount must be greater than 0', 400, ErrorTypes.VALIDATION);
    }

    if (data.amount > 100000) {
      throw new AppError('Amount cannot exceed ₹1,00,000', 400, ErrorTypes.VALIDATION);
    }

    if (!Number.isInteger(data.amount)) {
      throw new AppError('Amount must be a whole number', 400, ErrorTypes.VALIDATION);
    }

    // Convert amount to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(data.amount * 100);

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: data.currency || 'INR',
      receipt: `application_payment_${Date.now()}`,
      notes: {
        applicationId: data.applicationId,
        applicantName: data.fullName,
        applicantEmail: data.email,
      },
    });

    // Create payment record in database (without studentId since student doesn't exist yet)
    const payment = await prisma.payment.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'INR',
        status: 'PENDING',
        paymentMethod: 'RAZORPAY',
        razorpayOrderId: razorpayOrder.id,
        applicationId: data.applicationId,
        studentId: null, // Will be updated when student account is created
      },
    });

    logger.info('Application payment order created successfully', {
      paymentId: payment.id,
      razorpayOrderId: razorpayOrder.id,
      applicationId: data.applicationId,
    });

    return {
      paymentId: payment.id,
      orderId: razorpayOrder.id,
      amount: data.amount,
      currency: data.currency || 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  } catch (error) {
    logger.error('Error creating application payment order', {
      applicationId: data.applicationId,
      amount: data.amount,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Verify application payment signature and update payment status
export async function verifyApplicationPayment(data: PaymentVerificationRequest) {
  try {
    logger.info('Verifying application payment', {
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
    });

    // Verify signature
    const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== data.razorpay_signature) {
      logger.warn('Application payment verification failed - invalid signature', {
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
      });
      throw new AppError('Invalid payment signature', 400, ErrorTypes.VALIDATION);
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: data.razorpay_order_id },
      include: { application: true },
    });

    if (!payment) {
      logger.warn('Application payment verification failed - payment record not found', {
        orderId: data.razorpay_order_id,
      });
      throw new AppError('Payment record not found', 404, ErrorTypes.NOT_FOUND);
    }

    if (payment.status === 'PAID') {
      logger.info('Application payment already verified', { paymentId: payment.id });
      return payment;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: data.razorpay_payment_id,
        transactionId: data.razorpay_payment_id,
        paidAt: new Date(),
      },
      include: { application: true },
    });

    logger.info('Application payment verified successfully', {
      paymentId: payment.id,
      orderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
    });

    return updatedPayment;
  } catch (error) {
    logger.error('Error verifying application payment', {
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Verify payment signature and update payment status
export async function verifyPayment(data: PaymentVerificationRequest) {
  try {
    logger.info('Verifying payment', {
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
    });

    // Verify signature
    const text = `${data.razorpay_order_id}|${data.razorpay_payment_id}`;
    const crypto = require('crypto');
    const signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex');

    if (signature !== data.razorpay_signature) {
      logger.warn('Payment verification failed - invalid signature', {
        orderId: data.razorpay_order_id,
        paymentId: data.razorpay_payment_id,
      });
      throw new AppError('Invalid payment signature', 400, ErrorTypes.VALIDATION);
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: { razorpayOrderId: data.razorpay_order_id },
      include: { student: { include: { user: true } } },
    });

    if (!payment) {
      logger.warn('Payment verification failed - payment record not found', {
        orderId: data.razorpay_order_id,
      });
      throw new AppError('Payment record not found', 404, ErrorTypes.NOT_FOUND);
    }

    if (payment.status === 'PAID') {
      logger.info('Payment already verified', { paymentId: payment.id });
      return payment;
    }

    // Update payment status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'PAID',
        razorpayPaymentId: data.razorpay_payment_id,
        transactionId: data.razorpay_payment_id,
        paidAt: new Date(),
      },
      include: { student: { include: { user: true } } },
    });

    // Update student payment status if student exists
    if (payment.studentId) {
      await prisma.student.update({
        where: { id: payment.studentId },
        data: {
          hasPaid: true,
          paymentStatus: 'PAID',
        },
      });
    }

    // Send confirmation email if student exists
    if (payment.student) {
      try {
        await sendPaymentConfirmationEmail(
          payment.student.user.email,
          payment.student.fullName,
          `${payment.amount} ${payment.currency}`,
          data.razorpay_payment_id,
        );
      } catch (emailError) {
        logger.error('Failed to send payment confirmation email', {
          paymentId: payment.id,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      }
    }

    logger.info('Payment verified successfully', {
      paymentId: payment.id,
      orderId: data.razorpay_order_id,
      razorpayPaymentId: data.razorpay_payment_id,
    });

    return updatedPayment;
  } catch (error) {
    logger.error('Error verifying payment', {
      orderId: data.razorpay_order_id,
      paymentId: data.razorpay_payment_id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get payment by ID
export async function getPaymentById(paymentId: string) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment not found', 404, ErrorTypes.NOT_FOUND);
    }

    return payment;
  } catch (error) {
    logger.error('Error getting payment by ID', {
      paymentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get all payments with pagination
export async function getAllPayments(page: number = 1, limit: number = 10) {
  try {
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            include: {
              user: {
                select: {
                  email: true,
                },
              },
            },
          },
          application: {
            select: {
              fullName: true,
              email: true,
            },
          },
        },
      }),
      prisma.payment.count(),
    ]);

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting all payments', {
      page,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get student's payment status
export async function getStudentPaymentStatus(studentId: string) {
  try {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: {
        hasPaid: true,
        paymentStatus: true,
        payments: {
          where: { status: 'PAID' },
          select: {
            id: true,
            amount: true,
            currency: true,
            paidAt: true,
          },
          orderBy: { paidAt: 'desc' },
        },
      },
    });

    if (!student) {
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Calculate total contribution
    const totalContribution = student.payments.reduce(
      (sum, payment) => sum + Number(payment.amount),
      0,
    );

    return {
      hasPaid: student.hasPaid,
      paymentStatus: student.paymentStatus,
      lastPayment: student.payments[0] || null,
      totalContribution,
      totalPayments: student.payments.length,
    };
  } catch (error) {
    logger.error('Error getting student payment status', {
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
