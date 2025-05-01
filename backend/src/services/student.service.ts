import { PrismaClient, Gender, ApplicationStatus, UserRole } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';
import { sendApplicationConfirmationEmail } from './email.service';
import bcrypt from 'bcryptjs';
import { StudentProfileUpdateData } from '@/types/types';
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
        isActive: true 
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
                    videos: true
                  }
                }
              },
              orderBy: {
                orderIndex: 'asc'
              }
            },
            _count: {
              select: {
                chapters: true
              }
            }
          }
        }
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
              courseId: enrollment.course.id
            }
          }
        });

        const watchedVideosInCourse = await prisma.videoProgress.count({
          where: {
            studentId: studentId,
            video: {
              chapter: {
                courseId: enrollment.course.id
              }
            },
            watchedPercent: 100
          }
        });

        // Calculate progress percentages
        const chapterProgressPercent = totalChapters > 0 
          ? Math.round((completedChapters / totalChapters) * 100) 
          : 0;
          
        const videoProgressPercent = totalVideosInCourse > 0 
          ? Math.round((watchedVideosInCourse / totalVideosInCourse) * 100) 
          : 0;

        // Calculate overall progress as average of chapter and video progress
        const overallProgress = Math.round((chapterProgressPercent + videoProgressPercent) / 2);

        // Get latest certification for this course if any
        const latestCertification = await prisma.yearCertification.findFirst({
          where: {
            studentId: studentId,
            courseId: enrollment.course.id
          },
          orderBy: {
            year: 'desc'
          }
        });

        return {
          enrollment: {
            id: enrollment.id,
            enrollmentDate: enrollment.enrollmentDate,
            isActive: enrollment.isActive
          },
          course: {
            id: enrollment.course.id,
            title: enrollment.course.title,
            description: enrollment.course.description,
            durationYears: enrollment.course.durationYears,
            coverImageUrl: enrollment.course.coverImageUrl
          },
          chapters: enrollment.course.chapters.map(chapter => ({
            id: chapter.id,
            title: chapter.title,
            description: chapter.description,
            orderIndex: chapter.orderIndex,
            courseYear: chapter.courseYear,
            videosCount: chapter._count.videos
          })),
          progress: {
            completedChapters,
            totalChapters,
            chapterProgressPercent,
            watchedVideos: watchedVideosInCourse,
            totalVideos: totalVideosInCourse,
            videoProgressPercent,
            overallProgress
          },
          certification: latestCertification ? {
            year: latestCertification.year,
            certificateUrl: latestCertification.certificateUrl,
            issuedAt: latestCertification.issuedAt
          } : null
        };
      })
    );

    // Get recommended courses (courses student is not enrolled in)
    const recommendedCourses = await prisma.course.findMany({
      where: {
        isActive: true,
        enrollments: {
          none: {
            studentId: studentId
          }
        }
      },
      select: {
        id: true,
        title: true,
        description: true,
        durationYears: true,
        coverImageUrl: true,
        _count: {
          select: {
            chapters: true
          }
        }
      },
      take: 3 // Limit to 3 recommended courses
    });

    logger.info('Enrolled courses retrieved successfully', { 
      studentId, 
      enrolledCount: courseEnrollments.length,
      recommendedCount: recommendedCourses.length
    });

    return {
      enrolled: {
        count: courseEnrollments.length,
        courses: coursesWithProgress
      },
      recommended: {
        count: recommendedCourses.length,
        courses: recommendedCourses
      }
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
        isActive: true
      },
      include: {
        chapters: {
          select: {
            id: true
          }
        }
      }
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
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      // If enrollment exists but is inactive, reactivate it
      if (!existingEnrollment.isActive) {
        const reactivatedEnrollment = await prisma.courseEnrollment.update({
          where: {
            id: existingEnrollment.id
          },
          data: {
            isActive: true,
            updatedAt: new Date()
          },
          include: {
            course: true
          }
        });

        logger.info('Course enrollment reactivated', { 
          studentId, 
          courseId, 
          enrollmentId: reactivatedEnrollment.id 
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
              durationYears: reactivatedEnrollment.course.durationYears
            }
          }
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
          connect: { id: studentId }
        },
        course: {
          connect: { id: courseId }
        },
        isActive: true
      },
      include: {
        course: true
      }
    });

    // Initialize chapter progress for all chapters in this course
    const chapterProgressPromises = course.chapters.map(chapter => {
      return prisma.chapterProgress.create({
        data: {
          student: {
            connect: { id: studentId }
          },
          chapter: {
            connect: { id: chapter.id }
          },
          isCompleted: false
        }
      });
    });

    await Promise.all(chapterProgressPromises);

    logger.info('Student enrolled in course successfully', { 
      studentId, 
      courseId, 
      enrollmentId: enrollment.id 
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
          durationYears: enrollment.course.durationYears
        }
      }
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
        isActive: true 
      },
      include: {
        course: true
      }
    });

    // Total courses the student is enrolled in
    const totalCourses = enrollments.length;

    // Get all chapters across enrolled courses
    const enrolledCourseIds = enrollments.map(enrollment => enrollment.courseId);
    
    const chapters = await prisma.chapter.findMany({
      where: {
        courseId: { in: enrolledCourseIds }
      }
    });
    
    const totalChapters = chapters.length;

    // Find completed chapters
    const completedChapters = await prisma.chapterProgress.count({
      where: {
        studentId,
        isCompleted: true,
        chapter: {
          courseId: { in: enrolledCourseIds }
        }
      }
    });

    // Get all videos across enrolled courses
    const videos = await prisma.video.findMany({
      where: {
        chapter: {
          courseId: { in: enrolledCourseIds }
        }
      }
    });
    
    const totalVideos = videos.length;

    // Find watched videos
    const watchedVideos = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: 100,
        video: {
          chapter: {
            courseId: { in: enrolledCourseIds }
          }
        }
      }
    });

    // Videos in progress (started but not completed)
    const videosInProgress = await prisma.videoProgress.count({
      where: {
        studentId,
        watchedPercent: { gt: 0, lt: 100 },
        video: {
          chapter: {
            courseId: { in: enrolledCourseIds }
          }
        }
      }
    });

    // Get exam attempts data
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        exam: {
          chapter: {
            courseId: { in: enrolledCourseIds }
          }
        }
      },
      include: {
        exam: true
      }
    });

    const totalExamAttempts = examAttempts.length;
    const passedExams = examAttempts.filter(attempt => attempt.isPassed).length;

    // Get all exams in enrolled courses
    const totalExams = await prisma.exam.count({
      where: {
        chapter: {
          courseId: { in: enrolledCourseIds }
        }
      }
    });

    // Unique exams attempted
    const uniqueExamsAttempted = new Set(examAttempts.map(a => a.examId)).size;

    // Get certifications
    const certifications = await prisma.yearCertification.findMany({
      where: {
        studentId,
        courseId: { in: enrolledCourseIds }
      },
      include: {
        course: true
      }
    });

    // Calculate recent activity
    const recentActivity = await prisma.videoProgress.findMany({
      where: {
        studentId,
        lastWatchedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        }
      },
      orderBy: {
        lastWatchedAt: 'desc'
      },
      take: 5,
      include: {
        video: {
          include: {
            chapter: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    // Calculate recent exam attempts
    const recentExamAttempts = await prisma.examAttempt.findMany({
      where: {
        studentId,
        startTime: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
        }
      },
      orderBy: {
        startTime: 'desc'
      },
      take: 5,
      include: {
        exam: {
          include: {
            chapter: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    // Calculate streak data (consecutive days with activity)
    const activityDays = await prisma.videoProgress.findMany({
      where: {
        studentId,
        lastWatchedAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        }
      },
      select: {
        lastWatchedAt: true
      },
      orderBy: {
        lastWatchedAt: 'desc'
      }
    });

    // Extract unique dates when the student was active
    const uniqueDatesSet = new Set();
    activityDays.forEach(activity => {
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
        const currentDate = new Date(uniqueDates[i-1]);
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
      const currentDate = new Date(uniqueDates[i-1]);
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
    const chapterProgress = totalChapters > 0 
      ? Math.round((completedChapters / totalChapters) * 100) 
      : 0;
      
    const videoProgress = totalVideos > 0 
      ? Math.round((watchedVideos / totalVideos) * 100) 
      : 0;
      
    const examProgress = totalExams > 0 
      ? Math.round((passedExams / totalExams) * 100) 
      : 0;
      
    // Overall progress is average of chapter, video, and exam progress
    const overallProgress = Math.round((chapterProgress + videoProgress + examProgress) / 3);

    // Format response data
    const formattedRecentActivity = recentActivity.map(activity => ({
      id: activity.id,
      videoTitle: activity.video.title,
      chapterTitle: activity.video.chapter.title,
      courseName: activity.video.chapter.course.title,
      watchedPercent: activity.watchedPercent,
      lastWatchedAt: activity.lastWatchedAt
    }));

    const formattedRecentExams = recentExamAttempts.map(attempt => ({
      id: attempt.id,
      examTitle: attempt.exam.title,
      chapterTitle: attempt.exam.chapter.title,
      courseName: attempt.exam.chapter.course.title,
      score: attempt.score || 0,
      isPassed: attempt.isPassed,
      startTime: attempt.startTime,
      endTime: attempt.endTime
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
        withCertification: new Set(certifications.map(c => c.courseId)).size,
      },
      chapters: {
        total: totalChapters,
        completed: completedChapters,
        progress: chapterProgress
      },
      videos: {
        total: totalVideos,
        watched: watchedVideos,
        inProgress: videosInProgress,
        notStarted: totalVideos - (watchedVideos + videosInProgress),
        progress: videoProgress
      },
      exams: {
        total: totalExams,
        attempted: uniqueExamsAttempted,
        totalAttempts: totalExamAttempts,
        passed: passedExams,
        failed: totalExamAttempts - passedExams,
        progress: examProgress
      },
      certifications: {
        total: certifications.length,
        courses: certifications.map(cert => ({
          id: cert.id,
          courseName: cert.course.title,
          year: cert.year,
          certificateUrl: cert.certificateUrl,
          issuedAt: cert.issuedAt
        }))
      },
      recentActivity: {
        videos: formattedRecentActivity,
        exams: formattedRecentExams
      }
    };
  } catch (error) {
    logger.error('Error in getStudentLearningProgress', {
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}