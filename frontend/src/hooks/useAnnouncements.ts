import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchActiveAnnouncements,
  clearError,
  selectAnnouncements,
  selectAnnouncementsLoading,
  selectAnnouncementsError,
} from "@/redux/features/announcements/announcementsSlice";

export const useAnnouncements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const announcements = useSelector(selectAnnouncements);
  const loading = useSelector(selectAnnouncementsLoading);
  const error = useSelector(selectAnnouncementsError);

  const loadAnnouncements = () => {
    dispatch(fetchActiveAnnouncements());
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  useEffect(() => {
    // Load announcements when the hook is first used
    loadAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    announcements,
    loading,
    error,
    loadAnnouncements,
    clearErrorMessage,
  };
};
