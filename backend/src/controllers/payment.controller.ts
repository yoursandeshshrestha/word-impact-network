import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../utils/catchAsync';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentById,
  getAllPayments,
  getStudentPaymentStatus,
  CreateOrderRequest,
  PaymentVerificationRequest,
  createApplicationPaymentOrder,
  verifyApplicationPayment,
  CreateApplicationOrderRequest,
} from '../services/payment.service';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Create payment order
export const createOrder = catchAsync(async (req: Request, res: Response) => {
  const { amount, currency } = req.body;

  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  if (!amount || amount <= 0) {
    throw new AppError('Valid amount is required', 400, ErrorTypes.VALIDATION);
  }

  // Get student ID from user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  const orderData: CreateOrderRequest = {
    amount: parseFloat(amount),
    currency: currency || 'INR',
    studentId: student.id,
  };

  const result = await createPaymentOrder(orderData);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

// Verify payment
export const verifyPaymentController = catchAsync(async (req: Request, res: Response) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError('Payment verification parameters are required', 400, ErrorTypes.VALIDATION);
  }

  const verificationData: PaymentVerificationRequest = {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  };

  const payment = await verifyPayment(verificationData);

  res.status(200).json({
    status: 'success',
    data: {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      transactionId: payment.transactionId,
      paidAt: payment.paidAt,
    },
  });
});

// Get payment by ID (admin only)
export const getPayment = catchAsync(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  if (!paymentId) {
    throw new AppError('Payment ID is required', 400, ErrorTypes.VALIDATION);
  }

  const payment = await getPaymentById(paymentId);

  res.status(200).json({
    status: 'success',
    data: payment,
  });
});

// Get all payments (admin only)
export const getAllPaymentsController = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getAllPayments(page, limit);

  res.status(200).json({
    status: 'success',
    data: result.payments,
    pagination: result.pagination,
  });
});

// Get student's payment status
export const getStudentPaymentStatusController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user || !req.user.userId) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // Get student ID from user ID
  const student = await prisma.student.findFirst({
    where: { userId: req.user.userId },
  });

  if (!student) {
    throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
  }

  const paymentStatus = await getStudentPaymentStatus(student.id);

  res.status(200).json({
    status: 'success',
    data: paymentStatus,
  });
});

// Get payment statistics (admin only)
export const getPaymentStats = catchAsync(async (req: Request, res: Response) => {
  const [
    totalPayments,
    totalAmount,
    paidPayments,
    pendingPayments,
    todayPayments,
    todayAmount,
    uniqueStudentsPaid,
  ] = await Promise.all([
    prisma.payment.count(),
    prisma.payment.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: { status: 'PAID' } }),
    prisma.payment.count({ where: { status: 'PENDING' } }),
    prisma.payment.count({
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
      _sum: { amount: true },
    }),
    // Count unique students who have made payments
    prisma.student.count({
      where: {
        hasPaid: true,
      },
    }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      paidPayments,
      pendingPayments,
      todayPayments,
      todayAmount: todayAmount._sum.amount || 0,
      uniqueStudentsPaid,
    },
  });
});

// Create application payment order (no authentication required)
export const createApplicationOrder = catchAsync(async (req: Request, res: Response) => {
  const { amount, currency, applicationId, email, fullName } = req.body;

  if (!amount || amount <= 0) {
    throw new AppError('Valid amount is required', 400, ErrorTypes.VALIDATION);
  }

  if (!applicationId) {
    throw new AppError('Application ID is required', 400, ErrorTypes.VALIDATION);
  }

  if (!email) {
    throw new AppError('Email is required', 400, ErrorTypes.VALIDATION);
  }

  if (!fullName) {
    throw new AppError('Full name is required', 400, ErrorTypes.VALIDATION);
  }

  const orderData: CreateApplicationOrderRequest = {
    amount: parseFloat(amount),
    currency: currency || 'INR',
    applicationId,
    email,
    fullName,
  };

  const result = await createApplicationPaymentOrder(orderData);

  res.status(201).json({
    status: 'success',
    data: result,
  });
});

// Verify application payment (no authentication required)
export const verifyApplicationPaymentController = catchAsync(
  async (req: Request, res: Response) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError(
        'Payment verification parameters are required',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    const verificationData: PaymentVerificationRequest = {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    };

    const payment = await verifyApplicationPayment(verificationData);

    res.status(200).json({
      status: 'success',
      data: {
        paymentId: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        transactionId: payment.transactionId,
        paidAt: payment.paidAt,
        applicationId: payment.applicationId,
      },
    });
  },
);
