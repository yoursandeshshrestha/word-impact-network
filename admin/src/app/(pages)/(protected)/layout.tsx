"use client";
import React, { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import GlobalChat from "@/components/chat/GlobalChat";
import { Toaster } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize WebSocket connection for real-time chat
  useWebSocketConnection();

  const userName = user?.fullName || "Admin User";
  const userEmail = user?.email || "admin@gmail.com";

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 xl:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out xl:translate-x-0 xl:static xl:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          userName={userName}
          userEmail={userEmail}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col xl:ml-0 ">
        <Topbar
          userName={userName}
          userRole="Administrator"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 ">
          {children}
        </main>
      </div>

      <GlobalChat />
      <Toaster position="top-right" richColors />
    </div>
  );
}
