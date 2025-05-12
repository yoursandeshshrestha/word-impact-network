import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import {
  fetchAdminProfile,
  requestPasswordReset,
  verifyPasswordReset,
  clearError,
  clearPasswordResetStatus,
  selectAdminProfile,
  selectIsLoading,
  selectError,
  selectPasswordResetStatus,
  selectPasswordResetMessage,
  selectPasswordVerificationNeeded,
  selectResetId,
  PasswordReset,
  PasswordResetVerification,
} from "@/redux/features/adminProfileSlice";

/**
 * Custom hook for admin profile management
 */
export const useAdminProfile = () => {
  const dispatch = useAppDispatch();
  const profile = useAppSelector(selectAdminProfile);
  const isLoading = useAppSelector(selectIsLoading);
  const error = useAppSelector(selectError);
  const passwordResetStatus = useAppSelector(selectPasswordResetStatus);
  const passwordResetMessage = useAppSelector(selectPasswordResetMessage);
  const passwordVerificationNeeded = useAppSelector(
    selectPasswordVerificationNeeded
  );
  const resetId = useAppSelector(selectResetId);

  // Load admin profile
  const loadProfile = useCallback(() => {
    return dispatch(fetchAdminProfile());
  }, [dispatch]);

  // Initial load on mount
  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, [profile, loadProfile]);

  // Request password reset
  const changePassword = useCallback(
    (passwordData: PasswordReset) => {
      return dispatch(requestPasswordReset(passwordData));
    },
    [dispatch]
  );

  // Verify password reset
  const verifyPassword = useCallback(
    (verificationData: PasswordResetVerification) => {
      return dispatch(verifyPasswordReset(verificationData));
    },
    [dispatch]
  );

  // Clear error
  const resetError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Clear password reset status
  const resetPasswordStatus = useCallback(() => {
    dispatch(clearPasswordResetStatus());
  }, [dispatch]);

  return {
    // State
    profile,
    isLoading,
    error,
    passwordResetStatus,
    passwordResetMessage,
    passwordVerificationNeeded,
    resetId,

    // Actions
    loadProfile,
    changePassword,
    verifyPassword,
    resetError,
    resetPasswordStatus,
  };
};
