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
