import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  clearError,
  setCurrentAnnouncement,
  selectAnnouncements,
  selectAnnouncementsLoading,
  selectAnnouncementsError,
  selectAnnouncementsPagination,
  selectCurrentAnnouncement,
} from "@/redux/features/announcementsSlice";
import { Announcement } from "@/types/announcement";

export const useAnnouncements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const announcements = useSelector(selectAnnouncements) || [];
  const loading = useSelector(selectAnnouncementsLoading);
  const error = useSelector(selectAnnouncementsError);
  const pagination = useSelector(selectAnnouncementsPagination) || {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  };
  const currentAnnouncement = useSelector(selectCurrentAnnouncement);

  const loadAnnouncements = (params?: { page?: number; limit?: number }) => {
    dispatch(fetchAnnouncements(params || {}));
  };

  const createNewAnnouncement = async (formData: FormData) => {
    const result = await dispatch(createAnnouncement(formData));
    return result;
  };

  const updateExistingAnnouncement = async (id: string, formData: FormData) => {
    const result = await dispatch(updateAnnouncement({ id, formData }));
    return result;
  };

  const deleteExistingAnnouncement = async (id: string) => {
    const result = await dispatch(deleteAnnouncement(id));
    return result;
  };

  const toggleStatus = async (id: string) => {
    const result = await dispatch(toggleAnnouncementStatus(id));
    return result;
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  const setCurrent = (announcement: Announcement) => {
    dispatch(setCurrentAnnouncement(announcement));
  };

  return {
    announcements,
    loading,
    error,
    pagination,
    currentAnnouncement,
    loadAnnouncements,
    createNewAnnouncement,
    updateExistingAnnouncement,
    deleteExistingAnnouncement,
    toggleStatus,
    clearErrorMessage,
    setCurrent,
  };
};
