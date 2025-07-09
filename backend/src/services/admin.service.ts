import { PrismaClient, UserRole, ApplicationStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendAdminPasswordResetVerificationEmail, sendAdminWelcomeEmail } from './email.service';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import redisClient from '@/config/redis';
import generateVerificationCode from '@/utils/generateVerificationCode';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Create a new admin
export async function createAdmin(
  email: string,
  password: string,
  fullName: string,
  adminCreationSecret: string,
) {
  try {
    logger.info('Starting admin creation process', { email, fullName });

    // Verify admin creation secret
    if (adminCreationSecret !== process.env.ADMIN_CREATION_SECRET) {
      logger.warn('Invalid admin creation secret attempt', { email });
      throw new AppError('Invalid admin creation secret', 401, ErrorTypes.AUTHENTICATION);
    }

    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (existingUser?.admin) {
      logger.warn('Admin creation failed - email already exists as admin', { email });
      throw new AppError('Admin with this email already exists', 400, ErrorTypes.DUPLICATE);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user and admin in a transaction
    logger.info('Creating admin in database transaction', { email });
    const { user, admin } = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: UserRole.ADMIN,
        },
      });

      const admin = await tx.admin.create({
        data: {
          fullName,
          user: {
            connect: { id: user.id },
          },
        },
      });

      return { user, admin };
    });

    logger.info('Admin created successfully', { adminId: admin.id, email });

    // Send welcome email without blocking the admin creation process
    sendAdminWelcomeEmail(email, fullName).catch((emailError) => {
      logger.error('Failed to send admin welcome email', {
        adminId: admin.id,
        email,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    });

    return {
      id: admin.id,
      email: user.email,
      fullName: admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in createAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Login an admin
export async function loginAdmin(email: string, password: string) {
  try {
    logger.info('Admin login attempt', { email });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { admin: true },
    });

    if (!user || user.role !== UserRole.ADMIN || !user.admin?.id) {
      logger.warn('Admin login failed - invalid credentials', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Admin login failed - invalid password', { email });
      throw new AppError('Invalid credentials', 401, ErrorTypes.AUTHENTICATION);
    }

    logger.info('Admin login successful', { adminId: user.admin.id, email });

    return {
      id: user.admin.id,
      userId: user.id,
      email: user.email,
      fullName: user.admin.fullName,
      role: user.role,
    };
  } catch (error) {
    logger.error('Error in loginAdmin', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get admin profile by user ID
export async function getAdminProfileById(userId: string) {
  try {
    logger.info('Fetching admin profile', { userId });

    // Find the admin record that corresponds to this user ID
    const admin = await prisma.admin.findFirst({
      where: { userId: userId },
      include: {
        user: true,
      },
    });

    if (!admin || admin.user.role !== UserRole.ADMIN) {
      logger.warn('Admin profile fetch failed - admin not found', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get admin statistics
    const coursesCreated = await prisma.course.count({
      where: { adminId: admin.id },
    });

    const chaptersCreated = await prisma.chapter.count({
      where: { adminId: admin.id },
    });

    const examsCreated = await prisma.exam.count({
      where: { adminId: admin.id },
    });

    const applicationsReviewed = await prisma.application.count({
      where: { adminId: admin.id },
    });

    logger.info('Admin profile retrieved successfully', { adminId: admin.id });

    return {
      id: admin.id,
      email: admin.user.email,
      fullName: admin.fullName,
      role: admin.user.role,
      createdAt: admin.createdAt,
      statistics: {
        coursesCreated,
        chaptersCreated,
        examsCreated,
        applicationsReviewed,
      },
    };
  } catch (error) {
    logger.error('Error in getAdminProfileById', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// get all students with detailed statistics and progress
export async function getAllStudentsWithSearch(
  search?: string,
  page: number = 1,
  limit: number = 10,
) {
  try {
    logger.info('Fetching all students with detailed statistics', {
      search: search || 'none',
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    const whereClause = search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { phoneNumber: { contains: search, mode: 'insensitive' as const } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
          ],
        }
      : {};

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: whereClause,
        select: {
          id: true,
          fullName: true,
          gender: true,
          phoneNumber: true,
          country: true,
          academicQualification: true,
          desiredDegree: true,
          applicationStatus: true,
          paymentStatus: true,
          profilePictureUrl: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
        orderBy: { fullName: 'asc' },
        skip,
        take: limit,
      }),
      prisma.student.count({ where: whereClause }),
    ]);

    // Get detailed statistics and progress for each student
    const studentsWithDetails = await Promise.all(
      students.map(async (student) => {
        // Get course enrollments with course details
        const enrollments = await prisma.courseEnrollment.findMany({
          where: { studentId: student.id },
          include: {
            course: {
              select: {
                id: true,
                title: true,
                durationYears: true,
              },
            },
          },
          orderBy: { enrollmentDate: 'desc' },
        });

        // Get all chapters for enrolled courses
        const enrolledCourseIds = enrollments.map((e) => e.courseId);
        const allChapters = await prisma.chapter.findMany({
          where: { courseId: { in: enrolledCourseIds } },
          select: {
            id: true,
            courseId: true,
          },
        });

        // Get chapter progress for this student
        const chapterProgress = await prisma.chapterProgress.findMany({
          where: {
            studentId: student.id,
            chapter: {
              courseId: { in: enrolledCourseIds },
            },
          },
          select: {
            isCompleted: true,
            chapter: {
              select: {
                courseId: true,
              },
            },
          },
        });

        // Get exam attempts for this student
        const examAttempts = await prisma.examAttempt.findMany({
          where: {
            studentId: student.id,
            exam: {
              chapter: {
                courseId: { in: enrolledCourseIds },
              },
            },
          },
          select: {
            isPassed: true,
            exam: {
              select: {
                chapter: {
                  select: {
                    courseId: true,
                  },
                },
              },
            },
          },
        });

        // Get video progress for this student
        const videoProgress = await prisma.videoProgress.findMany({
          where: {
            studentId: student.id,
            video: {
              chapter: {
                courseId: { in: enrolledCourseIds },
              },
            },
          },
          select: {
            watchedPercent: true,
          },
        });

        // Get certifications for this student
        const certifications = await prisma.yearCertification.findMany({
          where: { studentId: student.id },
          select: {
            id: true,
            year: true,
            course: {
              select: {
                title: true,
              },
            },
          },
        });

        // Get recent exam attempts (last 5)
        const recentExamAttempts = await prisma.examAttempt.findMany({
          where: { studentId: student.id },
          select: {
            id: true,
            score: true,
            isPassed: true,
            startTime: true,
            exam: {
              select: {
                title: true,
                chapter: {
                  select: {
                    title: true,
                    course: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { startTime: 'desc' },
          take: 5,
        });

        // Get recent video progress (last 5)
        const recentVideoProgress = await prisma.videoProgress.findMany({
          where: {
            studentId: student.id,
            video: {
              chapter: {
                courseId: { in: enrolledCourseIds },
              },
            },
          },
          select: {
            watchedPercent: true,
            lastWatchedAt: true,
            video: {
              select: {
                title: true,
                chapter: {
                  select: {
                    title: true,
                    course: {
                      select: {
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { lastWatchedAt: 'desc' },
          take: 5,
        });

        // Get application details
        const application = await prisma.application.findUnique({
          where: { studentId: student.id },
          select: {
            id: true,
            status: true,
            appliedAt: true,
            reviewedAt: true,
            rejectionReason: true,
            reviewedBy: {
              select: {
                fullName: true,
              },
            },
          },
        });

        // Get payment information
        const payments = await prisma.payment.findMany({
          where: { studentId: student.id },
          select: {
            id: true,
            amount: true,
            status: true,
            paymentMethod: true,
            paidAt: true,
            paymentDueDate: true,
          },
          orderBy: { createdAt: 'desc' },
        });

        // Calculate overall statistics
        const coursesEnrolled = enrollments.length;
        const chaptersCompleted = chapterProgress.filter((p) => p.isCompleted).length;
        const examsCompleted = examAttempts.length;
        const examsPassed = examAttempts.filter((a) => a.isPassed).length;
        const videosWatched = videoProgress.filter((v) => v.watchedPercent === 100).length;
        const videosInProgress = videoProgress.filter(
          (v) => v.watchedPercent > 0 && v.watchedPercent < 100,
        ).length;
        const certificationsEarned = certifications.length;

        // Calculate total chapters and exams across all courses
        const totalChapters = allChapters.length;
        const totalExams = await prisma.exam.count({
          where: {
            chapter: {
              courseId: { in: enrolledCourseIds },
            },
          },
        });

        // Calculate overall progress percentages
        const overallChapterProgress =
          totalChapters > 0 ? Math.round((chaptersCompleted / totalChapters) * 100) : 0;
        const overallExamProgress =
          totalExams > 0 ? Math.round((examsPassed / totalExams) * 100) : 0;

        // Calculate course-wise progress
        const courseProgress = enrollments.map((enrollment) => {
          const courseChapters = allChapters.filter((c) => c.courseId === enrollment.courseId);
          const courseChapterProgress = chapterProgress.filter(
            (p) => p.chapter.courseId === enrollment.courseId,
          );
          const completedChapters = courseChapterProgress.filter((p) => p.isCompleted).length;

          const courseExamAttempts = examAttempts.filter(
            (a) => a.exam.chapter.courseId === enrollment.courseId,
          );
          const passedExams = courseExamAttempts.filter((a) => a.isPassed).length;

          // Calculate course completion percentage
          const chapterCompletionPercentage =
            courseChapters.length > 0
              ? Math.round((completedChapters / courseChapters.length) * 100)
              : 0;

          const examCompletionPercentage =
            courseExamAttempts.length > 0
              ? Math.round((passedExams / courseExamAttempts.length) * 100)
              : 0;

          return {
            courseId: enrollment.course.id,
            courseTitle: enrollment.course.title,
            durationYears: enrollment.course.durationYears,
            enrollmentDate: enrollment.enrollmentDate,
            progress: {
              chaptersCompleted: completedChapters,
              totalChapters: courseChapters.length,
              chapterCompletionPercentage,
              examsPassed: passedExams,
              totalExams: courseExamAttempts.length,
              examCompletionPercentage,
            },
          };
        });

        return {
          id: student.id,
          fullName: student.fullName,
          gender: student.gender,
          phoneNumber: student.phoneNumber,
          email: student.user.email,
          country: student.country,
          academicQualification: student.academicQualification,
          desiredDegree: student.desiredDegree,
          applicationStatus: student.applicationStatus,
          paymentStatus: student.paymentStatus,
          profilePictureUrl: student.profilePictureUrl,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
          statistics: {
            coursesEnrolled,
            chaptersCompleted,
            totalChapters,
            overallChapterProgress,
            examsCompleted,
            examsPassed,
            totalExams,
            overallExamProgress,
            videosWatched,
            videosInProgress,
            certificationsEarned,
          },
          courseProgress,
          recentActivity: {
            recentExamAttempts: recentExamAttempts.map((attempt) => ({
              id: attempt.id,
              examTitle: attempt.exam.title,
              chapterTitle: attempt.exam.chapter.title,
              courseTitle: attempt.exam.chapter.course.title,
              score: attempt.score || 0,
              isPassed: attempt.isPassed,
              startTime: attempt.startTime,
            })),
            recentVideoProgress: recentVideoProgress.map((progress) => ({
              videoTitle: progress.video.title,
              chapterTitle: progress.video.chapter.title,
              courseTitle: progress.video.chapter.course.title,
              watchedPercent: progress.watchedPercent,
              lastWatchedAt: progress.lastWatchedAt,
            })),
          },
          application: application
            ? {
                id: application.id,
                status: application.status,
                appliedAt: application.appliedAt,
                reviewedAt: application.reviewedAt,
                rejectionReason: application.rejectionReason,
                reviewedBy: application.reviewedBy?.fullName,
              }
            : null,
          payments: payments.map((payment) => ({
            id: payment.id,
            amount: payment.amount.toString(),
            status: payment.status,
            paymentMethod: payment.paymentMethod,
            paidAt: payment.paidAt,
            paymentDueDate: payment.paymentDueDate,
          })),
        };
      }),
    );

    const totalPages = Math.ceil(total / limit);

    return {
      students: studentsWithDetails,
      total,
      totalPages,
    };
  } catch (error) {
    logger.error('Error in getAllStudentsWithSearch', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Initiate password reset
export async function initiatePasswordReset(
  userId: string,
  oldPassword: string,
  newPassword: string,
) {
  try {
    logger.info('Initiating password reset process', { userId });

    // Find the admin by userId
    const admin = await prisma.admin.findFirst({
      where: { userId },
      include: {
        user: true,
      },
    });

    if (!admin || admin.user.role !== UserRole.ADMIN) {
      logger.warn('Password reset failed - admin not found', { userId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify the old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, admin.user.password);
    if (!isOldPasswordValid) {
      logger.warn('Password reset failed - invalid old password', { userId });
      throw new AppError('Invalid old password', 401, ErrorTypes.AUTHENTICATION);
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Generate a verification code
    const verificationCode = generateVerificationCode(8);

    // Generate a unique reset ID
    const resetId = crypto.randomUUID();

    // Store the reset request in Redis (with 30 minute expiration)
    const resetData = {
      userId,
      newPasswordHash,
      verificationCode,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    };

    await redisClient.set(
      `password_reset:${resetId}`,
      JSON.stringify(resetData),
      { EX: 1800 }, // 30 minutes in seconds
    );

    // Send verification code via email
    await sendAdminPasswordResetVerificationEmail(
      admin.user.email,
      admin.fullName,
      verificationCode,
    );

    logger.info('Password reset initiated successfully', { userId, resetId });

    return { resetId };
  } catch (error) {
    logger.error('Error in initiatePasswordReset', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Complete password reset
export async function completePasswordReset(
  userId: string,
  resetId: string,
  verificationCode: string,
) {
  try {
    logger.info('Completing password reset', { userId, resetId });

    // Get reset data from Redis
    const resetDataJson = await redisClient.get(`password_reset:${resetId}`);

    if (!resetDataJson) {
      logger.warn('Password reset completion failed - invalid or expired reset ID', {
        userId,
        resetId,
      });
      throw new AppError('Invalid or expired reset request', 400, ErrorTypes.VALIDATION);
    }

    const resetData = JSON.parse(resetDataJson);

    // Verify this reset belongs to the current user
    if (resetData.userId !== userId) {
      logger.warn('Password reset completion failed - user ID mismatch', { userId, resetId });
      throw new AppError('Invalid reset request', 400, ErrorTypes.VALIDATION);
    }

    // Check if reset request has expired (additional check even though Redis handles expiration)
    if (new Date() > new Date(resetData.expiresAt)) {
      // Clean up expired request
      await redisClient.del(`password_reset:${resetId}`);
      logger.warn('Password reset completion failed - request expired', { userId, resetId });
      throw new AppError('Reset request has expired', 400, ErrorTypes.VALIDATION);
    }

    // Verify the verification code
    if (resetData.verificationCode !== verificationCode) {
      logger.warn('Password reset completion failed - invalid verification code', {
        userId,
        resetId,
      });
      throw new AppError('Invalid verification code', 400, ErrorTypes.VALIDATION);
    }

    // Update the password in the database
    await prisma.user.update({
      where: { id: userId },
      data: { password: resetData.newPasswordHash },
    });

    // Clean up the reset request from Redis
    await redisClient.del(`password_reset:${resetId}`);

    logger.info('Password reset completed successfully', { userId });

    return { success: true };
  } catch (error) {
    logger.error('Error in completePasswordReset', {
      userId,
      resetId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update application status
export async function updateApplicationStatus(
  applicationId: string,
  adminId: string,
  status: ApplicationStatus,
  rejectionReason?: string,
) {
  try {
    logger.info('Updating application status', { applicationId, status });

    // Check if admin exists
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    if (!admin) {
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 404, ErrorTypes.NOT_FOUND);
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        reviewedBy: {
          connect: { id: adminId },
        },
        reviewedAt: new Date(),
        rejectionReason: status === ApplicationStatus.REJECTED ? rejectionReason : null,
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
    });

    logger.info('Application status updated successfully', {
      applicationId,
      status,
      studentId: updatedApplication.student?.id,
    });

    return updatedApplication;
  } catch (error) {
    logger.error('Error updating application status', {
      applicationId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get admin dashboard statistics
export async function getAdminDashboardStats() {
  try {
    logger.info('Fetching admin dashboard statistics');

    // Get counts for various entities
    const [
      totalStudents,
      totalCourses,
      totalChapters,
      totalVideos,
      totalExams,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      studentsWithPendingPayment,
      totalPayments,
      totalRevenueResult,
      recentStudentRegistrations,
      recentApplications,
      courseEnrollmentStats,
      mostWatchedVideos,
    ] = await Promise.all([
      // Basic counts
      prisma.student.count(),
      prisma.course.count(),
      prisma.chapter.count(),
      prisma.video.count(),
      prisma.exam.count(),

      // Application stats
      prisma.application.count(),
      prisma.application.count({ where: { status: ApplicationStatus.PENDING } }),
      prisma.application.count({ where: { status: ApplicationStatus.APPROVED } }),
      prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),

      // Payment stats
      prisma.student.count({ where: { paymentStatus: PaymentStatus.PENDING } }),
      prisma.payment.count(),
      prisma.$queryRaw<
        { total: number }[]
      >`SELECT SUM(amount::numeric) as total FROM payments WHERE status = 'PAID'`,

      // Recent activity
      prisma.student.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          createdAt: true,
          user: { select: { email: true } },
        },
      }),

      prisma.application.findMany({
        take: 5,
        orderBy: { appliedAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          status: true,
          appliedAt: true,
        },
      }),

      // Course enrollment statistics
      prisma.courseEnrollment.groupBy({
        by: ['courseId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),

      // Most watched videos
      prisma.videoProgress.groupBy({
        by: ['videoId'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
    ]);

    // Get course details for the enrollment stats
    const courseIds = courseEnrollmentStats.map((stat) => stat.courseId);
    const courses = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, title: true },
    });

    // Get video details for most watched videos
    const videoIds = mostWatchedVideos.map((stat) => stat.videoId);
    const videos = await prisma.video.findMany({
      where: { id: { in: videoIds } },
      select: {
        id: true,
        title: true,
        chapterId: true,
        chapter: { select: { title: true, courseId: true, course: { select: { title: true } } } },
      },
    });

    // Map the course title to enrollment stats
    const enrollmentStats = courseEnrollmentStats.map((stat) => {
      const course = courses.find((c) => c.id === stat.courseId);
      return {
        courseId: stat.courseId,
        courseTitle: course?.title || 'Unknown Course',
        enrollmentCount: stat._count.id,
      };
    });

    // Map video details to most watched videos
    const popularVideos = mostWatchedVideos.map((stat) => {
      const video = videos.find((v) => v.id === stat.videoId);
      return {
        videoId: stat.videoId,
        videoTitle: video?.title || 'Unknown Video',
        chapterTitle: video?.chapter.title || 'Unknown Chapter',
        courseTitle: video?.chapter.course.title || 'Unknown Course',
        watchCount: stat._count.id,
      };
    });

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    logger.info('Admin dashboard statistics retrieved successfully');

    return {
      counts: {
        students: totalStudents,
        courses: totalCourses,
        chapters: totalChapters,
        videos: totalVideos,
        exams: totalExams,
      },
      applications: {
        total: totalApplications,
        pending: pendingApplications,
        approved: approvedApplications,
        rejected: rejectedApplications,
      },
      payments: {
        studentsWithPendingPayment,
        totalPayments,
        totalRevenue,
      },
      recentActivity: {
        newStudents: recentStudentRegistrations.map((student) => ({
          id: student.id,
          name: student.fullName,
          email: student.user.email,
          registeredAt: student.createdAt,
        })),
        newApplications: recentApplications.map((app) => ({
          id: app.id,
          name: app.fullName,
          email: app.email,
          status: app.status,
          appliedAt: app.appliedAt,
        })),
      },
      courseStats: {
        popularCourses: enrollmentStats,
      },
      videoStats: {
        popularVideos,
      },
    };
  } catch (error) {
    logger.error('Error in getAdminDashboardStats', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
