import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchCourses,
  fetchPreviewCourseById,
  clearCurrentCourse,
} from "@/redux/features/publicCourses/publicCourses";

export const useCourses = () => {
  const dispatch = useAppDispatch();
  const { courses, currentCourse, status, error } = useAppSelector(
    (state) => state.publicCourses
  );

  const loadCourses = () => {
    dispatch(fetchCourses());
  };

  const loadCourseDetails = (courseId: string) => {
    dispatch(fetchPreviewCourseById(courseId));
  };

  const clearCourse = () => {
    dispatch(clearCurrentCourse());
  };

  return {
    courses,
    currentCourse,
    status,
    error,
    loadCourses,
    loadCourseDetails,
    clearCourse,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook specifically for course details page
export const useCourseDetails = (courseId: string) => {
  const dispatch = useAppDispatch();
  const { currentCourse, status, error } = useAppSelector(
    (state) => state.publicCourses
  );

  useEffect(() => {
    if (courseId) {
      dispatch(fetchPreviewCourseById(courseId));
    }

    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, courseId]);

  return {
    course: currentCourse,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
