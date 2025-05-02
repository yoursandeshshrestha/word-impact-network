import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

const prisma = new PrismaClient();

/**
 * Updates chapter progress based on video progress
 * This helper function recalculates chapter completion status when video progress changes
 */
export async function updateChapterProgressBasedOnVideo(studentId: string, chapterId: string) {
  try {
    // Get all videos in the chapter
    const chapterVideos = await prisma.video.findMany({
      where: { chapterId },
    });

    // Count total videos
    const totalVideos = chapterVideos.length;

    if (totalVideos === 0) {
      return; // No videos to track
    }

    // Get watched videos
    const videoProgressRecords = await prisma.videoProgress.findMany({
      where: {
        studentId,
        video: {
          chapterId,
        },
        watchedPercent: 100, // Only fully watched videos
      },
    });

    // Count completed videos
    const completedVideos = videoProgressRecords.length;

    // Get chapter progress record
    const chapterProgress = await prisma.chapterProgress.findUnique({
      where: {
        studentId_chapterId: {
          studentId,
          chapterId,
        },
      },
    });

    // Find the highest video order index that has progress
    const videoIds = chapterVideos.map((v) => v.id);
    const allVideoProgressRecords = await prisma.videoProgress.findMany({
      where: {
        studentId,
        videoId: { in: videoIds },
        watchedPercent: { gt: 0 },
      },
      include: {
        video: true,
      },
    });

    const lastWatchedVideo =
      allVideoProgressRecords.length > 0
        ? Math.max(...allVideoProgressRecords.map((vp) => vp.video.orderIndex))
        : null;

    // Check if chapter has exam
    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { exam: true },
    });

    // Determine if exam is passed (if exists)
    let examPassed = true; // Default to true if no exam

    if (chapter?.exam) {
      const passedExamAttempt = await prisma.examAttempt.findFirst({
        where: {
          studentId,
          examId: chapter.exam.id,
          isPassed: true,
        },
      });

      examPassed = !!passedExamAttempt;
    }

    // Chapter is completed if all videos are watched and exam is passed (if exists)
    const allVideosCompleted = completedVideos === totalVideos;
    const isCompleted = allVideosCompleted && examPassed;

    // Update chapter progress
    if (chapterProgress) {
      await prisma.chapterProgress.update({
        where: { id: chapterProgress.id },
        data: {
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          lastVideoWatched: lastWatchedVideo,
        },
      });
    } else {
      // Create new chapter progress record
      await prisma.chapterProgress.create({
        data: {
          student: { connect: { id: studentId } },
          chapter: { connect: { id: chapterId } },
          isCompleted,
          completedAt: isCompleted ? new Date() : null,
          lastVideoWatched: lastWatchedVideo,
        },
      });
    }
  } catch (error) {
    logger.error('Error in updateChapterProgressBasedOnVideo', {
      studentId,
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Don't rethrow to prevent affecting the main function
  }
}
