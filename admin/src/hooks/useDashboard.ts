import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchDashboardStats,
  clearDashboardError,
  selectDashboardData,
  selectDashboardIsLoading,
  selectDashboardError,
  selectDashboardLastFetched,
} from "@/redux/features/dashboardSlice";

/**
 * Custom hook for dashboard management
 */
export const useDashboard = () => {
  const dispatch = useAppDispatch();
  const dashboardData = useAppSelector(selectDashboardData);
  const isLoading = useAppSelector(selectDashboardIsLoading);
  const error = useAppSelector(selectDashboardError);
  const lastFetched = useAppSelector(selectDashboardLastFetched);

  // Load dashboard data
  const loadDashboardData = useCallback(() => {
    return dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Load dashboard data on mount
  useEffect(() => {
    // Only fetch if data hasn't been fetched before AND no data exists
    if (!lastFetched && !dashboardData) {
      dispatch(fetchDashboardStats());
    }
  }, [lastFetched, dashboardData, dispatch]);

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearDashboardError());
  }, [dispatch]);

  // Refresh data on demand
  const refreshDashboard = useCallback(() => {
    return dispatch(fetchDashboardStats());
  }, [dispatch]);

  return {
    // State
    dashboardData,
    isLoading,
    error,
    lastFetched,

    // Actions
    loadDashboardData,
    resetError,
    refreshDashboard,
  };
};
