"use client";
import React from "react";
import Sidebar from "@/src/components/layout/Sidebar";
import { getUserInfo } from "@/src/utils/auth";
import Topbar from "@/src/components/layout/Topbar";
export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userInfo = getUserInfo();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar userName={userInfo?.fullName} userEmail={userInfo?.email} />
      <div className="w-full">
        <Topbar userName={userInfo?.fullName} userRole="Administrator" />
        <main className="flex-1 md:ml-64 p-4 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
