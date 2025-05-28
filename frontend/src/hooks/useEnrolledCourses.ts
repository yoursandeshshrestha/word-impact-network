import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchEnrolledCourses,
  clearEnrolledCourses,
} from "@/redux/features/enrolledCourses/enrolledCourses";

export const useEnrolledCourses = () => {
  const dispatch = useAppDispatch();
  const {
    enrolledCourses,
    recommendedCourses,
    enrolledCount,
    recommendedCount,
    status,
    error,
  } = useAppSelector((state) => state.enrolledCourses);

  const loadEnrolledCourses = () => {
    dispatch(fetchEnrolledCourses());
  };

  const clearCourses = () => {
    dispatch(clearEnrolledCourses());
  };

  return {
    enrolledCourses,
    recommendedCourses,
    enrolledCount,
    recommendedCount,
    status,
    error,
    loadEnrolledCourses,
    clearCourses,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches enrolled courses on mount
export const useAutoEnrolledCourses = () => {
  const dispatch = useAppDispatch();
  const {
    enrolledCourses,
    recommendedCourses,
    enrolledCount,
    recommendedCount,
    status,
    error,
  } = useAppSelector((state) => state.enrolledCourses);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());

    return () => {
      dispatch(clearEnrolledCourses());
    };
  }, [dispatch]);

  return {
    enrolledCourses,
    recommendedCourses,
    enrolledCount,
    recommendedCount,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
