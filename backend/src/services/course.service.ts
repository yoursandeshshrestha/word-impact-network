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
    logger.info('Deleting course', { courseId: id });

    // Soft delete by setting isActive to false
    await prisma.course.update({
      where: { id },
      data: { isActive: false },
    });

    logger.info('Course deleted successfully', { courseId: id });
  } catch (error) {
    logger.error('Error deleting course', {
      courseId: id,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
