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

  // Initial load on mount
  useEffect(() => {
    // If data hasn't been fetched before or it's been more than 5 minutes since last fetch
    if (!dashboardData || !lastFetched || isDataStale(lastFetched)) {
      loadDashboardData();
    }
  }, [dashboardData, lastFetched, loadDashboardData]);

  // Helper to determine if data is stale (more than 5 minutes old)
  const isDataStale = (lastFetchedTime: string) => {
    const now = new Date();
    const lastFetch = new Date(lastFetchedTime);
    // Check if data is older than 5 minutes (300000 milliseconds)
    return now.getTime() - lastFetch.getTime() > 300000;
  };

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearDashboardError());
  }, [dispatch]);

  // Refresh data on demand
  const refreshDashboard = useCallback(() => {
    return loadDashboardData();
  }, [loadDashboardData]);

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
