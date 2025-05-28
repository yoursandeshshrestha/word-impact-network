import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchCoursePreview,
  clearCoursePreview,
} from "@/redux/features/courses/coursePreview";

export const useCoursePreview = () => {
  const dispatch = useAppDispatch();
  const { coursePreview, status, error } = useAppSelector(
    (state) => state.coursePreview
  );

  const loadCoursePreview = (courseId: string) => {
    dispatch(fetchCoursePreview(courseId));
  };

  const clearPreview = () => {
    dispatch(clearCoursePreview());
  };

  return {
    coursePreview,
    status,
    error,
    loadCoursePreview,
    clearPreview,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches course preview on mount
export const useAutoCoursePreview = (courseId: string) => {
  const dispatch = useAppDispatch();
  const { coursePreview, status, error } = useAppSelector(
    (state) => state.coursePreview
  );

  useEffect(() => {
    if (courseId) {
      dispatch(fetchCoursePreview(courseId));
    }

    return () => {
      dispatch(clearCoursePreview());
    };
  }, [dispatch, courseId]);

  return {
    coursePreview,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
