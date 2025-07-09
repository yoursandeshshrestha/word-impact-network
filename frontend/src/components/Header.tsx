"use client";

import React, { useState, useEffect, useMemo } from "react";
import { logout } from "@/common/services/auth";
import {
  ChevronDown,
  User,
  LogOut,
  Search,
  Lock,
  Menu,
  X,
  Home,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useAutoCourses } from "@/hooks/useCourses";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Link from "next/link";
import Image from "next/image";

const Header: React.FC<{
  studentName?: string;
  isLoading?: boolean;
  showSidebar?: boolean;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}> = ({
  studentName: propStudentName,
  isLoading: externalLoading,
  showSidebar = false,
  onMobileMenuToggle,
  isMobileMenuOpen = false,
}) => {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { searchQuery, updateSearchQuery } = useAutoCourses();
  const {
    user,
    isLoading: userLoading,
    isHydrated,
  } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Set initial mobile state
    handleResize();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    // Use user data from Redux if available, otherwise fall back to prop
    const nameToUse = user?.fullName || propStudentName || "Student";

    if (nameToUse) {
      const timer = setTimeout(() => {
        setDisplayName(nameToUse);
        setIsNameLoading(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [user?.fullName, propStudentName]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.getElementById("user-dropdown");
      if (dropdown && !dropdown.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const searchContainer = document.getElementById("mobile-search");
      if (searchContainer && !searchContainer.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSearchOpen]);

  const isLoading =
    externalLoading ?? userLoading ?? (isNameLoading || !isHydrated);

  const getInitials = useMemo(
    () => (name: string) => {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
    },
    []
  );

  const headerClassName = useMemo(
    () =>
      `fixed top-0 left-0 right-0 w-full transition-all duration-300 ease-out z-50 ${
        showSidebar ? "md:left-72 md:w-[calc(100%-18rem)]" : ""
      } ${
        isScrolled
          ? "bg-white backdrop-blur-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border-b border-slate-200"
          : "bg-white backdrop-blur-md shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] border-b border-slate-200"
      }`,
    [isScrolled, showSidebar]
  );

  const menuItems = [
    {
      path: "/my-learning",
      name: "My Learning",
      icon: <Home className="w-4 h-4" />,
    },
    {
      path: "/all-courses",
      name: "All Courses",
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      path: "/profile",
      name: "Profile",
      icon: <User className="w-4 h-4" />,
    },
    {
      path: "/support",
      name: "Support",
      icon: <MessageCircle className="w-4 h-4" />,
    },
  ];

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup function to restore body scroll when component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className={headerClassName}>
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Left Section - Mobile Menu Button & Logo */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Menu Button */}
              {onMobileMenuToggle && (
                <button
                  onClick={onMobileMenuToggle}
                  className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </button>
              )}

              {/* Logo - Only show when no sidebar or on mobile */}
              {(!showSidebar || isMobile) && (
                <Link href="/" className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 hidden sm:block">
                    Word Impact Network
                  </h1>
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 sm:hidden">
                    WIN
                  </h1>
                </Link>
              )}

              {/* Search Bar - Desktop */}
              {pathname === "/all-courses" && (
                <div className="relative w-full max-w-2xl hidden md:block">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for courses"
                    value={searchQuery}
                    onChange={(e) => updateSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7a9e7e] focus:border-[#7a9e7e] focus:bg-white transition-all text-sm text-slate-900 placeholder-slate-400"
                  />
                </div>
              )}
            </div>

            {/* Center Section - Mobile Search */}
            {pathname === "/all-courses" && (
              <div className="flex-1 flex justify-center md:hidden">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  aria-label="Toggle search"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Right Section - User Profile */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 ml-auto">
              {/* User Profile Dropdown */}
              <div className="relative" id="user-dropdown">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-2 md:gap-3 p-1.5 sm:p-2 rounded-xl hover:bg-slate-50 transition-colors group"
                  aria-label="User menu"
                >
                  <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
                    <div className="relative">
                      <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-[#7a9e7e] to-[#b7773a] flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm overflow-hidden">
                        {isLoading ? (
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : user?.profilePictureUrl ? (
                          <Image
                            src={user.profilePictureUrl}
                            alt={displayName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          getInitials(displayName)
                        )}
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#7a9e7e] border-2 border-white rounded-full"></div>
                    </div>

                    <div className="hidden sm:block text-left">
                      <div className="flex items-center gap-1">
                        {isLoading ? (
                          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse"></div>
                        ) : (
                          <span className="text-sm font-medium text-slate-900 truncate max-w-[120px]">
                            {displayName}
                          </span>
                        )}
                        <ChevronDown
                          className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                            isDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                      <div className="text-xs text-slate-500">
                        {user?.role === "ADMIN" ? "Administrator" : "Student"}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <User className="h-4 w-4" />
                        View Profile
                      </a>
                      <a
                        href="/support"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors relative"
                      >
                        <div className="relative">
                          <MessageCircle className="h-4 w-4" />
                        </div>
                        Support
                      </a>
                      <a
                        href="/forgot-password"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                      >
                        <Lock className="h-4 w-4" />
                        Forgot Password
                      </a>
                    </div>

                    <div className="border-t border-slate-200 pt-2">
                      <button
                        onClick={() => logout()}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Search Bar - Expandable */}
          {pathname === "/all-courses" && isSearchOpen && (
            <div id="mobile-search" className="md:hidden pb-4 px-3 sm:px-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for courses"
                  value={searchQuery}
                  onChange={(e) => updateSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#7a9e7e] focus:border-[#7a9e7e] focus:bg-white transition-all text-sm text-slate-900 placeholder-slate-400"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-slate-200 bg-white">
              <nav className="py-4 px-3 sm:px-4">
                <ul className="space-y-2">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.path;

                    return (
                      <li key={item.path}>
                        <Link
                          href={item.path}
                          className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                            isActive
                              ? "bg-[#7a9e7e]/10 text-[#7a9e7e] border border-[#7a9e7e]/20"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div className="relative">{item.icon}</div>
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={onMobileMenuToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default React.memo(Header);
