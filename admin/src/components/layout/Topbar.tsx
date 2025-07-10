"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Settings, User, LogOut, Key, Menu } from "lucide-react";
import NotificationDropdown from "@/components/ui/NotificationDropdown";
import { logout } from "@/utils/auth";

interface TopbarProps {
  userName: string;
  userRole: string;
  onMenuClick?: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ userName, userRole, onMenuClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white border-b border-gray-100 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 shadow-sm font-sans">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="xl:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop spacer */}
      <div className="hidden xl:block flex-1" />

      {/* Right side content */}
      <div className="flex items-center gap-4 sm:gap-6 lg:gap-8">
        {/* Notification Dropdown Component */}
        <NotificationDropdown />

        {/* User Info with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleProfileClick}
          >
            {/* Hide user info on very small screens */}
            <div className="hidden sm:block text-right leading-tight">
              <div className="font-semibold text-gray-900 text-sm sm:text-base tracking-tight">
                {userName}
              </div>
              <div className="text-xs text-gray-400 font-medium tracking-wide">
                {userRole}
              </div>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-400 flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md border-2 border-white">
              {userName.charAt(0)}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-50">
              <div className="py-1">
                <Link
                  href="/settings/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <User className="mr-3 h-4 w-4 text-gray-500" />
                  My Profile
                </Link>
                <Link
                  href="/settings/change-password"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Key className="mr-3 h-4 w-4 text-gray-500" />
                  Change Password
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <Settings className="mr-3 h-4 w-4 text-gray-500" />
                  Settings
                </Link>
                <button
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-4 w-4 text-gray-500" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
