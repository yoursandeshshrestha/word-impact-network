import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { AppDispatch, RootState } from "@/redux/store";
import {
  fetchActiveAnnouncements,
  clearError,
  selectAnnouncements,
  selectAnnouncementsLoading,
  selectAnnouncementsError,
  selectShouldFetchAnnouncements,
} from "@/redux/features/announcements/announcementsSlice";
import { isAuthenticated } from "@/common/services/auth";

export const useAnnouncements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const announcements = useSelector(selectAnnouncements) || [];
  const loading = useSelector(selectAnnouncementsLoading);
  const error = useSelector(selectAnnouncementsError);
  const shouldFetch = useSelector(selectShouldFetchAnnouncements);
  const user = useSelector((state: RootState) => state.user.user);

  const loadAnnouncements = useCallback(() => {
    // Only fetch if user is authenticated and we should fetch
    if (isAuthenticated() && user && shouldFetch) {
      dispatch(fetchActiveAnnouncements());
    }
  }, [dispatch, shouldFetch, user]);

  const clearErrorMessage = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    announcements,
    loading,
    error,
    loadAnnouncements,
    clearErrorMessage,
  };
};
