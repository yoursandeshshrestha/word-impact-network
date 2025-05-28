import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useReduxHooks";
import {
  fetchAllCourses,
  setSearchQuery,
  setSelectedDuration,
  clearFilters,
} from "@/redux/features/courses/courses";

export const useCourses = () => {
  const dispatch = useAppDispatch();
  const {
    courses,
    filteredCourses,
    searchQuery,
    selectedDuration,
    status,
    error,
  } = useAppSelector((state) => state.courses);

  const loadCourses = () => {
    dispatch(fetchAllCourses());
  };

  const updateSearchQuery = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const updateSelectedDuration = (duration: string) => {
    dispatch(setSelectedDuration(duration));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  return {
    courses,
    filteredCourses,
    searchQuery,
    selectedDuration,
    status,
    error,
    loadCourses,
    updateSearchQuery,
    updateSelectedDuration,
    resetFilters,
    isLoading: status === "loading",
    isError: status === "failed",
    isSuccess: status === "succeeded",
  };
};

// Hook that automatically fetches courses on mount
export const useAutoCourses = () => {
  const dispatch = useAppDispatch();
  const {
    courses,
    filteredCourses,
    searchQuery,
    selectedDuration,
    status,
    error,
  } = useAppSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const updateSearchQuery = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const updateSelectedDuration = (duration: string) => {
    dispatch(setSelectedDuration(duration));
  };

  const resetFilters = () => {
    dispatch(clearFilters());
  };

  return {
    courses,
    filteredCourses,
    searchQuery,
    selectedDuration,
    updateSearchQuery,
    updateSelectedDuration,
    resetFilters,
    isLoading: status === "loading",
    isError: status === "failed",
    error,
  };
};
