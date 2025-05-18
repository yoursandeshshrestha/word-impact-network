import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { AppError, ErrorTypes } from '../utils/appError';

const prisma = new PrismaClient();

export interface EnrollmentTrend {
  date: string;
  count: number;
}

export interface CourseCompletionRate {
  courseId: string;
  courseTitle: string;
  totalStudents: number;
  completedStudents: number;
  completionRate: number;
}

export interface VideoEngagement {
  videoId: string;
  videoTitle: string;
  chapterTitle: string;
  courseTitle: string;
  viewCount: number;
  averageWatchPercent: number;
}

export interface ExamPerformance {
  examId: string;
  examTitle: string;
  chapterTitle: string;
  courseTitle: string;
  totalAttempts: number;
  passRate: number;
  averageScore: number;
}

export interface StudentProgress {
  studentId: string;
  fullName: string;
  email: string;
  coursesEnrolled: number;
  chaptersCompleted: number;
  examsCompleted: number;
  examsSuccessful: number;
  overallProgress: number;
}

export interface CountryDistribution {
  country: string;
  studentCount: number;
  percentage: number;
}

export interface CourseReferralStats {
  referralSource: string;
  studentCount: number;
  percentage: number;
}

/**
 * Get enrollment trends over a specified period
 */
export async function getEnrollmentTrends(
  period: 'week' | 'month' | 'year' = 'month',
): Promise<EnrollmentTrend[]> {
  try {
    logger.info('Fetching enrollment trends', { period });

    // Calculate the start date based on the period
    const today = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
      startDate.setFullYear(today.getFullYear() - 1);
    }

    // Format as ISO strings for comparison
    const startDateStr = startDate.toISOString();

    // Fetch enrollment data by day
    const enrollmentData = await prisma.courseEnrollment.groupBy({
      by: ['enrollmentDate'],
      where: {
        enrollmentDate: {
          gte: startDateStr,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        enrollmentDate: 'asc',
      },
    });

    // Transform data into required format
    const trends = enrollmentData.map((item) => ({
      date: item.enrollmentDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      count: item._count.id,
    }));

    logger.info('Enrollment trends retrieved successfully', {
      period,
      dataPoints: trends.length,
    });

    return trends;
  } catch (error) {
    logger.error('Error in getEnrollmentTrends', {
      period,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get course completion rates
 */
export async function getCourseCompletionRates(): Promise<CourseCompletionRate[]> {
  try {
    logger.info('Fetching course completion rates');

    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        chapters: {
          select: {
            id: true,
          },
        },
        enrollments: {
          select: {
            studentId: true,
          },
        },
      },
    });

    const completionRates: CourseCompletionRate[] = [];

    // For each course, calculate completion rate
    for (const course of courses) {
      const totalStudents = course.enrollments.length;

      if (totalStudents === 0) {
        completionRates.push({
          courseId: course.id,
          courseTitle: course.title,
          totalStudents: 0,
          completedStudents: 0,
          completionRate: 0,
        });
        continue;
      }

      // Get all chapter IDs for this course
      const chapterIds = course.chapters.map((chapter) => chapter.id);

      // Get unique students who have completed all chapters in the course
      const studentIds = course.enrollments.map((enrollment) => enrollment.studentId);

      if (chapterIds.length === 0) {
        completionRates.push({
          courseId: course.id,
          courseTitle: course.title,
          totalStudents,
          completedStudents: 0,
          completionRate: 0,
        });
        continue;
      }

      // Count students with all chapters completed
      const completedStudentsCount = await prisma.student.count({
        where: {
          id: {
            in: studentIds,
          },
          chapterProgresses: {
            every: {
              chapterId: {
                in: chapterIds,
              },
              isCompleted: true,
            },
          },
        },
      });

      const completionRate = totalStudents > 0 ? (completedStudentsCount / totalStudents) * 100 : 0;

      completionRates.push({
        courseId: course.id,
        courseTitle: course.title,
        totalStudents,
        completedStudents: completedStudentsCount,
        completionRate: Math.round(completionRate * 100) / 100, // Round to 2 decimal places
      });
    }

    logger.info('Course completion rates retrieved successfully', {
      coursesAnalyzed: courses.length,
    });

    return completionRates;
  } catch (error) {
    logger.error('Error in getCourseCompletionRates', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get video engagement metrics
 */
export async function getVideoEngagementMetrics(limit: number = 10): Promise<VideoEngagement[]> {
  try {
    logger.info('Fetching video engagement metrics', { limit });

    // Get the most viewed videos
    const videoProgresses = await prisma.videoProgress.groupBy({
      by: ['videoId'],
      _count: {
        id: true, // Count of views
      },
      _avg: {
        watchedPercent: true, // Average watched percentage
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: limit,
    });

    // Get video details for the videos
    const videoIds = videoProgresses.map((progress) => progress.videoId);

    const videos = await prisma.video.findMany({
      where: {
        id: {
          in: videoIds,
        },
      },
      select: {
        id: true,
        title: true,
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    // Combine the data
    const engagementMetrics = videoProgresses.map((progress) => {
      const video = videos.find((v) => v.id === progress.videoId);

      return {
        videoId: progress.videoId,
        videoTitle: video?.title || 'Unknown Video',
        chapterTitle: video?.chapter.title || 'Unknown Chapter',
        courseTitle: video?.chapter.course.title || 'Unknown Course',
        viewCount: progress._count.id,
        averageWatchPercent: Math.round((progress._avg.watchedPercent || 0) * 100) / 100,
      };
    });

    logger.info('Video engagement metrics retrieved successfully', {
      videosAnalyzed: engagementMetrics.length,
    });

    return engagementMetrics;
  } catch (error) {
    logger.error('Error in getVideoEngagementMetrics', {
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get exam performance metrics
 */
export async function getExamPerformanceMetrics(): Promise<ExamPerformance[]> {
  try {
    logger.info('Fetching exam performance metrics');

    // Get all exams with their associated chapter and course
    const exams = await prisma.exam.findMany({
      select: {
        id: true,
        title: true,
        passingScore: true,
        chapter: {
          select: {
            id: true,
            title: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        examAttempts: {
          select: {
            id: true,
            score: true,
            isPassed: true,
          },
        },
      },
    });

    // Calculate performance metrics for each exam
    const performanceMetrics = exams.map((exam) => {
      const totalAttempts = exam.examAttempts.length;
      const passedAttempts = exam.examAttempts.filter((attempt) => attempt.isPassed).length;
      const passRate = totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      // Calculate average score
      const totalScore = exam.examAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0);
      const averageScore = totalAttempts > 0 ? totalScore / totalAttempts : 0;

      return {
        examId: exam.id,
        examTitle: exam.title,
        chapterTitle: exam.chapter.title,
        courseTitle: exam.chapter.course.title,
        totalAttempts,
        passRate: Math.round(passRate * 100) / 100, // Round to 2 decimal places
        averageScore: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
      };
    });

    logger.info('Exam performance metrics retrieved successfully', {
      examsAnalyzed: performanceMetrics.length,
    });

    return performanceMetrics;
  } catch (error) {
    logger.error('Error in getExamPerformanceMetrics', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get student progress data
 */
export async function getStudentProgressData(limit: number = 10): Promise<StudentProgress[]> {
  try {
    logger.info('Fetching student progress data', { limit });

    // Get students with their enrollment, chapter progress, and exam data
    const students = await prisma.student.findMany({
      take: limit,
      select: {
        id: true,
        fullName: true,
        user: {
          select: {
            email: true,
          },
        },
        courseEnrollments: {
          select: {
            id: true,
          },
        },
        chapterProgresses: {
          select: {
            id: true,
            isCompleted: true,
          },
        },
        examAttempts: {
          select: {
            id: true,
            isPassed: true,
          },
        },
      },
    });

    // Calculate progress metrics for each student
    const progressData = students.map((student) => {
      const coursesEnrolled = student.courseEnrollments.length;
      const chaptersCompleted = student.chapterProgresses.filter(
        (progress) => progress.isCompleted,
      ).length;
      const examsCompleted = student.examAttempts.length;
      const examsSuccessful = student.examAttempts.filter((attempt) => attempt.isPassed).length;

      // Calculate overall progress percentage (simple weighted average)
      const totalChapters = student.chapterProgresses.length;
      const overallProgress = totalChapters > 0 ? (chaptersCompleted / totalChapters) * 100 : 0;

      return {
        studentId: student.id,
        fullName: student.fullName,
        email: student.user.email,
        coursesEnrolled,
        chaptersCompleted,
        examsCompleted,
        examsSuccessful,
        overallProgress: Math.round(overallProgress * 100) / 100, // Round to 2 decimal places
      };
    });

    logger.info('Student progress data retrieved successfully', {
      studentsAnalyzed: progressData.length,
    });

    return progressData;
  } catch (error) {
    logger.error('Error in getStudentProgressData', {
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get student geographic distribution
 */
export async function getStudentGeographicDistribution(): Promise<CountryDistribution[]> {
  try {
    logger.info('Fetching student geographic distribution');

    // Group students by country
    const countryGroups = await prisma.student.groupBy({
      by: ['country'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Calculate total students
    const totalStudents = await prisma.student.count();

    // Calculate percentage for each country
    const distribution = countryGroups.map((group) => {
      const percentage = totalStudents > 0 ? (group._count.id / totalStudents) * 100 : 0;

      return {
        country: group.country,
        studentCount: group._count.id,
        percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
      };
    });

    logger.info('Student geographic distribution retrieved successfully', {
      countriesFound: distribution.length,
      totalStudents,
    });

    return distribution;
  } catch (error) {
    logger.error('Error in getStudentGeographicDistribution', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get course referral statistics
 */
export async function getCourseReferralStats(): Promise<CourseReferralStats[]> {
  try {
    logger.info('Fetching course referral statistics');

    // Group students by referral source
    const referralGroups = await prisma.student.groupBy({
      by: ['referredBy'],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Calculate total students with referral
    const totalReferredStudents = referralGroups.reduce(
      (sum, group) => sum + (group.referredBy ? group._count.id : 0),
      0,
    );

    // Calculate percentage for each referral source
    const referralStats = referralGroups
      .filter((group) => group.referredBy !== null && group.referredBy !== '')
      .map((group) => {
        const percentage =
          totalReferredStudents > 0 ? (group._count.id / totalReferredStudents) * 100 : 0;

        return {
          referralSource: group.referredBy || 'None',
          studentCount: group._count.id,
          percentage: Math.round(percentage * 100) / 100, // Round to 2 decimal places
        };
      });

    logger.info('Course referral statistics retrieved successfully', {
      referralSourcesFound: referralStats.length,
      totalReferredStudents,
    });

    return referralStats;
  } catch (error) {
    logger.error('Error in getCourseReferralStats', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

/**
 * Get comprehensive analytics data
 */
export async function getAnalyticsData() {
  try {
    logger.info('Fetching comprehensive analytics data');

    // Execute all analytics queries in parallel
    const [
      enrollmentTrends,
      courseCompletionRates,
      videoEngagementMetrics,
      examPerformanceMetrics,
      studentProgressData,
      geographicDistribution,
      referralStats,
    ] = await Promise.all([
      getEnrollmentTrends('month'),
      getCourseCompletionRates(),
      getVideoEngagementMetrics(5),
      getExamPerformanceMetrics(),
      getStudentProgressData(5),
      getStudentGeographicDistribution(),
      getCourseReferralStats(),
    ]);

    logger.info('Comprehensive analytics data retrieved successfully');

    return {
      enrollmentTrends,
      courseCompletionRates,
      videoEngagementMetrics,
      examPerformanceMetrics,
      studentProgressData,
      geographicDistribution,
      referralStats,
    };
  } catch (error) {
    logger.error('Error in getAnalyticsData', {
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
