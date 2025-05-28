import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchCourses,
  fetchPreviewCourseById,
  clearCurrentCourse,
  enrollInCourse,
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

  const handleEnroll = (courseId: string) => {
    dispatch(enrollInCourse(courseId));
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
    enrollInCourse: handleEnroll,
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

  const handleEnroll = (courseId: string) => {
    dispatch(enrollInCourse(courseId));
  };

  return {
    course: currentCourse,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
    enrollInCourse: handleEnroll,
  };
};
