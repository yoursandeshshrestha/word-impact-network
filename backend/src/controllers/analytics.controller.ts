import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import {
  getAnalyticsData,
  getEnrollmentTrends,
  getCourseCompletionRates,
  getVideoEngagementMetrics,
  getExamPerformanceMetrics,
  getStudentProgressData,
  getStudentGeographicDistribution,
  getCourseReferralStats,
} from '../services/analytics.service';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

/**
 * Controller to get comprehensive analytics dashboard data
 */
export const getAnalyticsDashboard = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  logger.info('Fetching analytics dashboard', { userId: req.user.userId });

  const analyticsData = await getAnalyticsData();

  sendSuccess(res, 200, 'Analytics data retrieved successfully', analyticsData);
});

/**
 * Controller to get enrollment trends with period filter
 */
export const getEnrollmentTrendsController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // The period value has already been validated by middleware
  const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

  logger.info('Fetching enrollment trends', {
    userId: req.user.userId,
    period,
  });

  const trendsData = await getEnrollmentTrends(period);

  sendSuccess(res, 200, 'Enrollment trends retrieved successfully', {
    period,
    trends: trendsData,
  });
});

/**
 * Controller to get course completion rates
 */
export const getCourseCompletionRatesController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    logger.info('Fetching course completion rates', { userId: req.user.userId });

    const completionRates = await getCourseCompletionRates();

    sendSuccess(res, 200, 'Course completion rates retrieved successfully', completionRates);
  },
);

/**
 * Controller to get video engagement metrics
 */
export const getVideoEngagementController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // The limit value has already been validated by middleware
  const limit = parseInt((req.query.limit as string) || '10', 10);

  logger.info('Fetching video engagement metrics', {
    userId: req.user.userId,
    limit,
  });

  const engagementData = await getVideoEngagementMetrics(limit);

  sendSuccess(res, 200, 'Video engagement metrics retrieved successfully', engagementData);
});

/**
 * Controller to get exam performance metrics
 */
export const getExamPerformanceController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  logger.info('Fetching exam performance metrics', { userId: req.user.userId });

  const performanceData = await getExamPerformanceMetrics();

  sendSuccess(res, 200, 'Exam performance metrics retrieved successfully', performanceData);
});

/**
 * Controller to get student progress data
 */
export const getStudentProgressController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  // The limit value has already been validated by middleware
  const limit = parseInt((req.query.limit as string) || '10', 10);

  logger.info('Fetching student progress data', {
    userId: req.user.userId,
    limit,
  });

  const progressData = await getStudentProgressData(limit);

  sendSuccess(res, 200, 'Student progress data retrieved successfully', progressData);
});

/**
 * Controller to get student geographic distribution
 */
export const getGeographicDistributionController = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
    }

    logger.info('Fetching geographic distribution', { userId: req.user.userId });

    const distributionData = await getStudentGeographicDistribution();

    sendSuccess(
      res,
      200,
      'Student geographic distribution retrieved successfully',
      distributionData,
    );
  },
);

/**
 * Controller to get referral statistics
 */
export const getReferralStatsController = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  logger.info('Fetching referral statistics', { userId: req.user.userId });

  const referralData = await getCourseReferralStats();

  sendSuccess(res, 200, 'Referral statistics retrieved successfully', referralData);
});
