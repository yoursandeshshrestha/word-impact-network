import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchChapterDetail,
  clearChapterDetail,
} from "@/redux/features/chapterDetail/chapterDetailSlice";

export const useChapterDetail = () => {
  const dispatch = useAppDispatch();
  const { chapterDetail, status, error } = useAppSelector(
    (state) => state.chapterDetail
  );

  const loadChapterDetail = (courseId: string, chapterId: string) => {
    dispatch(fetchChapterDetail({ courseId, chapterId }));
  };

  const clearDetail = () => {
    dispatch(clearChapterDetail());
  };

  return {
    chapterDetail,
    status,
    error,
    loadChapterDetail,
    clearDetail,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches chapter detail on mount
export const useAutoChapterDetail = (courseId: string, chapterId: string) => {
  const dispatch = useAppDispatch();
  const { chapterDetail, status, error } = useAppSelector(
    (state) => state.chapterDetail
  );

  useEffect(() => {
    if (courseId && chapterId) {
      dispatch(fetchChapterDetail({ courseId, chapterId }));
    }

    return () => {
      dispatch(clearChapterDetail());
    };
  }, [dispatch, courseId, chapterId]);

  const refreshChapterDetail = () => {
    if (courseId && chapterId) {
      dispatch(fetchChapterDetail({ courseId, chapterId }));
    }
  };

  return {
    chapterDetail,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
    error,
    refreshChapterDetail,
  };
};
