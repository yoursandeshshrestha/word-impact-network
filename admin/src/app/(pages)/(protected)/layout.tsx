"use client";
import React from "react";
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

  // Initialize WebSocket connection for real-time chat
  useWebSocketConnection();

  const userName = user?.fullName || "Admin User";
  const userEmail = user?.email || "admin@gmail.com";

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64">
        <Sidebar userName={userName} userEmail={userEmail} />
      </div>
      <div className="flex-1 ml-64">
        <Topbar userName={userName} userRole="Administrator" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
      <GlobalChat />
      <Toaster position="top-right" richColors />
    </div>
  );
}
