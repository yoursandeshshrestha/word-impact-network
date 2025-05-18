import { PrismaClient, Gender, ApplicationStatus, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendApplicationConfirmationEmail } from './email.service';
import bcrypt from 'bcryptjs';
import { StudentProfileUpdateData } from '@/types/types';
import { updateChapterProgressBasedOnVideo } from '@/utils/progressUtils';
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
        dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
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

// Update student profile by user ID
export async function updateStudentProfileByUserId(
  userId: string,
  updateData: StudentProfileUpdateData,
) {
  try {
    logger.info('Updating student profile', { userId });

    // Find the student based on the user ID
    const student = await prisma.student.findFirst({
      where: { userId: userId },
      include: {
        user: true,
      },
    });

    if (!student) {
      logger.warn('Student profile update failed - student not found', { userId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Prepare update data
    const updateFields: any = {};

    // Only include fields that are provided and different from current values
    if (updateData.fullName !== undefined && updateData.fullName !== student.fullName) {
      updateFields.fullName = updateData.fullName;
    }

    if (updateData.phoneNumber !== undefined && updateData.phoneNumber !== student.phoneNumber) {
      updateFields.phoneNumber = updateData.phoneNumber;
    }

    if (updateData.country !== undefined && updateData.country !== student.country) {
      updateFields.country = updateData.country;
    }

    if (
      updateData.dateOfBirth !== undefined &&
      updateData.dateOfBirth.toISOString() !== student.dateOfBirth.toISOString()
    ) {
      updateFields.dateOfBirth = updateData.dateOfBirth;
    }

    if (updateData.gender !== undefined && updateData.gender !== student.gender) {
      updateFields.gender = updateData.gender;
    }

    // If no updates were provided
    if (Object.keys(updateFields).length === 0) {
      logger.info('No changes detected for student profile update', { studentId: student.id });
      return {
        message: 'No changes were made to the profile',
        profile: {
          id: student.id,
          email: student.user.email,
          fullName: student.fullName,
          phoneNumber: student.phoneNumber,
          country: student.country,
          gender: student.gender,
          dateOfBirth: student.dateOfBirth.toISOString().split('T')[0],
        },
      };
    }

    // Update the student record
    const updatedStudent = await prisma.student.update({
      where: { id: student.id },
      data: updateFields,
    });

    logger.info('Student profile updated successfully', {
      studentId: student.id,
      updatedFields: Object.keys(updateFields).join(', '),
    });

    return {
      message: 'Profile updated successfully',
      profile: {
        id: updatedStudent.id,
        email: student.user.email,
        fullName: updatedStudent.fullName,
        phoneNumber: updatedStudent.phoneNumber,
        country: updatedStudent.country,
        gender: updatedStudent.gender,
        dateOfBirth: updatedStudent.dateOfBirth.toISOString().split('T')[0],
      },
    };
  } catch (error) {
    logger.error('Error in updateStudentProfileByUserId', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get student's enrolled courses
export async function getStudentEnrolledCourses(studentId: string) {
  try {
    logger.info('Fetching enrolled courses for student', { studentId });

    // Find the student first to verify they exist
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Enrolled courses fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get course enrollments with course details
    const courseEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        isActive: true,
      },
      include: {
        course: {
          include: {
            chapters: {
              select: {
                id: true,
                title: true,
                description: true,
                orderIndex: true,
                courseYear: true,
                _count: {
                  select: {
                    videos: true,
                  },
                },
              },
              orderBy: {
                orderIndex: 'asc',
              },
            },
            _count: {
              select: {
                chapters: true,
              },
            },
          },
        },
      },
      orderBy: {
        enrollmentDate: 'desc',
      },
    });

    // Calculate progress for each course
    const coursesWithProgress = await Promise.all(
      courseEnrollments.map(async (enrollment) => {
        // Count total chapters in the course
        const totalChapters = enrollment.course._count.chapters;

        // Count completed chapters for this student in this course
        const completedChapters = await prisma.chapterProgress.count({
          where: {
            studentId: studentId,
            chapter: {
              courseId: enrollment.course.id,
            },
            isCompleted: true,
          },
        });

        // Calculate videos watched in this course
        const totalVideosInCourse = await prisma.video.count({
          where: {
            chapter: {
              courseId: enrollment.course.id,
            },
          },
        });

        const watchedVideosInCourse = await prisma.videoProgress.count({
          where: {
            studentId: studentId,
            video: {
              chapter: {
                courseId: enrollment.course.id,
              },
            },
            watchedPercent: 100,
          },
        });

        // Calculate progress percentages
        const chapterProgressPercent =
          totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

        const videoProgressPercent =
          totalVideosInCourse > 0
            ? Math.round((watchedVideosInCourse / totalVideosInCourse) * 100)
            : 0;

        // Calculate overall progress as average of chapter and video progress
        const overallProgress = Math.round((chapterProgressPercent + videoProgressPercent) / 2);

        // Get latest certification for this course if any
        const latestCertification = await prisma.yearCertification.findFirst({
          where: {
            studentId: studentId,
            courseId: enrollment.course.id,
          },
          orderBy: {
            year: 'desc',
          },
        });

        return {
          enrollment: {
            id: enrollment.id,
            enrollmentDate: enrollment.enrollmentDate,
            isActive: enrollment.isActive,
          },
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            durationYears: enrollment.course.durationYears,
            coverImageUrl: enrollment.course.coverImageUrl,
          },
          chapters: enrollment.course.chapters.map((chapter) => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description,
            orderIndex: chapter.orderIndex,
            courseYear: chapter.courseYear,
            videosCount: chapter._count.videos,
          })),
          progress: {
            completedChapters,
            totalChapters,
            chapterProgressPercent,
            watchedVideos: watchedVideosInCourse,
            totalVideos: totalVideosInCourse,
            videoProgressPercent,
            overallProgress,
          },
          certification: latestCertification
            ? {
                year: latestCertification.year,
                certificateUrl: latestCertification.certificateUrl,
                issuedAt: latestCertification.issuedAt,
              }
            : null,
        };
      }),
    );

    // Get recommended courses (courses student is not enrolled in)
    const recommendedCourses = await prisma.course.findMany({
      where: {
        isActive: true,
        enrollments: {
          none: {
            studentId: studentId,
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationYears: true,
        coverImageUrl: true,
        _count: {
          select: {
            chapters: true,
          },
        },
      },
      take: 3, // Limit to 3 recommended courses
    });

    logger.info('Enrolled courses retrieved successfully', {
      studentId,
      enrolledCount: courseEnrollments.length,
      recommendedCount: recommendedCourses.length,
    });

    return {
      enrolled: {
        count: courseEnrollments.length,
        courses: coursesWithProgress,
      },
      recommended: {
        count: recommendedCourses.length,
        courses: recommendedCourses,
      },
    };
  } catch (error) {
    logger.error('Error in getStudentEnrolledCourses', {
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Enroll student in a course
export async function enrollStudentInCourse(studentId: string, courseId: string) {
  try {
    logger.info('Enrolling student in course', { studentId, courseId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Enrollment failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if course exists and is active
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
        isActive: true,
      },
      include: {
        chapters: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!course) {
      logger.warn('Enrollment failed - course not found or inactive', { courseId });
      throw new AppError('Course not found or inactive', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is already enrolled in this course
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: studentId,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      // If enrollment exists but is inactive, reactivate it
      if (!existingEnrollment.isActive) {
        const reactivatedEnrollment = await prisma.courseEnrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            isActive: true,
            updatedAt: new Date(),
          },
          include: {
            course: true,
          },
        });

        logger.info('Course enrollment reactivated', {
          studentId,
          courseId,
          enrollmentId: reactivatedEnrollment.id,
        });

        return {
          isNewEnrollment: false,
          enrollment: {
            id: reactivatedEnrollment.id,
            enrollmentDate: reactivatedEnrollment.enrollmentDate,
            isActive: reactivatedEnrollment.isActive,
            course: {
              id: reactivatedEnrollment.course.id,
              title: reactivatedEnrollment.course.title,
              description: reactivatedEnrollment.course.description,
              durationYears: reactivatedEnrollment.course.durationYears,
            },
          },
        };
      }

      // If already active, return error
      logger.warn('Enrollment failed - student already enrolled', { studentId, courseId });
      throw new AppError('You are already enrolled in this course', 400, ErrorTypes.DUPLICATE);
    }

    // Create new enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        student: {
          connect: { id: studentId },
        },
        course: {
          connect: { id: courseId },
        },
        isActive: true,
      },
      include: {
        course: true,
      },
    });

    // Initialize chapter progress for all chapters in this course
    const chapterProgressPromises = course.chapters.map((chapter) => {
      return prisma.chapterProgress.create({
        data: {
          student: {
            connect: { id: studentId },
          },
          chapter: {
            connect: { id: chapter.id },
          },
          isCompleted: false,
        },
      });
    });

    await Promise.all(chapterProgressPromises);

    logger.info('Student enrolled in course successfully', {
      studentId,
      courseId,
      enrollmentId: enrollment.id,
    });

    return {
      isNewEnrollment: true,
      enrollment: {
        id: enrollment.id,
        enrollmentDate: enrollment.enrollmentDate,
        isActive: enrollment.isActive,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          durationYears: enrollment.course.durationYears,
        },
      },
    };
  } catch (error) {
    logger.error('Error in enrollStudentInCourse', {
      studentId,
      courseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get student's overall learning progress
export async function getStudentLearningProgress(studentId: string) {
  try {
    logger.info('Fetching learning progress for student', { studentId });

    // Find the student first to verify they exist
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Progress fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get all course enrollments
    const enrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId,
        isActive: true,
      },
      include: {
        course: true,
      },
    });

    // Total courses the student is enrolled in
    const totalCourses = enrollments.length;

    // Get all chapters across enrolled courses
    const enrolledCourseIds = enrollments.map((enrollment) => enrollment.courseId);

    const chapters = await prisma.chapter.findMany({
      where: {
        courseId: { in: enrolledCourseIds },
      },
    });

    const totalChapters = chapters.length;

    // Find completed chapters
    const completedChapters = await prisma.chapterProgress.count({
      where: {
        studentId,
        isCompleted: true,
        chapter: {
          courseId: { in: enrolledCourseIds },
        },
      },
    });

    // Get all videos across enrolled courses
    const videos = await prisma.video.findMany({
      where: {
        chapter: {
          courseId: { in: enrolledCourseIds },
        },
      },
    });

    const totalVideos = videos.length;

    // Find watched videos
    const watchedVideos = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: 100,
        video: {
          chapter: {
            courseId: { in: enrolledCourseIds },
          },
        },
      },
    });

    // Videos in progress (started but not completed)
    const videosInProgress = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: { gt: 0, lt: 100 },
        video: {
          chapter: {
            courseId: { in: enrolledCourseIds },
          },
        },
      },
    });

    // Get exam attempts data
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        exam: {
          chapter: {
            courseId: { in: enrolledCourseIds },
          },
        },
      },
      include: {
        exam: true,
      },
    });

    const totalExamAttempts = examAttempts.length;
    const passedExams = examAttempts.filter((attempt) => attempt.isPassed).length;

    // Get all exams in enrolled courses
    const totalExams = await prisma.exam.count({
      where: {
        chapter: {
          courseId: { in: enrolledCourseIds },
        },
      },
    });

    // Unique exams attempted
    const uniqueExamsAttempted = new Set(examAttempts.map((a) => a.examId)).size;

    // Get certifications
    const certifications = await prisma.yearCertification.findMany({
      where: {
        studentId,
        courseId: { in: enrolledCourseIds },
      },
      include: {
        course: true,
      },
    });

    // Calculate recent activity
    const recentActivity = await prisma.videoProgress.findMany({
      where: {
        studentId,
        lastWatchedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        },
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
      take: 5,
      include: {
        video: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    // Calculate recent exam attempts
    const recentExamAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        startTime: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        },
      },
      orderBy: {
        startTime: 'desc',
      },
      take: 5,
      include: {
        exam: {
          include: {
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    // Calculate streak data (consecutive days with activity)
    const activityDays = await prisma.videoProgress.findMany({
      where: {
        studentId,
        lastWatchedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      select: {
        lastWatchedAt: true,
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
    });

    // Extract unique dates when the student was active
    const uniqueDatesSet = new Set();
    activityDays.forEach((activity) => {
      const dateStr = activity.lastWatchedAt.toISOString().split('T')[0];
      uniqueDatesSet.add(dateStr);
    });
    const uniqueDates = Array.from(uniqueDatesSet) as string[];
    uniqueDates.sort().reverse(); // Sort in descending order

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];

    if (uniqueDates.length > 0 && uniqueDates[0] === today) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const currentDate = new Date(uniqueDates[i - 1]);
        currentDate.setDate(currentDate.getDate() - 1);
        const expectedPreviousDate = currentDate.toISOString().split('T')[0];

        if (uniqueDates[i] === expectedPreviousDate) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let currentCount = 1;

    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1]);
      currentDate.setDate(currentDate.getDate() - 1);
      const expectedPreviousDate = currentDate.toISOString().split('T')[0];

      if (uniqueDates[i] === expectedPreviousDate) {
        currentCount++;
      } else {
        longestStreak = Math.max(longestStreak, currentCount);
        currentCount = 1;
      }
    }
    longestStreak = Math.max(longestStreak, currentCount);

    // Calculate progress percentages
    const chapterProgress =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    const videoProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

    const examProgress = totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    // Overall progress is average of chapter, video, and exam progress
    const overallProgress = Math.round((chapterProgress + videoProgress + examProgress) / 3);

    // Format response data
    const formattedRecentActivity = recentActivity.map((activity) => ({
      id: activity.id,
      videoTitle: activity.video.title,
      chapterTitle: activity.video.chapter.title,
      courseName: activity.video.chapter.course.title,
      watchedPercent: activity.watchedPercent,
      lastWatchedAt: activity.lastWatchedAt,
    }));

    const formattedRecentExams = recentExamAttempts.map((attempt) => ({
      id: attempt.id,
      examTitle: attempt.exam.title,
      chapterTitle: attempt.exam.chapter.title,
      courseName: attempt.exam.chapter.course.title,
      score: attempt.score || 0,
      isPassed: attempt.isPassed,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
    }));

    logger.info('Learning progress retrieved successfully', { studentId });

    return {
      overview: {
        totalCourses,
        overallProgress,
        currentStreak,
        longestStreak,
        uniqueActiveDays: uniqueDates.length,
      },
      courses: {
        enrolled: totalCourses,
        withCertification: new Set(certifications.map((c) => c.courseId)).size,
      },
      chapters: {
        total: totalChapters,
        completed: completedChapters,
        progress: chapterProgress,
      },
      videos: {
        total: totalVideos,
        watched: watchedVideos,
        inProgress: videosInProgress,
        notStarted: totalVideos - (watchedVideos + videosInProgress),
        progress: videoProgress,
      },
      exams: {
        total: totalExams,
        attempted: uniqueExamsAttempted,
        totalAttempts: totalExamAttempts,
        passed: passedExams,
        failed: totalExamAttempts - passedExams,
        progress: examProgress,
      },
      certifications: {
        total: certifications.length,
        courses: certifications.map((cert) => ({
          id: cert.id,
          courseName: cert.course.title,
          year: cert.year,
          certificateUrl: cert.certificateUrl,
          issuedAt: cert.issuedAt,
        })),
      },
      recentActivity: {
        videos: formattedRecentActivity,
        exams: formattedRecentExams,
      },
    };
  } catch (error) {
    logger.error('Error in getStudentLearningProgress', {
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get student's progress for a specific chapter
export async function getChapterProgress(studentId: string, chapterId: string) {
  try {
    logger.info('Fetching chapter progress', { studentId, chapterId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Chapter progress fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        course: true,
        videos: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        exam: true,
      },
    });

    if (!chapter) {
      logger.warn('Chapter progress fetch failed - chapter not found', { chapterId });
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Chapter progress fetch failed - student not enrolled in course', {
        studentId,
        courseId: chapter.courseId,
      });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get chapter progress record
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId,
        },
      },
    });

    // If no progress record exists, create one
    const progressRecord =
      chapterProgress ||
      (await prisma.chapterProgress.create({
        data: {
          student: { connect: { id: studentId } },
          chapter: { connect: { id: chapterId } },
          isCompleted: false,
        },
      }));

    // Get video progress for each video in the chapter
    const videoProgress = await Promise.all(
      chapter.videos.map(async (video) => {
        const progress = await prisma.videoProgress.findUnique({
          where: {
            studentId_videoId: {
              studentId,
              videoId: video.id,
            },
          },
        });

        return {
          video: {
            id: video.id,
            title: video.title,
            description: video.description,
            duration: video.duration,
            orderIndex: video.orderIndex,
            backblazeUrl: video.backblazeUrl,
          },
          progress: progress
            ? {
                watchedPercent: progress.watchedPercent,
                lastWatchedAt: progress.lastWatchedAt,
                isCompleted: progress.watchedPercent === 100,
              }
            : {
                watchedPercent: 0,
                lastWatchedAt: null,
                isCompleted: false,
              },
        };
      }),
    );

    // Calculate video completion statistics
    const totalVideos = videoProgress.length;
    const completedVideos = videoProgress.filter((vp) => vp.progress.isCompleted).length;
    const videosInProgress = videoProgress.filter(
      (vp) => !vp.progress.isCompleted && vp.progress.watchedPercent > 0,
    ).length;

    // Calculate overall video progress as percentage
    const videoProgressPercent =
      totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

    // Get exam attempts if chapter has an exam
    let examAttempts = [];
    let examStats = null;

    if (chapter.exam) {
      examAttempts = await prisma.examAttempt.findMany({
        where: {
          studentId,
          examId: chapter.exam.id,
        },
        orderBy: {
          startTime: 'desc',
        },
      });

      const totalAttempts = examAttempts.length;
      const passedAttempts = examAttempts.filter((attempt) => attempt.isPassed).length;
      const bestScore =
        examAttempts.length > 0
          ? Math.max(...examAttempts.map((attempt) => attempt.score || 0))
          : 0;

      const latestAttempt = examAttempts.length > 0 ? examAttempts[0] : null;

      examStats = {
        exam: {
          id: chapter.exam.id,
          title: chapter.exam.title,
          description: chapter.exam.description,
          passingScore: chapter.exam.passingScore,
          timeLimit: chapter.exam.timeLimit,
        },
        attempts: {
          total: totalAttempts,
          passed: passedAttempts,
          bestScore,
        },
        latestAttempt: latestAttempt
          ? {
              id: latestAttempt.id,
              startTime: latestAttempt.startTime,
              endTime: latestAttempt.endTime,
              score: latestAttempt.score,
              isPassed: latestAttempt.isPassed,
            }
          : null,
        isPassed: passedAttempts > 0,
      };
    }

    // Determine if chapter is completed
    // A chapter is completed if all videos are watched and exam is passed (if exists)
    const allVideosCompleted = totalVideos > 0 && completedVideos === totalVideos;
    const examPassed = examStats ? examStats.isPassed : true; // If no exam, consider as passed

    const isCompleted = allVideosCompleted && examPassed;

    // Update chapter progress status if it has changed
    if (progressRecord.isCompleted !== isCompleted) {
      await prisma.chapterProgress.update({
        where: {
          id: progressRecord.id,
        },
        data: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          lastVideoWatched:
            videoProgress.length > 0
              ? Math.max(
                  ...videoProgress
                    .filter((vp) => vp.progress.watchedPercent > 0)
                    .map((vp) => vp.video.orderIndex),
                )
              : null,
        },
      });
    }

    // Get next and previous chapters for navigation
    const siblingChapters = await prisma.chapter.findMany({
      where: {
        courseId: chapter.courseId,
        orderIndex: {
          in: [chapter.orderIndex - 1, chapter.orderIndex + 1],
        },
      },
      select: {
        id: true,
        title: true,
        orderIndex: true,
      },
    });

    const previousChapter =
      siblingChapters.find((ch) => ch.orderIndex === chapter.orderIndex - 1) || null;
    const nextChapter =
      siblingChapters.find((ch) => ch.orderIndex === chapter.orderIndex + 1) || null;

    logger.info('Chapter progress retrieved successfully', { studentId, chapterId });

    return {
      chapter: {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        courseYear: chapter.courseYear,
        course: {
          id: chapter.course.id,
          title: chapter.course.title,
        },
      },
      progress: {
        isCompleted,
        completedAt: isCompleted ? progressRecord.completedAt || new Date() : null,
        lastVideoWatched: progressRecord.lastVideoWatched,
        videos: {
          total: totalVideos,
          completed: completedVideos,
          inProgress: videosInProgress,
          notStarted: totalVideos - (completedVideos + videosInProgress),
          progressPercent: videoProgressPercent,
        },
        exam: examStats,
      },
      videoProgress,
      navigation: {
        previousChapter,
        nextChapter,
      },
    };
  } catch (error) {
    logger.error('Error in getChapterProgress', {
      studentId,
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Updated service function without the helper function
export async function updateVideoProgress(
  studentId: string,
  videoId: string,
  watchedPercent: number,
) {
  try {
    logger.info('Updating video progress', { studentId, videoId, watchedPercent });

    // Validate watchedPercent (0-100)
    if (watchedPercent < 0 || watchedPercent > 100) {
      logger.warn('Invalid watched percent value', { watchedPercent });
      throw new AppError('Watched percent must be between 0 and 100', 400, ErrorTypes.VALIDATION);
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Video progress update failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if video exists
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!video) {
      logger.warn('Video progress update failed - video not found', { videoId });
      throw new AppError('Video not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: video.chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Video progress update failed - student not enrolled in course', {
        studentId,
        courseId: video.chapter.courseId,
      });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Find existing progress record or create a new one
    const existingProgress = await prisma.videoProgress.findUnique({
      where: {
        studentId_videoId: {
          studentId,
          videoId,
        },
      },
    });

    let videoProgress;

    if (existingProgress) {
      // Only update if new progress is higher than previous
      if (watchedPercent > existingProgress.watchedPercent) {
        videoProgress = await prisma.videoProgress.update({
          where: {
            id: existingProgress.id,
          },
          data: {
            watchedPercent,
            lastWatchedAt: new Date(),
          },
        });
      } else {
        // Just update the timestamp if the percentage is the same or lower
        videoProgress = await prisma.videoProgress.update({
          where: {
            id: existingProgress.id,
          },
          data: {
            lastWatchedAt: new Date(),
          },
        });
      }
    } else {
      // Create new progress record
      videoProgress = await prisma.videoProgress.create({
        data: {
          student: {
            connect: { id: studentId },
          },
          video: {
            connect: { id: videoId },
          },
          watchedPercent,
          lastWatchedAt: new Date(),
        },
      });
    }

    // Update chapter progress if this is the last video the student is watching
    await updateChapterProgressBasedOnVideo(studentId, video.chapterId);

    logger.info('Video progress updated successfully', {
      studentId,
      videoId,
      watchedPercent: videoProgress.watchedPercent,
    });

    return {
      id: videoProgress.id,
      videoId: videoProgress.videoId,
      watchedPercent: videoProgress.watchedPercent,
      lastWatchedAt: videoProgress.lastWatchedAt,
      video: {
        id: video.id,
        title: video.title,
        chapterTitle: video.chapter.title,
        courseName: video.chapter.course.title,
      },
    };
  } catch (error) {
    logger.error('Error in updateVideoProgress', {
      studentId,
      videoId,
      watchedPercent,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get exam details for a student
export async function getExamDetails(studentId: string, examId: string) {
  try {
    logger.info('Fetching exam details', { studentId, examId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Exam details fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
        questions: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!exam) {
      logger.warn('Exam details fetch failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: exam.chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Exam details fetch failed - student not enrolled in course', {
        studentId,
        courseId: exam.chapter.courseId,
      });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get student's previous attempts for this exam
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        examId,
      },
      orderBy: {
        startTime: 'desc',
      },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    // Calculate attempt statistics
    const totalAttempts = examAttempts.length;
    const passedAttempts = examAttempts.filter((attempt) => attempt.isPassed).length;
    const highestScore =
      examAttempts.length > 0 ? Math.max(...examAttempts.map((attempt) => attempt.score || 0)) : 0;
    const mostRecentAttempt = examAttempts.length > 0 ? examAttempts[0] : null;

    // Check if student has a passing attempt
    const hasPassed = passedAttempts > 0;

    // Determine if student can attempt the exam again
    // (Add any business rules here, e.g. maximum attempts, cooling off period, etc.)
    const canAttempt = true; // For now, always allow attempts

    // Format questions for the response
    // Only include correct answers if student has passed the exam
    const formattedQuestions = exam.questions.map((question) => {
      // Basic question data
      const questionData = {
        id: question.id,
        text: question.text,
        questionType: question.questionType,
        points: question.points,
      };

      // Add options if multiple choice or true/false
      if (question.questionType === 'multiple_choice' || question.questionType === 'true_false') {
        return {
          ...questionData,
          options: question.options,
          // Only include correct answer if student has passed
          ...(hasPassed && { correctAnswer: question.correctAnswer }),
        };
      }

      return questionData;
    });

    // Get chapter progress to check if prerequisites are met
    // (e.g., all videos watched before attempting exam)
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId: exam.chapter.id,
        },
      },
    });

    // Get video progress to check completion
    const totalVideosInChapter = await prisma.video.count({
      where: {
        chapterId: exam.chapter.id,
      },
    });

    const completedVideosInChapter = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: 100,
        video: {
          chapterId: exam.chapter.id,
        },
      },
    });

    // Check if student has completed all videos in the chapter
    const allVideosCompleted = completedVideosInChapter === totalVideosInChapter;

    // Determine if student is ready to take the exam
    const isReadyForExam = allVideosCompleted || hasPassed;

    logger.info('Exam details retrieved successfully', { studentId, examId });

    // Return exam details
    return {
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit, // in minutes
        createdBy: exam.createdBy.fullName,
        totalQuestions: exam.questions.length,
        totalPoints: exam.questions.reduce((sum, q) => sum + q.points, 0),
      },
      courseContext: {
        courseId: exam.chapter.courseId,
        courseName: exam.chapter.course.title,
        chapterId: exam.chapter.id,
        chapterTitle: exam.chapter.title,
      },
      studentProgress: {
        attempts: {
          total: totalAttempts,
          passed: passedAttempts,
          highestScore,
        },
        hasPassed,
        canAttempt,
        isReadyForExam,
        prerequisites: {
          videosCompleted: completedVideosInChapter,
          totalVideos: totalVideosInChapter,
          allVideosCompleted,
        },
        mostRecentAttempt: mostRecentAttempt
          ? {
              id: mostRecentAttempt.id,
              startTime: mostRecentAttempt.startTime,
              endTime: mostRecentAttempt.endTime,
              score: mostRecentAttempt.score,
              isPassed: mostRecentAttempt.isPassed,
            }
          : null,
      },
      questions: formattedQuestions,
    };
  } catch (error) {
    logger.error('Error in getExamDetails', {
      studentId,
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Start a new exam attempt
export async function startExamAttempt(studentId: string, examId: string) {
  try {
    logger.info('Starting exam attempt', { studentId, examId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Exam attempt failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if exam exists
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        chapter: {
          include: {
            course: true,
          },
        },
        questions: {
          select: {
            id: true,
            text: true,
            questionType: true,
            options: true,
            points: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!exam) {
      logger.warn('Exam attempt failed - exam not found', { examId });
      throw new AppError('Exam not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: exam.chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Exam attempt failed - student not enrolled in course', {
        studentId,
        courseId: exam.chapter.courseId,
      });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Check if student has completed all videos in the chapter (prerequisite)
    // This is a business rule that can be adjusted or removed based on requirements
    const totalVideosInChapter = await prisma.video.count({
      where: {
        chapterId: exam.chapter.id,
      },
    });

    const completedVideosInChapter = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: 100,
        video: {
          chapterId: exam.chapter.id,
        },
      },
    });

    const allVideosCompleted = completedVideosInChapter === totalVideosInChapter;

    // Get previous attempt information
    const previousAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        examId,
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    const hasPreviousAttempts = previousAttempts.length > 0;
    const hasPassed = previousAttempts.some((attempt) => attempt.isPassed);

    // Check if there's an ongoing attempt
    const ongoingAttempt = previousAttempts.find(
      (attempt) => attempt.endTime === null || attempt.endTime === undefined,
    );

    if (ongoingAttempt) {
      // Return the ongoing attempt instead of creating a new one
      return {
        attemptId: ongoingAttempt.id,
        isNewAttempt: false,
        message: 'You have an ongoing exam attempt',
        exam: {
          id: exam.id,
          title: exam.title,
          description: exam.description,
          passingScore: exam.passingScore,
          timeLimit: exam.timeLimit,
        },
        startTime: ongoingAttempt.startTime,
        questions: exam.questions.map((question) => ({
          id: question.id,
          text: question.text,
          questionType: question.questionType,
          options:
            question.questionType === 'multiple_choice' || question.questionType === 'true_false'
              ? question.options
              : null,
          points: question.points,
        })),
      };
    }

    // If student has not completed all videos and has not passed previously,
    // optionally restrict them from taking the exam
    // Comment this out if videos are not a prerequisite for the exam
    if (!allVideosCompleted && !hasPassed) {
      logger.warn('Exam attempt failed - prerequisites not met', {
        studentId,
        examId,
        completedVideos: completedVideosInChapter,
        totalVideos: totalVideosInChapter,
      });
      throw new AppError(
        `You need to complete all videos in this chapter before taking the exam. ` +
          `(${completedVideosInChapter}/${totalVideosInChapter} completed)`,
        403,
        ErrorTypes.PRECONDITION_FAILED,
      );
    }

    // Create a new exam attempt
    const examAttempt = await prisma.examAttempt.create({
      data: {
        student: {
          connect: { id: studentId },
        },
        exam: {
          connect: { id: examId },
        },
        startTime: new Date(),
        // endTime and score will be set when the attempt is submitted
      },
    });

    logger.info('Exam attempt created successfully', {
      studentId,
      examId,
      attemptId: examAttempt.id,
    });

    return {
      attemptId: examAttempt.id,
      isNewAttempt: true,
      message: hasPreviousAttempts
        ? `This is attempt #${previousAttempts.length + 1}`
        : 'This is your first attempt at this exam',
      exam: {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        passingScore: exam.passingScore,
        timeLimit: exam.timeLimit,
      },
      startTime: examAttempt.startTime,
      questions: exam.questions.map((question) => ({
        id: question.id,
        text: question.text,
        questionType: question.questionType,
        options:
          question.questionType === 'multiple_choice' || question.questionType === 'true_false'
            ? question.options
            : null,
        points: question.points,
      })),
    };
  } catch (error) {
    logger.error('Error in startExamAttempt', {
      studentId,
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Submit an exam attempt with answers
export async function submitExamAttempt(
  studentId: string,
  attemptId: string,
  answers: { questionId: string; answer: string }[],
) {
  try {
    logger.info('Submitting exam attempt', { studentId, attemptId, answersCount: answers.length });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Exam submission failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if the attempt exists and belongs to the student
    const examAttempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
            chapter: true,
          },
        },
        answers: true,
      },
    });

    if (!examAttempt) {
      logger.warn('Exam submission failed - attempt not found', { attemptId });
      throw new AppError('Exam attempt not found', 404, ErrorTypes.NOT_FOUND);
    }

    if (examAttempt.studentId !== studentId) {
      logger.warn('Exam submission failed - attempt does not belong to student', {
        attemptId,
        studentId,
        attemptStudentId: examAttempt.studentId,
      });
      throw new AppError('This exam attempt does not belong to you', 403, ErrorTypes.AUTHORIZATION);
    }

    // Check if attempt is already completed
    if (examAttempt.endTime) {
      logger.warn('Exam submission failed - attempt already completed', { attemptId });
      throw new AppError(
        'This exam attempt has already been submitted',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Check if all required questions are answered
    const allQuestionIds = examAttempt.exam.questions.map((q) => q.id);
    const answeredQuestionIds = answers.map((a) => a.questionId);

    // Find missing questions (questions that should be answered but aren't)
    const missingQuestionIds = allQuestionIds.filter((qId) => !answeredQuestionIds.includes(qId));

    if (missingQuestionIds.length > 0) {
      logger.warn('Exam submission failed - missing answers', {
        attemptId,
        missingQuestionIds,
      });
      throw new AppError(
        `Missing answers for ${missingQuestionIds.length} question(s)`,
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Check for answers to questions that don't belong to this exam
    const invalidQuestionIds = answeredQuestionIds.filter((qId) => !allQuestionIds.includes(qId));

    if (invalidQuestionIds.length > 0) {
      logger.warn('Exam submission failed - invalid question IDs', {
        attemptId,
        invalidQuestionIds,
      });
      throw new AppError(
        `Invalid question IDs: ${invalidQuestionIds.join(', ')}`,
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Create/update answers in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete any existing answers for this attempt
      if (examAttempt.answers.length > 0) {
        await tx.answer.deleteMany({
          where: { examAttemptId: attemptId },
        });
      }

      // Create new answers
      const createdAnswers = await Promise.all(
        answers.map(async ({ questionId, answer }) => {
          const question = examAttempt.exam.questions.find((q) => q.id === questionId);

          if (!question) {
            throw new AppError(`Question not found: ${questionId}`, 400, ErrorTypes.VALIDATION);
          }

          // Determine if the answer is correct for objective questions
          let isCorrect: boolean | null = null;

          if (
            question.questionType === 'multiple_choice' ||
            question.questionType === 'true_false'
          ) {
            isCorrect = question.correctAnswer === answer;
          }

          // Essay questions will have isCorrect = null initially, to be graded manually

          // Calculate points for this answer
          let points: number | null = null;

          if (isCorrect !== null) {
            points = isCorrect ? question.points : 0;
          }

          return tx.answer.create({
            data: {
              studentAnswer: answer,
              isCorrect,
              points,
              question: {
                connect: { id: questionId },
              },
              examAttempt: {
                connect: { id: attemptId },
              },
            },
          });
        }),
      );

      // Calculate the score for this attempt (for objective questions)
      const totalPossiblePoints = examAttempt.exam.questions.reduce((sum, q) => sum + q.points, 0);

      const earnedPoints = createdAnswers.reduce((sum, a) => sum + (a.points || 0), 0);

      // Only include objective questions in the score calculation
      const totalObjectivePoints = examAttempt.exam.questions
        .filter((q) => q.questionType === 'multiple_choice' || q.questionType === 'true_false')
        .reduce((sum, q) => sum + q.points, 0);

      // Calculate score percentage
      let score = 0;

      if (totalObjectivePoints > 0) {
        score = Math.round((earnedPoints / totalObjectivePoints) * 100);
      }

      // Determine if the attempt is passed
      const isPassed = score >= examAttempt.exam.passingScore;

      // Update the exam attempt with end time and score
      const updatedAttempt = await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          endTime: new Date(),
          score,
          isPassed,
        },
        include: {
          answers: {
            include: {
              question: true,
            },
          },
          exam: {
            include: {
              questions: true,
            },
          },
        },
      });

      // Update chapter progress if this is the first passed attempt
      if (isPassed) {
        const chapterId = examAttempt.exam.chapter.id;

        // Get chapter progress record
        const chapterProgress = await tx.chapterProgress.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId,
            },
          },
        });

        // Check if all videos are completed too
        const totalVideosInChapter = await tx.video.count({
          where: { chapterId },
        });

        const completedVideosInChapter = await tx.videoProgress.count({
          where: {
            studentId,
            watchedPercent: 100,
            video: {
              chapterId,
            },
          },
        });

        const allVideosCompleted = completedVideosInChapter === totalVideosInChapter;

        // Chapter is completed if all videos are watched and exam is passed
        const isCompleted = allVideosCompleted && isPassed;

        // Update chapter progress
        if (chapterProgress) {
          await tx.chapterProgress.update({
            where: { id: chapterProgress.id },
            data: {
              isCompleted,
              completedAt: isCompleted ? new Date() : chapterProgress.completedAt,
            },
          });
        } else {
          // Create new chapter progress if doesn't exist
          await tx.chapterProgress.create({
            data: {
              student: { connect: { id: studentId } },
              chapter: { connect: { id: chapterId } },
              isCompleted,
              completedAt: isCompleted ? new Date() : null,
            },
          });
        }
      }

      return updatedAttempt;
    });

    // Prepare response
    const answersWithDetails = result.answers.map((answer) => {
      const question = result.exam.questions.find((q) => q.id === answer.questionId);

      return {
        questionId: answer.questionId,
        questionText: question?.text || '',
        studentAnswer: answer.studentAnswer,
        isCorrect: answer.isCorrect,
        points: answer.points,
        maxPoints: question?.points || 0,
        correctAnswer: question?.correctAnswer || null,
      };
    });

    logger.info('Exam attempt submitted successfully', {
      attemptId,
      studentId,
      score: result.score,
      isPassed: result.isPassed,
    });

    return {
      attemptId: result.id,
      exam: {
        id: result.exam.id,
        title: result.exam.title,
        passingScore: result.exam.passingScore,
      },
      score: result.score,
      isPassed: result.isPassed,
      startTime: result.startTime,
      endTime: result.endTime,
      timeTaken: result.endTime
        ? Math.round((result.endTime.getTime() - result.startTime.getTime()) / 1000 / 60)
        : null,
      answers: answersWithDetails,
    };
  } catch (error) {
    logger.error('Error in submitExamAttempt', {
      studentId,
      attemptId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get exam attempt result
export async function getExamAttemptResult(studentId: string, attemptId: string) {
  try {
    logger.info('Fetching exam attempt result', { studentId, attemptId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Fetch exam result failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if the attempt exists and belongs to the student
    const examAttempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            questions: true,
            chapter: {
              include: {
                course: true,
              },
            },
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!examAttempt) {
      logger.warn('Fetch exam result failed - attempt not found', { attemptId });
      throw new AppError('Exam attempt not found', 404, ErrorTypes.NOT_FOUND);
    }

    if (examAttempt.studentId !== studentId) {
      logger.warn('Fetch exam result failed - attempt does not belong to student', {
        attemptId,
        studentId,
        attemptStudentId: examAttempt.studentId,
      });
      throw new AppError('This exam attempt does not belong to you', 403, ErrorTypes.AUTHORIZATION);
    }

    // Check if attempt has been completed
    if (!examAttempt.endTime) {
      logger.warn('Fetch exam result failed - attempt not yet completed', { attemptId });
      throw new AppError(
        'This exam attempt has not been submitted yet',
        400,
        ErrorTypes.VALIDATION,
      );
    }

    // Format the answers for the response
    const answersWithDetails = examAttempt.answers.map((answer) => {
      const question = examAttempt.exam.questions.find((q) => q.id === answer.questionId);

      return {
        questionId: answer.questionId,
        questionText: question?.text || '',
        questionType: question?.questionType || '',
        studentAnswer: answer.studentAnswer,
        isCorrect: answer.isCorrect,
        points: answer.points,
        maxPoints: question?.points || 0,
        correctAnswer: question?.correctAnswer || null,
        options: question?.options || null,
      };
    });

    // Calculate statistics for answer types
    const objectiveQuestions = answersWithDetails.filter(
      (a) => a.questionType === 'multiple_choice' || a.questionType === 'true_false',
    );

    const correctAnswers = objectiveQuestions.filter((a) => a.isCorrect === true).length;
    const incorrectAnswers = objectiveQuestions.filter((a) => a.isCorrect === false).length;
    const essayQuestions = answersWithDetails.filter((a) => a.questionType === 'essay').length;

    // Calculate time spent on the exam
    const startTime = examAttempt.startTime;
    const endTime = examAttempt.endTime;
    const timeTakenMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 1000 / 60);

    // Format dates for display
    const formattedStartTime = startTime.toISOString();
    const formattedEndTime = endTime.toISOString();

    // Check if the student has any other attempts at this exam
    const otherAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        examId: examAttempt.examId,
        id: { not: attemptId },
      },
      orderBy: {
        startTime: 'desc',
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        score: true,
        isPassed: true,
      },
    });

    logger.info('Exam result retrieved successfully', {
      attemptId,
      studentId,
      score: examAttempt.score,
      isPassed: examAttempt.isPassed,
    });

    // Construct response
    return {
      attemptId: examAttempt.id,
      exam: {
        id: examAttempt.exam.id,
        title: examAttempt.exam.title,
        description: examAttempt.exam.description,
        passingScore: examAttempt.exam.passingScore,
        timeLimit: examAttempt.exam.timeLimit,
        totalQuestions: examAttempt.exam.questions.length,
        totalPoints: examAttempt.exam.questions.reduce((sum, q) => sum + q.points, 0),
      },
      courseContext: {
        courseId: examAttempt.exam.chapter.course.id,
        courseName: examAttempt.exam.chapter.course.title,
        chapterId: examAttempt.exam.chapter.id,
        chapterTitle: examAttempt.exam.chapter.title,
      },
      result: {
        score: examAttempt.score,
        isPassed: examAttempt.isPassed,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        timeTaken: timeTakenMinutes,
        statistics: {
          totalQuestions: answersWithDetails.length,
          correctAnswers,
          incorrectAnswers,
          essayQuestions,
          objectiveScore:
            objectiveQuestions.length > 0
              ? Math.round((correctAnswers / objectiveQuestions.length) * 100)
              : 0,
        },
      },
      otherAttempts: otherAttempts.map((attempt) => ({
        id: attempt.id,
        startTime: attempt.startTime.toISOString(),
        endTime: attempt.endTime?.toISOString() || null,
        score: attempt.score,
        isPassed: attempt.isPassed,
      })),
      answers: answersWithDetails,
    };
  } catch (error) {
    logger.error('Error in getExamAttemptResult', {
      studentId,
      attemptId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Preview courses service function
export async function getPreviewCourses(page: number = 1, limit: number = 10, search: string = '') {
  try {
    logger.info('Fetching courses preview', { page, limit, search });

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch active courses with limited preview information
    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationYears: true,
        coverImageUrl: true,
        // Include a limited number of chapters with basic info only
        chapters: {
          take: 1, // Just the first chapter for preview
          select: {
            id: true,
            title: true,
            description: true,
            // Include just one preview video if exists
            videos: {
              take: 1,
              select: {
                id: true,
                title: true,
                description: true,
                duration: true,
              },
            },
          },
          orderBy: {
            orderIndex: 'asc',
          },
        },
        _count: {
          select: {
            chapters: true,
            enrollments: true,
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const totalCourses = await prisma.course.count({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
    });

    // Format preview response
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      title: course.title,
      description: course.description,
      durationYears: course.durationYears,
      coverImageUrl: course.coverImageUrl,
      totalChapters: course._count.chapters,
      enrollmentCount: course._count.enrollments,
      previewChapter: course.chapters[0]
        ? {
            title: course.chapters[0].title,
            description: course.chapters[0].description,
            previewVideo: course.chapters[0].videos[0]
              ? {
                  title: course.chapters[0].videos[0].title,
                  description: course.chapters[0].videos[0].description,
                  duration: course.chapters[0].videos[0].duration,
                }
              : null,
          }
        : null,
    }));

    logger.info('Courses preview fetched successfully', {
      courseCount: courses.length,
    });

    return {
      courses: formattedCourses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCourses / limit),
        totalItems: totalCourses,
        itemsPerPage: limit,
      },
    };
  } catch (error) {
    logger.error('Error in getPreviewCourses', {
      page,
      limit,
      search,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get full course content service function
export async function getEnrolledCourseContent(studentId: string, courseId: string) {
  try {
    logger.info('Fetching full course content', { studentId, courseId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Course content fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if student is enrolled in this course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Course content fetch failed - student not enrolled', {
        studentId,
        courseId,
      });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get course details with all chapters, videos, and exam information
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: {
          orderBy: {
            orderIndex: 'asc',
          },
          include: {
            videos: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
                description: true,
                passingScore: true,
                timeLimit: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      logger.warn('Course content fetch failed - course not found', { courseId });
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get student's progress for all chapters in this course
    const chapterProgressRecords = await prisma.chapterProgress.findMany({
      where: {
        studentId,
        chapter: {
          courseId,
        },
      },
    });

    // Get student's video progress for all videos in this course
    const videoProgressRecords = await prisma.videoProgress.findMany({
      where: {
        studentId,
        video: {
          chapter: {
            courseId,
          },
        },
      },
    });

    // Get student's exam attempts for this course
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        exam: {
          chapter: {
            courseId,
          },
        },
      },
      orderBy: {
        startTime: 'desc',
      },
    });

    // Format the response with detailed information including progress
    const formattedChapters = course.chapters.map((chapter) => {
      // Find progress for this chapter
      const chapterProgress = chapterProgressRecords.find((cp) => cp.chapterId === chapter.id);

      // Format videos with progress
      const formattedVideos = chapter.videos.map((video) => {
        // Find progress for this video
        const videoProgress = videoProgressRecords.find((vp) => vp.videoId === video.id);

        return {
          id: video.id,
          title: video.title,
          description: video.description,
          duration: video.duration,
          backblazeUrl: video.backblazeUrl,
          orderIndex: video.orderIndex,
          progress: videoProgress
            ? {
                watchedPercent: videoProgress.watchedPercent,
                lastWatchedAt: videoProgress.lastWatchedAt,
                isCompleted: videoProgress.watchedPercent === 100,
              }
            : {
                watchedPercent: 0,
                lastWatchedAt: null,
                isCompleted: false,
              },
        };
      });

      // Find exam attempts for this chapter's exam
      const chapterExamAttempts = chapter.exam
        ? examAttempts.filter((attempt) => attempt.examId === chapter.exam?.id)
        : [];

      const bestExamScore =
        chapterExamAttempts.length > 0
          ? Math.max(...chapterExamAttempts.map((attempt) => attempt.score || 0))
          : 0;

      const hasPassedExam = chapterExamAttempts.some((attempt) => attempt.isPassed);

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        courseYear: chapter.courseYear,
        videos: formattedVideos,
        exam: chapter.exam
          ? {
              ...chapter.exam,
              attempts: chapterExamAttempts.length,
              bestScore: bestExamScore,
              passed: hasPassedExam,
            }
          : null,
        progress: {
          isCompleted: chapterProgress?.isCompleted || false,
          completedAt: chapterProgress?.completedAt || null,
          totalVideos: chapter.videos.length,
          watchedVideos: formattedVideos.filter((v) => v.progress.isCompleted).length,
        },
      };
    });

    // Calculate overall course progress
    const totalVideos = course.chapters.reduce((sum, chapter) => sum + chapter.videos.length, 0);
    const watchedVideos = videoProgressRecords.filter((vp) => vp.watchedPercent === 100).length;
    const videoProgress = totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;

    const totalChapters = course.chapters.length;
    const completedChapters = chapterProgressRecords.filter((cp) => cp.isCompleted).length;
    const chapterProgress =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    // Calculate overall course progress as average of video and chapter progress
    const overallProgress = Math.round((videoProgress + chapterProgress) / 2);

    logger.info('Course content retrieved successfully', {
      studentId,
      courseId,
    });

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        durationYears: course.durationYears,
        coverImageUrl: course.coverImageUrl,
      },
      enrollment: {
        enrollmentDate: enrollment.enrollmentDate,
        isActive: enrollment.isActive,
      },
      progress: {
        overallProgress,
        videoProgress,
        chapterProgress,
        completedChapters,
        totalChapters,
        watchedVideos,
        totalVideos,
      },
      chapters: formattedChapters,
    };
  } catch (error) {
    logger.error('Error in getEnrolledCourseContent', {
      studentId,
      courseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
