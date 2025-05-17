"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import { getUserInfo } from "@/utils/auth";
import Topbar from "@/components/layout/Topbar";
import { Toaster } from "sonner";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import dynamic from "next/dynamic";

// Dynamically import the GlobalChat component with no SSR
const GlobalChat = dynamic(() => import("@/components/chat/GlobalChat"), {
  ssr: false,
});

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Admin User");

  // Initialize WebSocket connection using your existing hook
  useWebSocketConnection();

  useEffect(() => {
    const userInfo = getUserInfo();

    if (userInfo) {
      setUserName(userInfo.fullName);
    }
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 w-64">
        <Sidebar userName={userName} userEmail="admin@example.com" />
      </div>
      <div className="flex-1 ml-64">
        <Topbar userName={userName} userRole="Administrator" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          {children}
        </main>
      </div>
      <Toaster position="top-right" richColors />
      {/* Include GlobalChat component */}
      <GlobalChat />
    </div>
  );
}
