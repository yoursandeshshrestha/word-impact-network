import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createChapter,
  getChaptersByCourse,
  getChapterById,
  updateChapter,
  deleteChapter,
  resetChapterStatus,
  setChapter,
  clearChapters,
  selectChapters,
  selectChapter,
  selectChaptersLoading,
  selectChaptersError,
  selectChaptersSuccess,
  selectChaptersMessage,
  Chapter,
} from "@/redux/features/chaptersSlice";

export const useChapter = () => {
  const dispatch = useDispatch<AppDispatch>();
  const chapters = useSelector(selectChapters);
  const chapter = useSelector(selectChapter);
  const loading = useSelector(selectChaptersLoading);
  const error = useSelector(selectChaptersError);
  const success = useSelector(selectChaptersSuccess);
  const message = useSelector(selectChaptersMessage);

  // Reset status when component unmounts or dependencies change
  useEffect(() => {
    return () => {
      dispatch(resetChapterStatus());
    };
  }, [dispatch]);

  const fetchChaptersByCourse = (courseId: string) => {
    dispatch(getChaptersByCourse(courseId));
  };

  const fetchChapterById = (id: string) => {
    dispatch(getChapterById(id));
  };

  const addChapter = (
    courseId: string,
    chapterData: Omit<
      Chapter,
      | "id"
      | "adminId"
      | "courseId"
      | "createdAt"
      | "updatedAt"
      | "createdBy"
      | "course"
      | "_count"
    >
  ) => {
    dispatch(createChapter({ courseId, chapterData }));
  };

  const editChapter = (id: string, chapterData: Partial<Chapter>) => {
    dispatch(updateChapter({ id, chapterData }));
  };

  const removeChapter = (id: string) => {
    dispatch(deleteChapter(id));
  };

  const selectChapterData = (chapterData: Chapter | null) => {
    dispatch(setChapter(chapterData));
  };

  const reset = () => {
    dispatch(resetChapterStatus());
  };

  const clearChaptersList = () => {
    dispatch(clearChapters());
  };

  return {
    chapters,
    chapter,
    loading,
    error,
    success,
    message,
    fetchChaptersByCourse,
    fetchChapterById,
    addChapter,
    editChapter,
    removeChapter,
    selectChapter: selectChapterData,
    reset,
    clearChaptersList,
  };
};
