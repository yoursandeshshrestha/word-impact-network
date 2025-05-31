import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchCourseDetail,
  clearCourseDetail,
  updateChapterProgress,
  ChapterProgress,
  Chapter,
  YearStructure,
  CourseDetailData,
} from "@/redux/features/courseDetail/courseDetailSlice";

export const useCourseDetail = () => {
  const dispatch = useAppDispatch();
  const { courseDetail, status, error } = useAppSelector(
    (state) => state.courseDetail
  );

  const loadCourseDetail = (courseId: string) => {
    dispatch(fetchCourseDetail(courseId));
  };

  const updateProgress = (chapterId: string, progress: ChapterProgress) => {
    dispatch(updateChapterProgress({ chapterId, progress }));
  };

  const clearDetail = () => {
    dispatch(clearCourseDetail());
  };

  return {
    courseDetail,
    status,
    error,
    loadCourseDetail,
    updateProgress,
    clearDetail,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches course detail on mount
export const useAutoCourseDetail = (courseId: string) => {
  const dispatch = useAppDispatch();
  const { courseDetail, status, error } = useAppSelector(
    (state) => state.courseDetail
  );

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCourseDetail(courseId));
    }

    return () => {
      dispatch(clearCourseDetail());
    };
  }, [dispatch, courseId]);

  const updateProgress = (chapterId: string, progress: ChapterProgress) => {
    dispatch(updateChapterProgress({ chapterId, progress }));
  };

  return {
    courseDetail,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
    error,
    updateProgress,
  };
};

// Hook for chapter access control
export const useChapterAccess = (chapters: Chapter[]) => {
  const getAccessibleChapters = () => {
    return chapters.filter((chapter) => !chapter.isLocked);
  };

  const getLockedChapters = () => {
    return chapters.filter((chapter) => chapter.isLocked);
  };

  const canAccessChapter = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    return chapter ? !chapter.isLocked : false;
  };

  const getChapterStatus = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    if (!chapter) return "not-found";
    if (chapter.isLocked) return "locked";
    if (chapter.progress.isCompleted) return "completed";
    if (chapter.progress.videosCompleted > 0) return "in-progress";
    return "not-started";
  };

  const getChapterProgress = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    return chapter?.progress || null;
  };

  const getLockReason = (chapterId: string) => {
    const chapter = chapters.find((ch) => ch.id === chapterId);
    return chapter?.lockReason || null;
  };

  const getNextUnlockedChapter = () => {
    return chapters.find(
      (chapter) => !chapter.isLocked && !chapter.progress.isCompleted
    );
  };

  const getCompletionPercentage = () => {
    if (chapters.length === 0) return 0;
    const completedCount = chapters.filter(
      (ch) => ch.progress.isCompleted
    ).length;
    return Math.round((completedCount / chapters.length) * 100);
  };

  return {
    getAccessibleChapters,
    getLockedChapters,
    canAccessChapter,
    getChapterStatus,
    getChapterProgress,
    getLockReason,
    getNextUnlockedChapter,
    getCompletionPercentage,
  };
};

// Hook for year-based chapter management
export const useYearProgress = (yearStructure: YearStructure[]) => {
  const getYearProgress = (year: number) => {
    const yearData = yearStructure.find((y) => y.year === year);
    if (!yearData) return null;

    return {
      totalChapters: yearData.totalChapters,
      unlockedChapters: yearData.unlockedChapters,
      completedChapters: yearData.completedChapters,
      progressPercentage: Math.round(
        (yearData.completedChapters / yearData.totalChapters) * 100
      ),
      isYearCompleted: yearData.completedChapters === yearData.totalChapters,
      hasLockedChapters: yearData.unlockedChapters < yearData.totalChapters,
    };
  };

  const getAllYearsProgress = () => {
    return yearStructure.map((year) => ({
      year: year.year,
      ...getYearProgress(year.year),
      chapters: year.chapters,
    }));
  };

  const getOverallProgress = () => {
    const totalChapters = yearStructure.reduce(
      (sum, year) => sum + year.totalChapters,
      0
    );
    const completedChapters = yearStructure.reduce(
      (sum, year) => sum + year.completedChapters,
      0
    );
    const unlockedChapters = yearStructure.reduce(
      (sum, year) => sum + year.unlockedChapters,
      0
    );

    return {
      totalChapters,
      completedChapters,
      unlockedChapters,
      progressPercentage:
        totalChapters > 0
          ? Math.round((completedChapters / totalChapters) * 100)
          : 0,
      isFullyCompleted: completedChapters === totalChapters,
      hasLockedContent: unlockedChapters < totalChapters,
    };
  };

  const getNextAvailableChapter = () => {
    for (const year of yearStructure) {
      const nextChapter = year.chapters.find(
        (ch) => !ch.isLocked && !ch.progress.isCompleted
      );
      if (nextChapter) {
        return {
          chapter: nextChapter,
          year: year.year,
        };
      }
    }
    return null;
  };

  return {
    getYearProgress,
    getAllYearsProgress,
    getOverallProgress,
    getNextAvailableChapter,
  };
};

// Hook for course navigation
export const useCourseNavigation = (courseDetail: CourseDetailData) => {
  const getAllChapters = () => {
    if (!courseDetail?.yearStructure) return [];

    return courseDetail.yearStructure.flatMap((year: YearStructure) =>
      year.chapters.map((chapter: Chapter) => ({
        ...chapter,
        year: year.year,
      }))
    );
  };

  const getChapterByIndex = (globalIndex: number) => {
    const allChapters = getAllChapters();
    return allChapters[globalIndex] || null;
  };

  const getChapterGlobalIndex = (chapterId: string) => {
    const allChapters = getAllChapters();
    return allChapters.findIndex((ch) => ch.id === chapterId);
  };

  const getNextChapter = (currentChapterId: string) => {
    const allChapters = getAllChapters();
    const currentIndex = allChapters.findIndex(
      (ch) => ch.id === currentChapterId
    );

    if (currentIndex !== -1 && currentIndex < allChapters.length - 1) {
      return allChapters[currentIndex + 1];
    }
    return null;
  };

  const getPreviousChapter = (currentChapterId: string) => {
    const allChapters = getAllChapters();
    const currentIndex = allChapters.findIndex(
      (ch) => ch.id === currentChapterId
    );

    if (currentIndex > 0) {
      return allChapters[currentIndex - 1];
    }
    return null;
  };

  const getContinueFromHere = () => {
    const allChapters = getAllChapters();

    // Find first incomplete, unlocked chapter
    return (
      allChapters.find((ch) => !ch.isLocked && !ch.progress.isCompleted) || null
    );
  };

  return {
    getAllChapters,
    getChapterByIndex,
    getChapterGlobalIndex,
    getNextChapter,
    getPreviousChapter,
    getContinueFromHere,
  };
};
