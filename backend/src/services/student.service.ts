import { PrismaClient, Gender, ApplicationStatus, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendApplicationConfirmationEmail } from './email.service';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

// Register a new student
export async function registerStudent(
  email: string,
  fullName: string,
  gender: Gender,
  dateOfBirth: Date,
  phoneNumber: string,
  country: string,
  academicQualification: string,
  desiredDegree: string,
  certificateFile?: Express.Multer.File,
  recommendationLetterFile?: Express.Multer.File,
  referredBy?: string,
  referrerContact?: string,
  agreesToTerms: boolean = false,
) {
  try {
    const normalizedEmail = email.toLowerCase();
    logger.info('Application registration attempt', { email: normalizedEmail });

    // Check if application already exists
    const existingApplication = await prisma.application.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingApplication) {
      logger.warn('Application registration failed - email already exists', {
        email: normalizedEmail,
      });
      throw new AppError('Email already registered', 400, ErrorTypes.VALIDATION);
    }

    // Upload files if provided
    let certificateUrl: string | undefined;
    let recommendationLetterUrl: string | undefined;

    if (certificateFile) {
      certificateUrl = await uploadToCloudinary(certificateFile.buffer);
    }

    if (recommendationLetterFile) {
      recommendationLetterUrl = await uploadToCloudinary(recommendationLetterFile.buffer);
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        email: normalizedEmail,
        fullName,
        gender,
        dateOfBirth,
        phoneNumber,
        country,
        academicQualification,
        desiredDegree,
        certificateUrl,
        recommendationLetterUrl,
        referredBy,
        referrerContact,
        agreesToTerms,
        status: ApplicationStatus.PENDING,
      },
    });

    logger.info('Application created successfully', {
      applicationId: application.id,
      email: normalizedEmail,
    });

    // Send confirmation email
    sendApplicationConfirmationEmail(normalizedEmail, fullName, application.id).catch(
      (emailError) => {
        logger.error('Failed to send application confirmation email', {
          applicationId: application.id,
          email: normalizedEmail,
          error: emailError instanceof Error ? emailError.message : String(emailError),
        });
      },
    );

    return {
      id: application.id,
      email: normalizedEmail,
      fullName,
      applicationStatus: application.status,
    };
  } catch (error) {
    logger.error('Error in registerStudent', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Login a student
export async function loginStudent(email: string, password: string) {
  try {
    // Convert email to lowercase
    const normalizedEmail = email.toLowerCase();
    logger.info('Student login attempt', { email: normalizedEmail });

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        student: {
          include: {
            application: true,
          },
        },
      },
    });

    // Check if user exists and is a student
    if (!user || user.role !== UserRole.STUDENT || !user.student) {
      logger.warn('Student login failed - invalid credentials', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Student login failed - invalid password', { email });
      throw new AppError('Invalid email or password', 401);
    }

    // Check if student's application is approved
    if (user.student.applicationStatus !== ApplicationStatus.APPROVED) {
      logger.warn('Student login failed - application not approved', {
        email,
        applicationStatus: user.student.applicationStatus,
      });

      // Different message based on application status
      if (user.student.applicationStatus === ApplicationStatus.PENDING) {
        throw new AppError(
          'Your application is still pending approval. Please wait for admin review.',
          403,
        );
      } else if (user.student.applicationStatus === ApplicationStatus.REJECTED) {
        throw new AppError(
          'Your application has been rejected. Please check your email for details.',
          403,
        );
      } else {
        throw new AppError('Your account is not active. Please contact support.', 403);
      }
    }

    logger.info('Student login successful', {
      studentId: user.student.id,
      email: user.email,
    });

    return {
      id: user.student.id,
      userId: user.id,
      email: user.email,
      fullName: user.student.fullName,
      role: user.role,
      applicationStatus: user.student.applicationStatus,
    };
  } catch (error) {
    logger.error('Error in loginStudent', {
      email,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get student profile by user ID
export async function getStudentProfileByUserId(userId: string) {
  try {
    logger.info('Fetching student profile', { userId });

    // Find the student based on the user ID
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      include: {
        user: true,
      },
    });

    if (!student) {
      logger.warn('Student profile fetch failed - student not found', { userId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get course enrollments with progress
    const courseEnrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: true,
      },
      orderBy: {
        enrollmentDate: 'desc',
      },
    });

    // Calculate progress for each course
    const enrollmentsWithProgress = await Promise.all(
      courseEnrollments.map(async (enrollment) => {
        // Find all chapters for this course
        const totalChapters = await prisma.chapter.count({
          where: { courseId: enrollment.courseId },
        });

        // Find completed chapters for this student in this course
        const completedChapters = await prisma.chapterProgress.count({
          where: {
            studentId: student.id,
            chapter: {
              courseId: enrollment.courseId,
            },
            isCompleted: true,
          },
        });

        const percentComplete =
          totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

        return {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          durationYears: enrollment.course.durationYears,
          enrollmentDate: enrollment.enrollmentDate,
          isActive: enrollment.isActive,
          progress: {
            completedChapters,
            totalChapters,
            percentComplete,
          },
        };
      }),
    );

    // Get exam attempts
    const examAttempts = await prisma.examAttempt.findMany({
      where: { studentId: student.id },
      include: {
        exam: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 5, // Limit to 5 most recent attempts
    });

    const formattedExamAttempts = examAttempts.map((attempt) => ({
      id: attempt.id,
      examTitle: attempt.exam.title,
      chapterTitle: attempt.exam.chapter.title,
      score: attempt.score || 0,
      isPassed: attempt.isPassed,
      attemptDate: attempt.startTime,
    }));

    // Get certifications
    const certifications = await prisma.yearCertification.findMany({
      where: { studentId: student.id },
      include: {
        course: true,
      },
      orderBy: {
        issuedAt: 'desc',
      },
    });

    const formattedCertifications = certifications.map((cert) => ({
      id: cert.id,
      courseName: cert.course.title,
      year: cert.year,
      certificateUrl: cert.certificateUrl,
      issuedAt: cert.issuedAt,
    }));

    // Get video progress
    const videoProgress = await prisma.videoProgress.findMany({
      where: { studentId: student.id },
      include: {
        video: {
          include: {
            chapter: true,
          },
        },
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
      take: 5, // Limit to 5 most recently watched
    });

    const formattedVideoProgress = videoProgress.map((progress) => ({
      id: progress.video.id,
      title: progress.video.title,
      chapterTitle: progress.video.chapter.title,
      watchedPercent: progress.watchedPercent,
      lastWatchedAt: progress.lastWatchedAt,
    }));

    // Count total videos watched (100%)
    const totalWatchedVideos = await prisma.videoProgress.count({
      where: {
        studentId: student.id,
        watchedPercent: 100,
      },
    });

    // Count videos in progress (1-99%)
    const inProgressVideos = await prisma.videoProgress.count({
      where: {
        studentId: student.id,
        watchedPercent: {
          gt: 0,
          lt: 100,
        },
      },
    });

    logger.info('Student profile retrieved successfully', { studentId: student.id });

    // Construct comprehensive profile response
    return {
      profile: {
        id: student.id,
        email: student.user.email,
        fullName: student.fullName,
        gender: student.gender,
        dateOfBirth: student.dateOfBirth,
        phoneNumber: student.phoneNumber,
        country: student.country,
        academicQualification: student.academicQualification,
        desiredDegree: student.desiredDegree,
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
      },
      enrollments: {
        total: courseEnrollments.length,
        active: courseEnrollments.filter((e) => e.isActive).length,
        courses: enrollmentsWithProgress,
      },
      examAttempts: {
        total: await prisma.examAttempt.count({ where: { studentId: student.id } }),
        passed: await prisma.examAttempt.count({
          where: {
            studentId: student.id,
            isPassed: true,
          },
        }),
        recent: formattedExamAttempts,
      },
      certifications: {
        total: certifications.length,
        certificates: formattedCertifications,
      },
      videoProgress: {
        totalWatched: totalWatchedVideos,
        inProgress: inProgressVideos,
        recentlyWatched: formattedVideoProgress,
      },
    };
  } catch (error) {
    logger.error('Error in getStudentProfileByUserId', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
