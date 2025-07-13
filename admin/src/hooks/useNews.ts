import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  fetchNews,
  createNews,
  updateNews,
  deleteNews,
  toggleNewsStatus,
  clearError,
  setCurrentNews,
  selectNews,
  selectNewsLoading,
  selectNewsError,
  selectNewsPagination,
  selectCurrentNews,
} from "@/redux/features/newsSlice";
import { News } from "@/types/news";

export const useNews = () => {
  const dispatch = useDispatch<AppDispatch>();
  const news = useSelector(selectNews) || [];
  const loading = useSelector(selectNewsLoading);
  const error = useSelector(selectNewsError);
  const pagination = useSelector(selectNewsPagination) || {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  };
  const currentNews = useSelector(selectCurrentNews);

  const loadNews = (params?: { page?: number; limit?: number }) => {
    dispatch(fetchNews(params || {}));
  };

  const createNewNews = async (formData: FormData) => {
    const result = await dispatch(createNews(formData));
    return result;
  };

  const updateExistingNews = async (id: string, formData: FormData) => {
    const result = await dispatch(updateNews({ id, formData }));
    return result;
  };

  const deleteExistingNews = async (id: string) => {
    const result = await dispatch(deleteNews(id));
    return result;
  };

  const toggleStatus = async (id: string) => {
    const result = await dispatch(toggleNewsStatus(id));
    return result;
  };

  const clearErrorMessage = () => {
    dispatch(clearError());
  };

  const setCurrent = (news: News) => {
    dispatch(setCurrentNews(news));
  };

  return {
    news,
    loading,
    error,
    pagination,
    currentNews,
    loadNews,
    createNewNews,
    updateExistingNews,
    deleteExistingNews,
    toggleStatus,
    clearErrorMessage,
    setCurrent,
  };
};
