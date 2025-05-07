"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "@/src/components/layout/Sidebar";
import { getUserInfo } from "@/src/utils/auth";
import Topbar from "@/src/components/layout/Topbar";
import { Toaster } from "sonner";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userName, setUserName] = useState("Admin User");
  const [userEmail, setUserEmail] = useState("admin@example.com");

  useEffect(() => {
    const userInfo = getUserInfo();
    console.log("User info from cookies:", userInfo);

    if (userInfo) {
      setUserName(userInfo.fullName);
      setUserEmail(userInfo.email);
    }
  }, []);

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
      <Toaster position="top-right" richColors />
    </div>
  );
}
