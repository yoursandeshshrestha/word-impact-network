// src/app/(pages)/(protected)/messages/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useMessages } from "@/hooks/useMessages";
import StudentList from "@/components/messages/StudentList";
import StudentConversation from "@/components/messages/StudentConversation";
import MessageComposer from "@/components/messages/MessageComposer";
import Loading from "@/components/common/Loading";
import { toast } from "sonner";
import { getUserInfo } from "@/utils/auth";
import { User } from "@/redux/features/messagesSlice";
import { Filter, RefreshCw, MessageSquare } from "lucide-react";

const MessagesPage: React.FC = () => {
  const {
    messages,
    pagination,
    selectedStudent,
    isLoading,
    error,
    success,
    statusMessage,
    getMessages,
    createMessage,
    readMessage,
    selectStudent,
    clearStudent,
    clearStatus,
  } = useMessages();

  const [currentPage, setCurrentPage] = useState(1);
  const [currentFilter, setCurrentFilter] = useState("all");
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const unreadCount = messages.filter(
    (message) => !message.isRead && message.direction === "received"
  ).length;

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Load messages on component mount and page change
  useEffect(() => {
    getMessages(currentPage, currentFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, currentFilter]);

  // Get current user info
  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      setCurrentUser({ id: userInfo.id });
    }
  }, []);

  // Handle success and error messages
  useEffect(() => {
    if (success && statusMessage) {
      toast.success(statusMessage);
      clearStatus();
      // Refresh messages after sending a new one
      getMessages(currentPage, currentFilter);
    }

    if (error) {
      toast.error(error);
      clearStatus();
    }
  }, [
    success,
    statusMessage,
    error,
    clearStatus,
    getMessages,
    currentPage,
    currentFilter,
  ]);

  // Handle message sending
  const handleSendMessage = (content: string) => {
    if (selectedStudent) {
      createMessage(selectedStudent.id, content);
    }
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (pagination && newPage > 0 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle filter change
  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Refresh messages
  const refreshMessages = () => {
    getMessages(currentPage, currentFilter);
  };

  if (isLoading && messages.length === 0) {
    return <Loading />;
  }

  return (
    <div className="p-4 h-[calc(100vh-80px)]">
      <div className="bg-white shadow-sm rounded-lg p-4 mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          <p className="text-sm text-gray-600">
            Communicate with students and respond to their inquiries
          </p>
          {unreadCount > 0 && (
            <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {unreadCount} unread {unreadCount === 1 ? "message" : "messages"}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              value={currentFilter}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="bg-white text-gray-700 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 pr-8 pl-3 py-1.5 appearance-none"
            >
              <option value="all">All Messages</option>
              <option value="received">Received</option>
              <option value="sent">Sent</option>
              <option value="unread">Unread</option>
            </select>
            <Filter
              size={14}
              className="absolute right-2 top-2.5 pointer-events-none text-gray-500"
            />
          </div>
          <button
            onClick={refreshMessages}
            className="text-gray-700 hover:text-indigo-600 transition-colors p-1.5 rounded-md hover:bg-gray-100"
            title="Refresh messages"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
        {/* Student List Column - Hide on mobile when conversation is shown */}
        <div className={selectedStudent && isMobile ? "hidden" : "block"}>
          <StudentList
            messages={messages}
            onSelectStudent={(user: User) => selectStudent(user)}
            onMarkAsRead={(messageId: string) => readMessage(messageId)}
            currentUserId={currentUser?.id || ""}
            selectedStudentId={selectedStudent?.id}
          />
        </div>

        {/* Conversation and Composer Column */}
        {selectedStudent ? (
          <div className="lg:col-span-2 flex flex-col h-full">
            <div className="flex-1 overflow-hidden">
              <StudentConversation
                messages={messages}
                selectedStudent={selectedStudent}
                onMarkAsRead={readMessage}
                onBack={() => clearStudent()}
                isMobile={isMobile}
              />
            </div>

            <MessageComposer
              student={selectedStudent}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="hidden lg:flex lg:col-span-2 items-center justify-center bg-white rounded-lg shadow-md">
            <div className="text-center p-8">
              <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-500 mb-4">
                <MessageSquare size={40} />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500 max-w-md">
                Choose a student from the list to view your conversation history
                and send messages.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pagination - Only show when not in a conversation on mobile */}
      {!isMobile && pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-3 py-2 rounded-l-md border ${
                currentPage === 1
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            <span className="relative inline-flex items-center px-4 py-2 border-t border-b border-gray-300 bg-white text-sm font-medium text-gray-700">
              {currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className={`relative inline-flex items-center px-3 py-2 rounded-r-md border ${
                currentPage === pagination.totalPages
                  ? "border-gray-300 bg-white text-gray-300 cursor-not-allowed"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;
