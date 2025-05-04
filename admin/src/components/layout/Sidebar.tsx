"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/src/utils/auth";
import { useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  Users,
  FileText,
  MessageSquare,
  BarChart2,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type SidebarProps = {
  userEmail?: string;
  userName?: string;
};

const Sidebar: React.FC<SidebarProps> = ({ userEmail, userName }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  const menuItems = [
    {
      path: "/dashboard",
      name: "Dashboard",
      icon: <Home className="w-5 h-5" />,
    },
    {
      path: "/courses",
      name: "Courses",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      path: "/students",
      name: "Students",
      icon: <Users className="w-5 h-5" />,
    },
    {
      path: "/applications",
      name: "Applications",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      path: "/messages",
      name: "Messages",
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      path: "/analytics",
      name: "Analytics",
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      path: "/settings",
      name: "Settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed right-4 top-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen bg-gray-800 transition-transform ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        } w-64 md:w-64`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-gray-700">
          <Link href="/" className="flex-1">
            <h1 className="text-xl font-bold text-white">
              Word Impact Network
            </h1>
          </Link>
        </div>

        {/* Menu Items */}
        <div className="py-4 overflow-y-auto">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`flex items-center p-3 text-gray-300 rounded-lg transition-colors ${
                    pathname === item.path
                      ? "bg-gray-700 text-white"
                      : "hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  <span className="text-gray-400 group-hover:text-white">
                    {item.icon}
                  </span>
                  <span className="ml-3 text-sm font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* User Info & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white">
              {userName || "Admin User"}
            </h3>
            <p className="text-gray-400 text-xs">
              {userEmail || "admin@example.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center cursor-pointer text-gray-300 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2 text-sm">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
