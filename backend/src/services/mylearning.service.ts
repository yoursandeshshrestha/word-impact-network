import { PrismaClient, ApplicationStatus } from '@prisma/client';
import { AppError, ErrorTypes } from '../utils/appError';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();

// Get student's enrolled courses for My Learning dashboard
export async function getStudentEnrolledCoursesForLearning(studentId: string) {
  try {
    logger.info('Fetching enrolled courses for My Learning', { studentId });

    // Find the student first to verify they exist
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('My Learning courses fetch failed - student not found', { studentId });
      throw new AppError('Student not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get course enrollments with basic course details only
    const courseEnrollments = await prisma.courseEnrollment.findMany({
      where: {
        studentId: studentId,
        isActive: true,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            durationYears: true,
            coverImageUrl: true,
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
        const courseId = enrollment.course.id;

        // Count total chapters in the course
        const totalChapters = await prisma.chapter.count({
          where: { courseId },
        });

        // Count completed chapters for this student in this course
        const completedChapters = await prisma.chapterProgress.count({
          where: {
            studentId: studentId,
            chapter: { courseId },
            isCompleted: true,
          },
        });

        // Count total videos in the course
        const totalVideos = await prisma.video.count({
          where: {
            chapter: { courseId },
          },
        });

        // Count watched videos (100% completion) for this student in this course
        const watchedVideos = await prisma.videoProgress.count({
          where: {
            studentId: studentId,
            video: {
              chapter: { courseId },
            },
            watchedPercent: 100,
          },
        });

        // Calculate overall progress percentage
        const chapterProgress = totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0;
        const videoProgress = totalVideos > 0 ? (watchedVideos / totalVideos) * 100 : 0;
        const overallProgress = Math.round((chapterProgress + videoProgress) / 2);

        return {
          id: enrollment.course.id,
          title: enrollment.course.title,
          description: enrollment.course.description,
          durationYears: enrollment.course.durationYears,
          coverImageUrl: enrollment.course.coverImageUrl,
          progress: {
            overallProgress,
            completedChapters,
            totalChapters,
            watchedVideos,
            totalVideos,
          },
        };
      }),
    );

    logger.info('My Learning courses retrieved successfully', {
      studentId,
      totalCourses: coursesWithProgress.length,
    });

    return coursesWithProgress;
  } catch (error) {
    logger.error('Error in getStudentEnrolledCoursesForLearning', {
      studentId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get course detail with year structure for My Learning
export async function getMyLearningCourseDetail(studentId: string, courseId: string) {
  try {
    logger.info('Fetching course detail for My Learning', { studentId, courseId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Course detail fetch failed - student not found', { studentId });
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
      logger.warn('Course detail fetch failed - student not enrolled', { studentId, courseId });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        description: true,
        durationYears: true,
        coverImageUrl: true,
      },
    });

    if (!course) {
      logger.warn('Course detail fetch failed - course not found', { courseId });
      throw new AppError('Course not found', 404, ErrorTypes.NOT_FOUND);
    }

    // Get all chapters grouped by year
    const chapters = await prisma.chapter.findMany({
      where: { courseId },
      select: {
        id: true,
        title: true,
        description: true,
        courseYear: true,
        orderIndex: true,
      },
      orderBy: [{ courseYear: 'asc' }, { orderIndex: 'asc' }],
    });

    // Get all chapter progresses for this student in this course
    const chapterProgresses = await prisma.chapterProgress.findMany({
      where: {
        studentId,
        chapter: {
          courseId,
        },
      },
    });

    // Get video completion data for all chapters
    const videoCompletionData = await Promise.all(
      chapters.map(async (chapter) => {
        const totalVideos = await prisma.video.count({
          where: { chapterId: chapter.id },
        });

        const completedVideos = await prisma.videoProgress.count({
          where: {
            studentId,
            video: { chapterId: chapter.id },
            watchedPercent: 100,
          },
        });

        return {
          chapterId: chapter.id,
          totalVideos,
          completedVideos,
          allVideosCompleted: totalVideos > 0 && completedVideos === totalVideos,
        };
      }),
    );

    // Get exam completion data for all chapters
    const examCompletionData = await Promise.all(
      chapters.map(async (chapter) => {
        const exam = await prisma.exam.findUnique({
          where: { chapterId: chapter.id },
        });

        if (!exam) {
          return {
            chapterId: chapter.id,
            hasExam: false,
            examPassed: true, // No exam means it's considered passed
          };
        }

        const passedAttempt = await prisma.examAttempt.findFirst({
          where: {
            studentId,
            examId: exam.id,
            isPassed: true,
          },
        });

        return {
          chapterId: chapter.id,
          hasExam: true,
          examPassed: !!passedAttempt,
        };
      }),
    );

    // Process chapters with locking logic
    let previousChapterCompleted = true; // First chapter is always unlocked

    const processedChapters = chapters.map((chapter, index) => {
      // Find progress data for this chapter
      const chapterProgress = chapterProgresses.find((cp) => cp.chapterId === chapter.id);
      const videoData = videoCompletionData.find((vd) => vd.chapterId === chapter.id);
      const examData = examCompletionData.find((ed) => ed.chapterId === chapter.id);

      // Check if this chapter is completed
      const isChapterCompleted =
        chapterProgress?.isCompleted ||
        (videoData?.allVideosCompleted && examData?.examPassed) ||
        false;

      // Chapter is locked if previous chapter is not completed
      const isLocked = index > 0 && !previousChapterCompleted;

      let lockReason = '';
      if (isLocked) {
        const previousChapter = chapters[index - 1];
        lockReason = `Complete previous chapter '${previousChapter.title}' to unlock this chapter`;
      }

      // Update for next iteration
      previousChapterCompleted = isChapterCompleted;

      return {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        courseYear: chapter.courseYear,
        isLocked,
        ...(isLocked && { lockReason }),
        progress: {
          isCompleted: isChapterCompleted,
          completedAt: chapterProgress?.completedAt || null,
          videosCompleted: videoData?.completedVideos || 0,
          totalVideos: videoData?.totalVideos || 0,
          allVideosCompleted: videoData?.allVideosCompleted || false,
          hasExam: examData?.hasExam || false,
          examPassed: examData?.examPassed || false,
        },
      };
    });

    // Group chapters by year with locking status
    const yearStructure = [];
    for (let year = 1; year <= course.durationYears; year++) {
      const yearChapters = processedChapters.filter((chapter) => chapter.courseYear === year);

      yearStructure.push({
        year,
        totalChapters: yearChapters.length,
        unlockedChapters: yearChapters.filter((c) => !c.isLocked).length,
        completedChapters: yearChapters.filter((c) => c.progress.isCompleted).length,
        chapters: yearChapters.map((chapter) => ({
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          orderIndex: chapter.orderIndex,
          courseYear: chapter.courseYear,
          isLocked: chapter.isLocked,
          ...(chapter.isLocked && { lockReason: chapter.lockReason }),
          progress: chapter.progress,
        })),
      });
    }

    // Calculate overall course progress
    const totalChapters = chapters.length;
    const completedChapters = processedChapters.filter((c) => c.progress.isCompleted).length;
    const unlockedChapters = processedChapters.filter((c) => !c.isLocked).length;
    const overallProgress =
      totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;

    logger.info('Course detail retrieved successfully', {
      studentId,
      courseId,
      totalChapters,
      unlockedChapters,
      completedChapters,
    });

    return {
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        durationYears: course.durationYears,
        coverImageUrl: course.coverImageUrl,
      },
      progress: {
        overallProgress,
        totalChapters,
        completedChapters,
        unlockedChapters,
      },
      yearStructure,
      lockingRules: {
        description: 'Chapters unlock progressively',
        rules: [
          'First chapter is always unlocked',
          'Complete all videos and exams in a chapter to unlock the next chapter',
          'Chapters within each year follow sequential unlocking',
        ],
      },
    };
  } catch (error) {
    logger.error('Error in getMyLearningCourseDetail', {
      studentId,
      courseId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Get chapter detail with locking logic for My Learning
export async function getMyLearningChapterDetail(
  studentId: string,
  courseId: string,
  chapterId: string,
) {
  try {
    logger.info('Fetching chapter detail with locking logic', { studentId, courseId, chapterId });

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      logger.warn('Chapter detail fetch failed - student not found', { studentId });
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
      logger.warn('Chapter detail fetch failed - student not enrolled', { studentId, courseId });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Get chapter details
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        courseId: courseId,
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
          },
        },
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
    });

    if (!chapter) {
      logger.warn('Chapter detail fetch failed - chapter not found', { chapterId, courseId });
      throw new AppError('Chapter not found in this course', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if previous chapter is completed (chapter-level locking logic)
    let isChapterLocked = false;
    let chapterLockReason = '';
    let previousChapterProgress = null;

    if (chapter.orderIndex > 1) {
      // Find the previous chapter
      const previousChapter = await prisma.chapter.findFirst({
        where: {
          courseId,
          orderIndex: chapter.orderIndex - 1,
        },
      });

      if (previousChapter) {
        // Check if previous chapter is completed
        const previousChapterProgressRecord = await prisma.chapterProgress.findUnique({
          where: {
            studentId_chapterId: {
              studentId,
              chapterId: previousChapter.id,
            },
          },
        });

        // Count videos in previous chapter
        const totalVideosInPrevChapter = await prisma.video.count({
          where: { chapterId: previousChapter.id },
        });

        // Count completed videos in previous chapter
        const completedVideosInPrevChapter = await prisma.videoProgress.count({
          where: {
            studentId,
            video: { chapterId: previousChapter.id },
            watchedPercent: 100,
          },
        });

        // Check if previous chapter exam is passed (if exists)
        let prevExamPassed = true; // Default to true if no exam
        const prevExam = await prisma.exam.findUnique({
          where: { chapterId: previousChapter.id },
        });

        if (prevExam) {
          const passedAttempt = await prisma.examAttempt.findFirst({
            where: {
              studentId,
              examId: prevExam.id,
              isPassed: true,
            },
          });
          prevExamPassed = !!passedAttempt;
        }

        // Chapter is locked if previous chapter is not completed
        const prevChapterCompleted = previousChapterProgressRecord?.isCompleted || false;
        const allPrevVideosWatched =
          totalVideosInPrevChapter > 0 && completedVideosInPrevChapter === totalVideosInPrevChapter;

        if (!prevChapterCompleted || !allPrevVideosWatched || !prevExamPassed) {
          isChapterLocked = true;
          chapterLockReason = `Complete previous chapter '${previousChapter.title}' to unlock this chapter`;

          previousChapterProgress = {
            id: previousChapter.id,
            title: previousChapter.title,
            progress: {
              videosCompleted: completedVideosInPrevChapter,
              totalVideos: totalVideosInPrevChapter,
              examPassed: prevExamPassed,
            },
          };
        }
      }
    }

    // If chapter is locked, return locked response
    if (isChapterLocked) {
      return {
        chapter: {
          id: chapter.id,
          title: chapter.title,
          description: chapter.description,
          orderIndex: chapter.orderIndex,
          courseYear: chapter.courseYear,
          isLocked: true,
          lockReason: chapterLockReason,
        },
        course: {
          id: chapter.course.id,
          title: chapter.course.title,
        },
        videos: null,
        exam: null,
        prerequisites: {
          previousChapterCompleted: false,
          canAccess: false,
          requiredChapter: previousChapterProgress,
        },
      };
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

    // Process videos with progressive locking within chapter
    let previousVideoCompleted = true; // First video is always unlocked
    const processedVideos = chapter.videos.map((video, index) => {
      // Find progress for this video
      const videoProgress = videoProgresses.find((vp) => vp.videoId === video.id);
      const watchedPercent = videoProgress?.watchedPercent || 0;
      const isCompleted = watchedPercent === 100;

      // Video is locked if it's not the first video AND previous video is not completed
      const isVideoLocked = index > 0 && !previousVideoCompleted;

      // Prepare video response
      const videoResponse = {
        id: video.id,
        title: video.title,
        description: video.description,
        duration: video.duration,
        orderIndex: video.orderIndex,
        backblazeUrl: isVideoLocked ? null : video.backblazeUrl, // Hide URL if locked
        isLocked: isVideoLocked,
        ...(isVideoLocked && {
          lockReason: `Complete previous video '${chapter.videos[index - 1]?.title}' to unlock`,
        }),
        progress: {
          watchedPercent,
          isCompleted,
        },
      };

      // Update previousVideoCompleted for next iteration
      if (isCompleted) {
        previousVideoCompleted = true;
      } else if (index === 0 || !isVideoLocked) {
        // If this is the first video or it's unlocked but not completed
        previousVideoCompleted = false;
      }

      return videoResponse;
    });

    // Check if all videos are completed (for exam unlocking)
    const totalVideos = chapter.videos.length;
    const completedVideos = processedVideos.filter((v) => v.progress.isCompleted).length;
    const allVideosCompleted = totalVideos > 0 && completedVideos === totalVideos;

    // Process exam with locking logic
    let examResponse = null;
    if (chapter.exam) {
      const isExamLocked = !allVideosCompleted;

      examResponse = {
        id: chapter.exam.id,
        title: chapter.exam.title,
        description: chapter.exam.description,
        passingScore: chapter.exam.passingScore,
        timeLimit: chapter.exam.timeLimit,
        isLocked: isExamLocked,
        ...(isExamLocked && {
          lockReason: 'Complete all videos in this chapter to unlock exam',
        }),
      };
    }

    // Format final response
    const responseData = {
      chapter: {
        id: chapter.id,
        title: chapter.title,
        description: chapter.description,
        orderIndex: chapter.orderIndex,
        courseYear: chapter.courseYear,
        isLocked: false,
      },
      course: {
        id: chapter.course.id,
        title: chapter.course.title,
      },
      videos: processedVideos,
      exam: examResponse,
      progress: {
        videosCompleted: completedVideos,
        totalVideos,
        allVideosCompleted,
        canTakeExam: allVideosCompleted,
      },
      prerequisites: {
        previousChapterCompleted: true,
        canAccess: true,
      },
    };

    logger.info('Chapter detail retrieved successfully', {
      studentId,
      courseId,
      chapterId,
      isChapterLocked: false,
      completedVideos,
      totalVideos,
    });

    return responseData;
  } catch (error) {
    logger.error('Error in getMyLearningChapterDetail', {
      studentId,
      courseId,
      chapterId,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Update video progress based on heartbeat for automatic tracking
export async function updateVideoProgressHeartbeat(
  studentId: string,
  courseId: string,
  chapterId: string,
  videoId: string,
  watchedPercent: number,
  currentTime: number,
) {
  try {
    logger.info('Processing video heartbeat', {
      studentId,
      courseId,
      chapterId,
      videoId,
      watchedPercent,
      currentTime,
    });

    // Check if student is enrolled in this course
    const enrollment = await prisma.courseEnrollment.findFirst({
      where: {
        studentId,
        courseId,
        isActive: true,
      },
    });

    if (!enrollment) {
      logger.warn('Video heartbeat failed - student not enrolled', { studentId, courseId });
      throw new AppError('You are not enrolled in this course', 403, ErrorTypes.AUTHORIZATION);
    }

    // Verify video exists in the specified chapter and course
    const video = await prisma.video.findFirst({
      where: {
        id: videoId,
        chapterId,
        chapter: {
          courseId,
        },
      },
      include: {
        chapter: {
          include: {
            videos: {
              orderBy: {
                orderIndex: 'asc',
              },
            },
          },
        },
      },
    });

    if (!video) {
      logger.warn('Video heartbeat failed - video not found', { videoId, chapterId, courseId });
      throw new AppError('Video not found in this chapter', 404, ErrorTypes.NOT_FOUND);
    }

    // Check if this video should be accessible (previous video completed)
    if (video.orderIndex > 1) {
      const previousVideo = video.chapter.videos.find((v) => v.orderIndex === video.orderIndex - 1);
      if (previousVideo) {
        const previousVideoProgress = await prisma.videoProgress.findUnique({
          where: {
            studentId_videoId: {
              studentId,
              videoId: previousVideo.id,
            },
          },
        });

        if (!previousVideoProgress || previousVideoProgress.watchedPercent < 100) {
          logger.warn('Video heartbeat failed - previous video not completed', {
            studentId,
            videoId,
            previousVideoId: previousVideo.id,
          });
          throw new AppError(
            'Complete previous video to access this content',
            403,
            ErrorTypes.AUTHORIZATION,
          );
        }
      }
    }

    // Get current progress or create new record
    const existingProgress = await prisma.videoProgress.findUnique({
      where: {
        studentId_videoId: {
          studentId,
          videoId,
        },
      },
    });

    let updatedProgress;
    let wasJustCompleted = false;
    let shouldUpdateUI = false;

    if (existingProgress) {
      // Only update if new progress is higher
      if (watchedPercent > existingProgress.watchedPercent) {
        updatedProgress = await prisma.videoProgress.update({
          where: {
            id: existingProgress.id,
          },
          data: {
            watchedPercent,
            lastWatchedAt: new Date(),
          },
        });

        // Check if video was just completed (crossed 100% threshold)
        wasJustCompleted = existingProgress.watchedPercent < 100 && watchedPercent === 100;

        // Check if we should trigger UI update (milestone progress)
        const previousMilestone = Math.floor(existingProgress.watchedPercent / 25) * 25;
        const currentMilestone = Math.floor(watchedPercent / 25) * 25;
        shouldUpdateUI = previousMilestone !== currentMilestone || wasJustCompleted;
      } else {
        // Just update timestamp without changing progress
        updatedProgress = await prisma.videoProgress.update({
          where: {
            id: existingProgress.id,
          },
          data: {
            lastWatchedAt: new Date(),
          },
        });
        updatedProgress.watchedPercent = existingProgress.watchedPercent; // Keep existing progress
      }
    } else {
      // Create new progress record
      updatedProgress = await prisma.videoProgress.create({
        data: {
          studentId,
          videoId,
          watchedPercent,
          lastWatchedAt: new Date(),
        },
      });

      wasJustCompleted = watchedPercent === 100;
      shouldUpdateUI = true; // First time watching, always update UI
    }

    // Check if next video should be unlocked
    let nextVideoUnlocked = false;
    let nextVideoInfo = null;

    if (wasJustCompleted) {
      const nextVideo = video.chapter.videos.find((v) => v.orderIndex === video.orderIndex + 1);
      if (nextVideo) {
        nextVideoUnlocked = true;
        nextVideoInfo = {
          id: nextVideo.id,
          title: nextVideo.title,
          orderIndex: nextVideo.orderIndex,
        };
      }
    }

    // Check chapter progress and exam unlock status
    const totalVideosInChapter = video.chapter.videos.length;
    const completedVideosInChapter = await prisma.videoProgress.count({
      where: {
        studentId,
        video: {
          chapterId,
        },
        watchedPercent: 100,
      },
    });

    const allVideosCompleted = completedVideosInChapter === totalVideosInChapter;
    let examUnlocked = false;

    // If all videos are completed, check if exam should be unlocked
    if (allVideosCompleted) {
      const exam = await prisma.exam.findUnique({
        where: { chapterId },
      });

      if (exam) {
        examUnlocked = true;
      }

      // Update chapter progress if all videos are completed
      await prisma.chapterProgress.upsert({
        where: {
          studentId_chapterId: {
            studentId,
            chapterId,
          },
        },
        update: {
          isCompleted: allVideosCompleted,
          completedAt: allVideosCompleted ? new Date() : null,
          lastVideoWatched: video.orderIndex,
        },
        create: {
          studentId,
          chapterId,
          isCompleted: allVideosCompleted,
          completedAt: allVideosCompleted ? new Date() : null,
          lastVideoWatched: video.orderIndex,
        },
      });
    }

    const result = {
      videoId,
      watchedPercent: updatedProgress.watchedPercent,
      isCompleted: updatedProgress.watchedPercent === 100,
      nextVideoUnlocked,
      ...(nextVideoInfo && { nextVideo: nextVideoInfo }),
      chapterProgress: {
        videosCompleted: completedVideosInChapter,
        totalVideos: totalVideosInChapter,
        allVideosCompleted,
        examUnlocked,
      },
      shouldUpdateUI,
      milestones: {
        justCompleted: wasJustCompleted,
        chapterCompleted: allVideosCompleted && wasJustCompleted,
      },
    };

    logger.info('Video heartbeat processed successfully', {
      studentId,
      videoId,
      watchedPercent: updatedProgress.watchedPercent,
      wasJustCompleted,
      nextVideoUnlocked,
      examUnlocked,
    });

    return result;
  } catch (error) {
    logger.error('Error in updateVideoProgressHeartbeat', {
      studentId,
      courseId,
      chapterId,
      videoId,
      watchedPercent,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}
