import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';
import { uploadToCloudinary } from '../utils/cloudinary';

const prisma = new PrismaClient();

interface CourseCreateParams {
  title: string;
  description: string;
  durationYears: string;
  coverImageUrl?: string;
  isActive?: boolean;
  adminId: string;
}

interface CourseUpdateParams {
  title?: string;
  description?: string;
  durationYears?: number;
  coverImageUrl?: string;
  isActive?: boolean;
}

/**
 * Create a new course
 */
export async function createNewCourse(
  title: string,
  description: string,
  durationYears: number,
  adminId: string,
  coverImageFile?: Express.Multer.File,
) {
  try {
    logger.info('Creating new course', { title, adminId });

    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { userId: adminId },
    });

    if (!admin) {
      logger.warn('Course creation failed - admin not found', { adminId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    let coverImageUrl: string | undefined;

    // Upload cover image to Cloudinary if provided
    if (coverImageFile) {
      coverImageUrl = await uploadToCloudinary(
        coverImageFile.buffer,
        'win/courses',
        `course-${title.toLowerCase().replace(/\s+/g, '-')}`,
      );
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        durationYears,
        coverImageUrl,
        adminId: admin.id, // Use the admin's ID from the Admin table
      },
    });

    logger.info('Course created successfully', { courseId: course.id });
    return course;
  } catch (error) {
    logger.error('Error creating course', {
      title,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch all courses
 */
export async function fetchAllCourses() {
  try {
    logger.info('Fetching all courses');
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: {
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });
    return courses;
  } catch (error) {
    logger.error('Error fetching courses', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch course by ID
 */
export async function fetchCourseById(id: string) {
  try {
    logger.info('Fetching course by ID', { courseId: id });
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            fullName: true,
          },
        },
        chapters: {
          orderBy: [{ courseYear: 'asc' }, { orderIndex: 'asc' }],
          include: {
            videos: {
              orderBy: {
                orderIndex: 'asc',
              },
              select: {
                id: true,
                title: true,
                description: true,
                vimeoId: true,
                vimeoUrl: true,
                duration: true,
                orderIndex: true,
                createdAt: true,
                updatedAt: true,
              },
            },
            exam: {
              select: {
                id: true,
                title: true,
                description: true,
                passingScore: true,
                timeLimit: true,
                createdAt: true,
                updatedAt: true,
                questions: {
                  orderBy: {
                    createdAt: 'asc',
                  },
                  select: {
                    id: true,
                    text: true,
                    questionType: true,
                    options: true,
                    correctAnswer: true,
                    points: true,
                    createdAt: true,
                    updatedAt: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    return course;
  } catch (error) {
    logger.error('Error fetching course', {
      courseId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update course by ID
 */
export async function updateCourseById(
  id: string,
  title?: string,
  description?: string,
  durationYears?: number,
  coverImageFile?: Express.Multer.File,
  isActive?: boolean,
) {
  try {
    logger.info('Updating course', { courseId: id });

    let coverImageUrl: string | undefined;

    // Upload new cover image to Cloudinary if provided
    if (coverImageFile) {
      coverImageUrl = await uploadToCloudinary(
        coverImageFile.buffer,
        'win/courses',
        `course-${title?.toLowerCase().replace(/\s+/g, '-')}`,
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {};

    // Only add fields that are explicitly provided
    if (title !== undefined && title !== '') updateData.title = title;
    if (description !== undefined && description !== '') updateData.description = description;
    if (durationYears !== undefined && durationYears !== null)
      updateData.durationYears = durationYears;
    if (coverImageUrl) updateData.coverImageUrl = coverImageUrl;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If no fields to update, return the current course
    if (Object.keys(updateData).length === 0) {
      return await prisma.course.findUnique({
        where: { id },
        include: {
          createdBy: {
            select: {
              fullName: true,
            },
          },
        },
      });
    }

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    logger.info('Course updated successfully', { courseId: course.id });
    return course;
  } catch (error) {
    logger.error('Error updating course', {
      courseId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Delete course by ID
 */
export async function deleteCourseById(id: string) {
  try {
    logger.info('Starting course deletion process', { courseId: id });

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        chapters: {
          include: {
            exam: true,
            videos: true,
            chapterProgresses: true,
          },
        },
        enrollments: true,
        yearCertifications: true,
      },
    });

    if (!course) {
      logger.warn('Course not found for deletion', { courseId: id });
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Use a transaction to ensure all related data is properly handled
    await prisma.$transaction(async (prismaTransaction) => {
      // 1. Delete all year certifications for this course
      if (course.yearCertifications.length > 0) {
        logger.info('Deleting year certifications for course', {
          courseId: id,
          count: course.yearCertifications.length,
        });

        await prismaTransaction.yearCertification.deleteMany({
          where: { courseId: id },
        });
      }

      // 2. Delete all enrollments for this course
      if (course.enrollments.length > 0) {
        logger.info('Deleting course enrollments', {
          courseId: id,
          count: course.enrollments.length,
        });

        await prismaTransaction.courseEnrollment.deleteMany({
          where: { courseId: id },
        });
      }

      // 3. Process each chapter and its related entities
      for (const chapter of course.chapters) {
        // 3.1 Delete chapter progresses
        if (chapter.chapterProgresses.length > 0) {
          logger.info('Deleting chapter progresses', {
            chapterId: chapter.id,
            count: chapter.chapterProgresses.length,
          });

          await prismaTransaction.chapterProgress.deleteMany({
            where: { chapterId: chapter.id },
          });
        }

        // 3.2 Delete exam and related entities if exists
        if (chapter.exam) {
          logger.info('Processing exam deletion', { examId: chapter.exam.id });

          // Delete exam attempts and their answers
          const examAttempts = await prismaTransaction.examAttempt.findMany({
            where: { examId: chapter.exam.id },
            include: { answers: true },
          });

          for (const attempt of examAttempts) {
            // Delete answers for this attempt
            if (attempt.answers.length > 0) {
              logger.info('Deleting exam attempt answers', {
                attemptId: attempt.id,
                count: attempt.answers.length,
              });

              await prismaTransaction.answer.deleteMany({
                where: { examAttemptId: attempt.id },
              });
            }
          }

          // Delete all exam attempts for this exam
          logger.info('Deleting exam attempts', {
            examId: chapter.exam.id,
            count: examAttempts.length,
          });

          await prismaTransaction.examAttempt.deleteMany({
            where: { examId: chapter.exam.id },
          });

          // Delete all questions for this exam
          await prismaTransaction.question.deleteMany({
            where: { examId: chapter.exam.id },
          });

          // Delete the exam itself
          logger.info('Deleting exam', { examId: chapter.exam.id });
          await prismaTransaction.exam.delete({
            where: { id: chapter.exam.id },
          });
        }

        // 3.3 Delete video progresses and videos for this chapter
        if (chapter.videos.length > 0) {
          // Delete video progresses for each video
          for (const video of chapter.videos) {
            logger.info('Deleting video progresses', { videoId: video.id });
            await prismaTransaction.videoProgress.deleteMany({
              where: { videoId: video.id },
            });
          }

          // Delete all videos for this chapter
          logger.info('Deleting videos', {
            chapterId: chapter.id,
            count: chapter.videos.length,
          });

          await prismaTransaction.video.deleteMany({
            where: { chapterId: chapter.id },
          });
        }
      }

      // 4. Delete all chapters for this course
      logger.info('Deleting chapters', {
        courseId: id,
        count: course.chapters.length,
      });

      await prismaTransaction.chapter.deleteMany({
        where: { courseId: id },
      });

      // 5. Finally, delete the course itself
      // Option 1: Hard delete - completely removes the course from the database
      logger.info('Hard deleting course', { courseId: id });
      await prismaTransaction.course.delete({
        where: { id },
      });

      // Option 2: Soft delete - if you prefer soft deletion instead of the hard delete above
      // logger.info('Soft deleting course', { courseId: id });
      // await prismaTransaction.course.update({
      //   where: { id },
      //   data: {
      //     isActive: false,
      //     // You can also add fields like deletedAt or updatedBy if needed
      //     // deletedAt: new Date(),
      //   }
      // });
    });

    logger.info('Course and all related data deleted successfully', { courseId: id });
    return { success: true };
  } catch (error) {
    logger.error('Error in deleteCourseById', {
      courseId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
