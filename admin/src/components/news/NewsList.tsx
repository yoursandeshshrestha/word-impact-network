"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNews } from "@/hooks/useNews";
import { News } from "@/types/news";
import NewsModal from "./NewsModal";
import DeleteConfirmationModal from "../application/DeleteConfirmationModal";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import NoDataFound from "../common/NoDataFound";
import ResponsiveTable from "../common/ResponsiveTable";
import ResponsiveTableRow from "../common/ResponsiveTableRow";
import Image from "next/image";

const NewsList: React.FC = () => {
  const {
    news,
    loading,
    error,
    pagination,
    loadNews,
    createNewNews,
    updateExistingNews,
    deleteExistingNews,
    toggleStatus,
    clearErrorMessage,
  } = useNews();

  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [deletingNews, setDeletingNews] = useState<News | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const hasLoadedRef = useRef(false);

  // Load news when page changes
  useEffect(() => {
    if (hasLoadedRef.current) {
      loadNews({ page: currentPage, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Initial load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadNews({ page: 1, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      // You can add a toast notification here
      console.error("News error:", error);
    }
  }, [error]);

  const handleCreate = async (data: FormData) => {
    try {
      await createNewNews(data);
      setShowForm(false);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to create news:", error);
    }
  };

  const handleUpdate = async (data: FormData) => {
    if (!editingNews) return;

    try {
      await updateExistingNews(editingNews.id, data);
      setEditingNews(null);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to update news:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingNews) return;

    try {
      await deleteExistingNews(deletingNews.id);
      setDeletingNews(null);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to delete news:", error);
    }
  };

  const handleToggleStatus = async (news: News) => {
    try {
      await toggleStatus(news.id);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to toggle news status:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Safety check for pagination
  const safePagination = pagination || {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    pageSize: 10,
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (loading && (!news || news.length === 0)) {
    return <Loading />;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">News</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Manage system news and updates
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create News</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* News List */}
      {!news || news.length === 0 ? (
        <NoDataFound
          title="No News"
          message="Create your first news article to get started."
        />
      ) : (
        <ResponsiveTable headers={["News", "Status", "Created By", "Created", "Actions"]}>
          {news?.map((newsItem) => (
            <ResponsiveTableRow
              key={newsItem.id}
              mobileCardContent={
                <div className="space-y-4">
                  {/* News Info */}
                  <div className="flex items-start space-x-3">
                    {newsItem.images.length > 0 && (
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <Image
                          src={newsItem.images[0].url}
                          alt="News"
                          fill
                          className="object-cover rounded-md"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        {newsItem.title}
                      </h3>
                      {newsItem.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {truncateText(newsItem.description, 80)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                        <span className="text-blue-600 font-medium">
                          /{newsItem.slug}
                        </span>
                        {newsItem.images.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ImageIcon size={12} />
                            <span>{newsItem.images.length}</span>
                          </div>
                        )}
                        {newsItem.videos.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Video size={12} />
                            <span>{newsItem.videos.length}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Status and Created Info */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        newsItem.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {newsItem.isActive ? "Active" : "Inactive"}
                    </span>
                    <div className="flex items-center text-xs text-gray-500">
                      <User className="h-3 w-3 mr-1" />
                      <span>{newsItem.createdBy.fullName}</span>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="h-3 w-3 mr-1" />
                    <span>
                      {formatDistanceToNow(new Date(newsItem.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleStatus(newsItem);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                      title={newsItem.isActive ? "Deactivate" : "Activate"}
                    >
                      {newsItem.isActive ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNews(newsItem);
                      }}
                      className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                      title="Edit"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeletingNews(newsItem);
                      }}
                      className="text-red-600 hover:text-red-900 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              }
            >
              <td className="px-6 py-4">
                <div className="flex items-start space-x-3">
                  {newsItem.images.length > 0 && (
                    <div className="relative w-12 h-12">
                      <Image
                        src={newsItem.images[0].url}
                        alt="News"
                        fill
                        className="object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {newsItem.title}
                    </h3>
                    {newsItem.description && (
                      <p className="text-sm text-gray-500 mt-1">
                        {truncateText(newsItem.description, 80)}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span className="text-blue-600 font-medium">
                        /{newsItem.slug}
                      </span>
                      {newsItem.images.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ImageIcon size={12} />
                          <span>{newsItem.images.length}</span>
                        </div>
                      )}
                      {newsItem.videos.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Video size={12} />
                          <span>{newsItem.videos.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    newsItem.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {newsItem.isActive ? "Active" : "Inactive"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <User className="flex-shrink-0 h-4 w-4 text-gray-400" />
                  <span className="ml-2 text-sm text-gray-900">
                    {newsItem.createdBy.fullName}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div className="flex items-center">
                  <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400" />
                  <span className="ml-2">
                    {formatDistanceToNow(new Date(newsItem.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => handleToggleStatus(newsItem)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title={newsItem.isActive ? "Deactivate" : "Activate"}
                  >
                    {newsItem.isActive ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditingNews(newsItem)}
                    className="text-blue-600 hover:text-blue-900 transition-colors"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setDeletingNews(newsItem)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </ResponsiveTableRow>
          ))}
        </ResponsiveTable>
      )}

      {/* Pagination */}
      {safePagination.totalPages > 1 && (
        <Pagination
          currentPage={safePagination.currentPage}
          totalPages={safePagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create/Edit Form Modal */}
      <NewsModal
        isOpen={showForm || !!editingNews}
        onClose={() => {
          setShowForm(false);
          setEditingNews(null);
        }}
        onSubmit={editingNews ? handleUpdate : handleCreate}
        news={editingNews}
        isLoading={loading}
        mode={editingNews ? "edit" : "create"}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={!!deletingNews}
        onClose={() => setDeletingNews(null)}
        onConfirm={handleDelete}
        applicationName={deletingNews?.title || ""}
      />
    </div>
  );
};

export default NewsList;
