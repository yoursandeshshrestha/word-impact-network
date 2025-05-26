// utils/progressUtils.ts
import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

/**
 * Updates chapter progress based on video completion and exam status
 * A chapter is completed when:
 * 1. All videos in the chapter are watched (100%)
 * 2. If an exam exists, it must be passed
 */
export async function updateChapterProgressBasedOnVideo(studentId: string, chapterId: string) {
  try {
    logger.info('Updating chapter progress based on video completion', { studentId, chapterId });

    // Get all videos in this chapter
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: {
        videos: true,
        exam: true,
      },
    });

    if (!chapter) {
      logger.warn('Chapter not found for progress update', { chapterId });
      return;
    }

    // Get video progress for all videos in this chapter
    const videoProgresses = await prisma.videoProgress.findMany({
      where: {
        studentId,
        video: {
          chapterId,
        },
      },
    });

    // Check if all videos are completed (100% watched)
    const allVideosCompleted = chapter.videos.every((video) => {
      const progress = videoProgresses.find((vp) => vp.videoId === video.id);
      return progress && progress.watchedPercent === 100;
    });

    // Check exam status if exam exists
    let examPassed = true; // Default to true if no exam
    if (chapter.exam) {
      const examAttempts = await prisma.examAttempt.findMany({
        where: {
          studentId,
          examId: chapter.exam.id,
        },
      });
      examPassed = examAttempts.some((attempt) => attempt.isPassed);
    }

    // Chapter is completed if all videos are watched AND exam is passed (if exists)
    const isChapterCompleted = allVideosCompleted && examPassed;

    // Find or create chapter progress record
    const existingProgress = await prisma.chapterProgress.findUnique({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId,
        },
      },
    });

    if (existingProgress) {
      // Update existing progress
      const shouldUpdate = existingProgress.isCompleted !== isChapterCompleted;

      if (shouldUpdate) {
        await prisma.chapterProgress.update({
          where: { id: existingProgress.id },
          data: {
            isCompleted: isChapterCompleted,
            completedAt: isChapterCompleted ? new Date() : null,
            lastVideoWatched: allVideosCompleted
              ? Math.max(...chapter.videos.map((v) => v.orderIndex))
              : existingProgress.lastVideoWatched,
          },
        });

        logger.info('Chapter progress updated', {
          studentId,
          chapterId,
          isCompleted: isChapterCompleted,
          allVideosCompleted,
          examPassed,
        });
      }
    } else {
      // Create new progress record
      await prisma.chapterProgress.create({
        data: {
          studentId,
          chapterId,
          isCompleted: isChapterCompleted,
          completedAt: isChapterCompleted ? new Date() : null,
          lastVideoWatched: allVideosCompleted
            ? Math.max(...chapter.videos.map((v) => v.orderIndex))
            : null,
        },
      });

      logger.info('Chapter progress created', {
        studentId,
        chapterId,
        isCompleted: isChapterCompleted,
        allVideosCompleted,
        examPassed,
      });
    }
  } catch (error) {
    logger.error('Error updating chapter progress', {
      studentId,
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Validates if a student can access a specific video based on prerequisites
 */
export async function canAccessVideo(
  studentId: string,
  videoId: string,
): Promise<{
  canAccess: boolean;
  reason?: string;
}> {
  try {
    // Get video with chapter and course info
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        chapter: {
          include: {
            course: true,
            videos: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!video) {
      return { canAccess: false, reason: 'Video not found' };
    }

    // Check if student is enrolled
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: video.chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      return { canAccess: false, reason: 'Not enrolled in this course' };
    }

    // Check if previous chapter is completed (if not first chapter)
    const allChapters = await prisma.chapter.findMany({
      where: { courseId: video.chapter.courseId },
      orderBy: { orderIndex: 'asc' },
    });

    const currentChapterIndex = allChapters.findIndex((c) => c.id === video.chapter.id);

    if (currentChapterIndex > 0) {
      const previousChapter = allChapters[currentChapterIndex - 1];
      const previousChapterProgress = await prisma.chapterProgress.findUnique({
        where: {
          studentId_chapterId: {
            studentId,
            chapterId: previousChapter.id,
          },
        },
      });

      if (!previousChapterProgress?.isCompleted) {
        return {
          canAccess: false,
          reason: `Complete the previous chapter "${previousChapter.title}" first`,
        };
      }
    }

    // Check if previous videos in current chapter are completed
    const currentVideoIndex = video.chapter.videos.findIndex((v) => v.id === videoId);

    if (currentVideoIndex > 0) {
      const previousVideos = video.chapter.videos.slice(0, currentVideoIndex);

      for (const prevVideo of previousVideos) {
        const progress = await prisma.videoProgress.findUnique({
          where: {
            studentId_videoId: {
              studentId,
              videoId: prevVideo.id,
            },
          },
        });

        if (!progress || progress.watchedPercent < 100) {
          return {
            canAccess: false,
            reason: `Complete the previous video "${prevVideo.title}" first`,
          };
        }
      }
    }

    return { canAccess: true };
  } catch (error) {
    logger.error('Error checking video access', {
      studentId,
      videoId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { canAccess: false, reason: 'Error checking access permissions' };
  }
}

/**
 * Validates if a student can access a specific exam based on prerequisites
 */
export async function canAccessExam(
  studentId: string,
  examId: string,
): Promise<{
  canAccess: boolean;
  reason?: string;
}> {
  try {
    // Get exam with chapter info
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        chapter: {
          include: {
            course: true,
            videos: true,
          },
        },
      },
    });

    if (!exam) {
      return { canAccess: false, reason: 'Exam not found' };
    }

    // Check if student is enrolled
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId: exam.chapter.courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      return { canAccess: false, reason: 'Not enrolled in this course' };
    }

    // Check if previous chapter is completed (if not first chapter)
    const allChapters = await prisma.chapter.findMany({
      where: { courseId: exam.chapter.courseId },
      orderBy: { orderIndex: 'asc' },
    });

    const currentChapterIndex = allChapters.findIndex((c) => c.id === exam.chapter.id);

    if (currentChapterIndex > 0) {
      const previousChapter = allChapters[currentChapterIndex - 1];
      const previousChapterProgress = await prisma.chapterProgress.findUnique({
        where: {
          studentId_chapterId: {
            studentId,
            chapterId: previousChapter.id,
          },
        },
      });

      if (!previousChapterProgress?.isCompleted) {
        return {
          canAccess: false,
          reason: `Complete the previous chapter "${previousChapter.title}" first`,
        };
      }
    }

    // Check if all videos in current chapter are completed
    const videoProgresses = await prisma.videoProgress.findMany({
      where: {
        studentId,
        video: {
          chapterId: exam.chapter.id,
        },
      },
    });

    const allVideosCompleted = exam.chapter.videos.every((video) => {
      const progress = videoProgresses.find((vp) => vp.videoId === video.id);
      return progress && progress.watchedPercent === 100;
    });

    if (!allVideosCompleted) {
      return {
        canAccess: false,
        reason: 'Complete all videos in this chapter before taking the exam',
      };
    }

    return { canAccess: true };
  } catch (error) {
    logger.error('Error checking exam access', {
      studentId,
      examId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { canAccess: false, reason: 'Error checking access permissions' };
  }
}
