import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchMyLearningCourses,
  clearMyLearning,
} from "@/redux/features/myLearningSlice/myLearningSlice";

export const useMyLearning = () => {
  const dispatch = useAppDispatch();
  const { courses, status, error } = useAppSelector(
    (state) => state.myLearning
  );

  const loadMyLearningCourses = () => {
    dispatch(fetchMyLearningCourses());
  };

  const clearCourses = () => {
    dispatch(clearMyLearning());
  };

  return {
    courses,
    status,
    error,
    loadMyLearningCourses,
    clearCourses,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches my learning courses on mount
export const useAutoMyLearning = () => {
  const dispatch = useAppDispatch();
  const { courses, status, error } = useAppSelector(
    (state) => state.myLearning
  );

  useEffect(() => {
    dispatch(fetchMyLearningCourses());

    return () => {
      dispatch(clearMyLearning());
    };
  }, [dispatch]);

  return {
    courses,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
    error,
  };
};
