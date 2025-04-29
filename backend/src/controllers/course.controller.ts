import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import { sendSuccess } from '../utils/responseHandler';
import { AppError, ErrorTypes } from '../utils/appError';
import {
  createNewCourse,
  fetchAllCourses,
  fetchCourseById,
  updateCourseById,
  deleteCourseById,
} from '../services/course.service';

/**
 * Create a new course
 * @route POST /api/v1/courses
 * @access Private (Admin only)
 */
export const createCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const adminId = req.user.userId;
  const { title, description, durationYears } = req.body;
  // Get the coverImage from the file upload if available
  const coverImageFile = req.file;

  const course = await createNewCourse(
    title,
    description,
    parseInt(durationYears, 10),
    adminId,
    coverImageFile,
  );

  sendSuccess(res, 201, 'Course created successfully', course);
});

/**
 * Get all courses
 * @route GET /api/v1/courses
 * @access Public
 */
export const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const courses = await fetchAllCourses();

  sendSuccess(res, 200, 'Courses retrieved successfully', courses);
});

/**
 * Get course by ID
 * @route GET /api/v1/courses/:id
 * @access Public
 */
export const getCourseById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const course = await fetchCourseById(id);

  if (!course) {
    throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
  }

  sendSuccess(res, 200, 'Course retrieved successfully', course);
});

/**
 * Update course by ID
 * @route PUT /api/v1/courses/:id
 * @access Private (Admin only)
 */
export const updateCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;
  const { title, description, durationYears, isActive } = req.body;
  // Get the coverImage from the file upload if available
  const coverImageFile = req.file;

  let durationYearsNum = undefined;
  if (durationYears) {
    durationYearsNum = parseInt(durationYears, 10);
    if (isNaN(durationYearsNum)) {
      throw new AppError('Duration years must be a valid number', 400, ErrorTypes.VALIDATION);
    }
  }

  const course = await updateCourseById(
    id,
    title,
    description,
    durationYearsNum,
    coverImageFile,
    isActive,
  );

  sendSuccess(res, 200, 'Course updated successfully', course);
});

/**
 * Delete course by ID
 * @route DELETE /api/v1/courses/:id
 * @access Private (Admin only)
 */
export const deleteCourse = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Authentication required', 401, ErrorTypes.AUTHENTICATION);
  }

  const { id } = req.params;

  await deleteCourseById(id);

  sendSuccess(res, 200, 'Course deleted successfully', { id });
});
