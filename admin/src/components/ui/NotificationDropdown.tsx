"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bell, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationDropdownProps {
  className?: string;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsListRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    unreadCount,
    isLoading,
    pagination,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  // Focus on dropdown content when opened
  useEffect(() => {
    if (isOpen && notificationsListRef.current) {
      notificationsListRef.current.focus();
    }
  }, [isOpen]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen) {
      // Refresh notifications when opening the dropdown
      loadNotifications({ page: 1, limit: 10 });

      // Mark all notifications as read when opening the dropdown
      if (unreadCount > 0) {
        markAllAsRead();
      }
    }
  };

  const handleNotificationClick = (notificationId: string) => {
    markAsRead(notificationId);
    // You can add navigation based on notification type here if needed
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  // Load more notifications on scroll
  const handleScroll = () => {
    if (!notificationsListRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } =
      notificationsListRef.current;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 20;

    if (
      isAtBottom &&
      !isLoading &&
      pagination.currentPage < pagination.totalPages
    ) {
      loadNotifications({
        page: pagination.currentPage + 1,
        limit: pagination.pageSize,
      });
    }
  };

  return (
    <div className={`relative ${className || ""}`} ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        className="relative p-1 rounded-full group focus:outline-none hover:bg-gray-100"
        onClick={toggleDropdown}
        aria-label="Notifications"
      >
        <Bell className="h-6 w-6 text-gray-500 group-hover:text-blue-600 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-5 min-w-5 px-1.5 flex items-center justify-center font-bold shadow-md border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50 border border-gray-200">
          <div className="p-3 bg-gray-100 flex justify-between items-center border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium"
              >
                <Check size={14} className="mr-1" />
                Mark all as read
              </button>
            )}
          </div>

          <div
            className="max-h-96 overflow-y-auto"
            ref={notificationsListRef}
            onScroll={handleScroll}
            tabIndex={0} // Make the container focusable
            role="region"
            aria-label="Notifications list"
          >
            {isLoading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                Loading...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <li key={notification.id}>
                    <button
                      className={`w-full text-left p-3 hover:bg-gray-50 flex items-start transition-colors ${
                        !notification.isRead ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handleNotificationClick(notification.id)}
                    >
                      <div className="flex-1 pr-2">
                        <p className="text-sm font-medium text-gray-900 mb-0.5">
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {notification.content}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(
                            new Date(notification.createdAt),
                            { addSuffix: true }
                          )}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="flex-shrink-0 mt-1">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {isLoading && notifications.length > 0 && (
              <div className="p-2 text-center text-gray-500">
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-blue-600 mr-2"></div>
                Loading more...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
