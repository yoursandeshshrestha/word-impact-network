import { PrismaClient } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

/**
 * Create a new chapter
 */
export async function createChapter(
  title: string,
  description: string,
  orderIndex: number,
  courseYear: number,
  courseId: string,
  adminId: string,
) {
  try {
    logger.info('Creating new chapter', { title, courseId, adminId });

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      logger.warn('Chapter creation failed - course not found', { courseId });
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Verify admin exists
    const admin = await prisma.admin.findUnique({
      where: { userId: adminId },
    });

    if (!admin) {
      logger.warn('Chapter creation failed - admin not found', { adminId });
      throw new AppError('Admin not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if a chapter with the same orderIndex already exists for this course and year
    const existingChapter = await prisma.chapter.findFirst({
      where: {
        courseId,
        courseYear,
        orderIndex,
      },
    });

    if (existingChapter) {
      logger.warn('Chapter creation failed - order index already exists', { courseId, orderIndex });
      throw new AppError(
        `A chapter with order index ${orderIndex} already exists for this course and year`,
        400,
        ErrorTypes.VALIDATION,
      );
    }

    const chapter = await prisma.chapter.create({
      data: {
        title,
        description,
        orderIndex,
        courseYear,
        courseId,
        adminId: admin.id,
      },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    logger.info('Chapter created successfully', { chapterId: chapter.id });
    return chapter;
  } catch (error) {
    logger.error('Error creating chapter', {
      title,
      courseId,
      adminId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch all chapters for a course
 */
export async function fetchChaptersByCourseId(courseId: string) {
  try {
    logger.info('Fetching chapters by course ID', { courseId });

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      logger.warn('Fetch chapters failed - course not found', { courseId });
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      orderBy: [{ courseYear: 'asc' }, { orderIndex: 'asc' }],
      include: {
        createdBy: {
          select: {
            fullName: true,
          },
        },
        _count: {
          select: {
            videos: true,
          },
        },
      },
    });

    return chapters;
  } catch (error) {
    logger.error('Error fetching chapters', {
      courseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Fetch chapter by ID
 */
export async function fetchChapterById(id: string) {
  try {
    logger.info('Fetching chapter by ID', { chapterId: id });
    const chapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            title: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
        videos: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
        exam: {
          include: {
            questions: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    return chapter;
  } catch (error) {
    logger.error('Error fetching chapter', {
      chapterId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Update chapter by ID
 */
export async function updateChapterById(
  id: string,
  updateData: {
    title?: string;
    description?: string;
    orderIndex?: number;
    courseYear?: number;
  },
) {
  try {
    logger.info('Updating chapter', { chapterId: id });

    // Check if chapter exists
    const existingChapter = await prisma.chapter.findUnique({
      where: { id },
      include: {
        course: true,
      },
    });

    if (!existingChapter) {
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // If orderIndex is being updated, check for conflicts
    if (
      updateData.orderIndex !== undefined &&
      updateData.orderIndex !== existingChapter.orderIndex
    ) {
      const conflictingChapter = await prisma.chapter.findFirst({
        where: {
          courseId: existingChapter.courseId,
          courseYear: existingChapter.courseYear,
          orderIndex: updateData.orderIndex,
          id: { not: id }, // Exclude the current chapter
        },
      });

      if (conflictingChapter) {
        throw new AppError(
          `A chapter with order index ${updateData.orderIndex} already exists for this course and year`,
          400,
          ErrorTypes.VALIDATION,
        );
      }
    }

    // Prepare update data
    const filteredUpdateData: Record<string, any> = {};

    // Only add fields that are explicitly provided
    if (updateData.title !== undefined) filteredUpdateData.title = updateData.title;
    if (updateData.description !== undefined)
      filteredUpdateData.description = updateData.description;
    if (updateData.orderIndex !== undefined) filteredUpdateData.orderIndex = updateData.orderIndex;
    if (updateData.courseYear !== undefined) filteredUpdateData.courseYear = updateData.courseYear;

    // If no fields to update, return the current chapter
    if (Object.keys(filteredUpdateData).length === 0) {
      return await fetchChapterById(id);
    }

    const chapter = await prisma.chapter.update({
      where: { id },
      data: filteredUpdateData,
      include: {
        course: {
          select: {
            title: true,
          },
        },
        createdBy: {
          select: {
            fullName: true,
          },
        },
      },
    });

    logger.info('Chapter updated successfully', { chapterId: chapter.id });
    return chapter;
  } catch (error) {
    logger.error('Error updating chapter', {
      chapterId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Delete chapter by ID
 */
export async function deleteChapterById(id: string) {
  try {
    logger.info('Deleting chapter', { chapterId: id });

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id },
    });

    if (!chapter) {
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Delete the chapter
    await prisma.chapter.delete({
      where: { id },
    });

    logger.info('Chapter deleted successfully', { chapterId: id });
  } catch (error) {
    logger.error('Error deleting chapter', {
      chapterId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Reorder a chapter
 */
export async function reorderChapter(
  chapterId: string,
  newOrderIndex: number,
  newCourseYear?: number,
) {
  try {
    logger.info('Reordering chapter', { chapterId, newOrderIndex, newCourseYear });

    // Check if chapter exists
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
    });

    if (!chapter) {
      throw new AppError('Chapter not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Start a transaction to ensure all updates are atomic
    return await prisma.$transaction(async (tx) => {
      const currentYear = newCourseYear !== undefined ? newCourseYear : chapter.courseYear;

      // If year is changing, we need special handling
      if (newCourseYear !== undefined && newCourseYear !== chapter.courseYear) {
        // Step 1: Shift all chapters in the new year with orderIndex >= newOrderIndex up by 1
        await tx.chapter.updateMany({
          where: {
            courseId: chapter.courseId,
            courseYear: newCourseYear,
            orderIndex: {
              gte: newOrderIndex,
            },
          },
          data: {
            orderIndex: {
              increment: 1,
            },
          },
        });

        // Step 2: Shift all chapters in the old year with orderIndex > current chapter's orderIndex down by 1
        await tx.chapter.updateMany({
          where: {
            courseId: chapter.courseId,
            courseYear: chapter.courseYear,
            orderIndex: {
              gt: chapter.orderIndex,
            },
          },
          data: {
            orderIndex: {
              decrement: 1,
            },
          },
        });
      } else {
        // If staying in the same year but changing position
        if (newOrderIndex > chapter.orderIndex) {
          // Moving down: decrement positions of chapters between old and new position
          await tx.chapter.updateMany({
            where: {
              courseId: chapter.courseId,
              courseYear: chapter.courseYear,
              orderIndex: {
                gt: chapter.orderIndex,
                lte: newOrderIndex,
              },
            },
            data: {
              orderIndex: {
                decrement: 1,
              },
            },
          });
        } else if (newOrderIndex < chapter.orderIndex) {
          // Moving up: increment positions of chapters between new and old position
          await tx.chapter.updateMany({
            where: {
              courseId: chapter.courseId,
              courseYear: chapter.courseYear,
              orderIndex: {
                gte: newOrderIndex,
                lt: chapter.orderIndex,
              },
            },
            data: {
              orderIndex: {
                increment: 1,
              },
            },
          });
        } else {
          // Same position, no changes needed
          return await fetchChapterById(chapterId);
        }
      }

      // Update the chapter with its new position and year
      const updatedChapter = await tx.chapter.update({
        where: { id: chapterId },
        data: {
          orderIndex: newOrderIndex,
          courseYear: currentYear,
        },
        include: {
          course: {
            select: {
              title: true,
            },
          },
          createdBy: {
            select: {
              fullName: true,
            },
          },
        },
      });

      logger.info('Chapter reordered successfully', {
        chapterId,
        newOrderIndex,
        newCourseYear,
      });

      return updatedChapter;
    });
  } catch (error) {
    logger.error('Error reordering chapter', {
      chapterId,
      newOrderIndex,
      newCourseYear,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
