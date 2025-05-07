import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchApplications,
  fetchApplicationById,
  updateApplicationStatus,
  deleteApplication,
  setSelectedApplication,
  selectApplications,
  selectPagination,
  selectSelectedApplication,
  selectIsLoading,
  selectError,
  clearError,
  Application,
} from "@/src/redux/features/applicationsSlice";

/**
 * Custom hook for applications management
 * Encapsulates all applications-related Redux actions and state
 */
export const useApplications = () => {
  const dispatch = useAppDispatch();
  const applications = useAppSelector(selectApplications);
  const pagination = useAppSelector(selectPagination);
  const selectedApplication = useAppSelector(selectSelectedApplication);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Fetch all applications with pagination
  const loadApplications = useCallback(
    (page: number = 1) => {
      return dispatch(fetchApplications(page));
    },
    [dispatch]
  );

  // Fetch a single application by ID
  const loadApplicationById = useCallback(
    (id: string) => {
      return dispatch(fetchApplicationById(id));
    },
    [dispatch]
  );

  // Update application status
  const updateStatus = useCallback(
    (params: {
      id: string;
      status: "APPROVED" | "REJECTED" | "PENDING";
      rejectionReason?: string;
    }) => {
      return dispatch(updateApplicationStatus(params));
    },
    [dispatch]
  );

  // Delete an application
  const removeApplication = useCallback(
    (id: string) => {
      return dispatch(deleteApplication(id));
    },
    [dispatch]
  );

  // Set selected application
  const selectApplication = useCallback(
    (application: Application | null) => {
      dispatch(setSelectedApplication(application));
    },
    [dispatch]
  );

  // Clear any errors
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    // State
    applications,
    pagination,
    selectedApplication,
    isLoading,
    error,

    // Actions
    loadApplications,
    loadApplicationById,
    updateStatus,
    removeApplication,
    selectApplication,
    resetError,
  };
};
