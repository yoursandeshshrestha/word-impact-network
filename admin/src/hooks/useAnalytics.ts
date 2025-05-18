import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchAnalyticsDashboard,
  fetchEnrollmentTrends,
  fetchCourseCompletionRates,
  fetchVideoEngagement,
  fetchExamPerformance,
  fetchStudentProgress,
  fetchGeographicDistribution,
  fetchReferralStats,
  clearError,
  resetAnalytics,
  selectDashboard,
  selectEnrollmentTrends,
  selectCourseCompletionRates,
  selectVideoEngagementMetrics,
  selectExamPerformanceMetrics,
  selectStudentProgressData,
  selectGeographicDistribution,
  selectReferralStats,
  selectIsLoading,
  selectError,
} from "@/redux/features/analyticsSlice";

/**
 * Custom hook for analytics data management
 */
export const useAnalytics = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const dashboard = useAppSelector(selectDashboard);
  const enrollmentTrends = useAppSelector(selectEnrollmentTrends);
  const courseCompletionRates = useAppSelector(selectCourseCompletionRates);
  const videoEngagementMetrics = useAppSelector(selectVideoEngagementMetrics);
  const examPerformanceMetrics = useAppSelector(selectExamPerformanceMetrics);
  const studentProgressData = useAppSelector(selectStudentProgressData);
  const geographicDistribution = useAppSelector(selectGeographicDistribution);
  const referralStats = useAppSelector(selectReferralStats);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);

  // Load comprehensive dashboard data
  const loadDashboard = useCallback(() => {
    return dispatch(fetchAnalyticsDashboard());
  }, [dispatch]);

  // Load enrollment trends with period filter
  const loadEnrollmentTrends = useCallback(
    (period: "week" | "month" | "year" = "month") => {
      return dispatch(fetchEnrollmentTrends(period));
    },
    [dispatch]
  );

  // Load course completion rates
  const loadCourseCompletionRates = useCallback(() => {
    return dispatch(fetchCourseCompletionRates());
  }, [dispatch]);

  // Load video engagement metrics
  const loadVideoEngagement = useCallback(
    (limit: number = 10) => {
      return dispatch(fetchVideoEngagement(limit));
    },
    [dispatch]
  );

  // Load exam performance metrics
  const loadExamPerformance = useCallback(() => {
    return dispatch(fetchExamPerformance());
  }, [dispatch]);

  // Load student progress data
  const loadStudentProgress = useCallback(
    (limit: number = 10) => {
      return dispatch(fetchStudentProgress(limit));
    },
    [dispatch]
  );

  // Load geographic distribution
  const loadGeographicDistribution = useCallback(() => {
    return dispatch(fetchGeographicDistribution());
  }, [dispatch]);

  // Load referral stats
  const loadReferralStats = useCallback(() => {
    return dispatch(fetchReferralStats());
  }, [dispatch]);

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear all analytics data
  const clearAnalytics = useCallback(() => {
    dispatch(resetAnalytics());
  }, [dispatch]);

  return {
    // State
    dashboard,
    enrollmentTrends,
    courseCompletionRates,
    videoEngagementMetrics,
    examPerformanceMetrics,
    studentProgressData,
    geographicDistribution,
    referralStats,
    isLoading,
    error,

    // Actions
    loadDashboard,
    loadEnrollmentTrends,
    loadCourseCompletionRates,
    loadVideoEngagement,
    loadExamPerformance,
    loadStudentProgress,
    loadGeographicDistribution,
    loadReferralStats,
    resetError,
    clearAnalytics,
  };
};
