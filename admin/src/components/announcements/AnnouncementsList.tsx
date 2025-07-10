"use client";

import React, { useState, useEffect, useRef } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Announcement } from "@/types/announcement";
import AnnouncementForm from "./AnnouncementForm";
import DeleteConfirmationModal from "../application/DeleteConfirmationModal";
import Pagination from "../common/Pagination";
import Loading from "../common/Loading";
import NoDataFound from "../common/NoDataFound";
import Image from "next/image";

const AnnouncementsList: React.FC = () => {
  const {
    announcements,
    loading,
    error,
    pagination,
    loadAnnouncements,
    createNewAnnouncement,
    updateExistingAnnouncement,
    deleteExistingAnnouncement,
    toggleStatus,
    clearErrorMessage,
  } = useAnnouncements();

  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [deletingAnnouncement, setDeletingAnnouncement] =
    useState<Announcement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const hasLoadedRef = useRef(false);

  // Load announcements when page changes
  useEffect(() => {
    if (hasLoadedRef.current) {
      loadAnnouncements({ page: currentPage, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // Initial load
  useEffect(() => {
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadAnnouncements({ page: 1, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (error) {
      // You can add a toast notification here
      console.error("Announcements error:", error);
    }
  }, [error]);

  const handleCreate = async (data: FormData) => {
    try {
      await createNewAnnouncement(data);
      setShowForm(false);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to create announcement:", error);
    }
  };

  const handleUpdate = async (data: FormData) => {
    if (!editingAnnouncement) return;

    try {
      await updateExistingAnnouncement(editingAnnouncement.id, data);
      setEditingAnnouncement(null);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to update announcement:", error);
    }
  };

  const handleDelete = async () => {
    if (!deletingAnnouncement) return;

    try {
      await deleteExistingAnnouncement(deletingAnnouncement.id);
      setDeletingAnnouncement(null);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const handleToggleStatus = async (announcement: Announcement) => {
    try {
      await toggleStatus(announcement.id);
      clearErrorMessage();
    } catch (error) {
      console.error("Failed to toggle announcement status:", error);
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

  if (loading && (!announcements || announcements.length === 0)) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage system announcements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Create Announcement</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Announcements List */}
      {!announcements || announcements.length === 0 ? (
        <NoDataFound
          title="No Announcements"
          message="Create your first announcement to get started."
        />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Announcement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {announcements?.map((announcement) => (
                  <tr key={announcement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        {announcement.imageUrl && (
                          <div className="relative w-12 h-12">
                            <Image
                              src={announcement.imageUrl}
                              alt="Announcement"
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
                            {announcement.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {truncateText(announcement.content)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          announcement.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {announcement.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <User className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                        {announcement.createdBy.fullName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                        {formatDistanceToNow(new Date(announcement.createdAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleToggleStatus(announcement)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title={
                            announcement.isActive ? "Deactivate" : "Activate"
                          }
                        >
                          {announcement.isActive ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          onClick={() => setEditingAnnouncement(announcement)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => setDeletingAnnouncement(announcement)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
      {showForm && (
        <AnnouncementForm
          onSubmit={handleCreate}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      {editingAnnouncement && (
        <AnnouncementForm
          announcement={editingAnnouncement}
          onSubmit={handleUpdate}
          onCancel={() => setEditingAnnouncement(null)}
          loading={loading}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAnnouncement && (
        <DeleteConfirmationModal
          isOpen={!!deletingAnnouncement}
          onClose={() => setDeletingAnnouncement(null)}
          onConfirm={handleDelete}
          applicationName={deletingAnnouncement.title}
        />
      )}
    </div>
  );
};

export default AnnouncementsList;
