import { useCallback, useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchStudents,
  setSelectedStudent,
  setSearchQuery,
  setPage,
  setLimit,
  selectStudents,
  selectSelectedStudent,
  selectIsLoading,
  selectError,
  selectSearchQuery,
  selectPagination,
  Student,
} from "@/redux/features/studentsSlice";

/**
 * Custom hook for students management with debounced search and pagination
 */
export const useStudents = () => {
  const dispatch = useAppDispatch();
  const students = useAppSelector(selectStudents);
  const selectedStudent = useAppSelector(selectSelectedStudent);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const searchQuery = useAppSelector(selectSearchQuery);
  const pagination = useAppSelector(selectPagination);

  // Local state for debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchQuery);

  // Update the debounced value after delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchQuery);
    }, 500); // 500ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch students when debounced search term or pagination changes
  useEffect(() => {
    dispatch(
      fetchStudents({
        search: debouncedSearchTerm,
        page: pagination.currentPage,
        limit: pagination.limit,
      })
    );
  }, [debouncedSearchTerm, pagination.currentPage, pagination.limit, dispatch]);

  // Fetch all students
  const loadStudents = useCallback(() => {
    dispatch(fetchStudents({ search: "" }));
  }, [dispatch]);

  // Update search query
  const updateSearchQuery = useCallback(
    (query: string) => {
      dispatch(setSearchQuery(query));
      // Reset page to 1 when searching
      dispatch(setPage(1));
    },
    [dispatch]
  );

  // Select student
  const selectStudent = useCallback(
    (student: Student | null) => {
      dispatch(setSelectedStudent(student));
    },
    [dispatch]
  );

  // Change page
  const changePage = useCallback(
    (page: number) => {
      dispatch(setPage(page));
    },
    [dispatch]
  );

  // Change items per page limit
  const changeLimit = useCallback(
    (limit: number) => {
      dispatch(setLimit(limit));
      // Reset to page 1 when changing limit
      dispatch(setPage(1));
    },
    [dispatch]
  );

  return {
    // State
    students,
    selectedStudent,
    isLoading,
    error,
    searchQuery,
    pagination,

    // Actions
    loadStudents,
    updateSearchQuery,
    selectStudent,
    changePage,
    changeLimit,
  };
};
