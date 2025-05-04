"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getUserInfo, logout } from "@/src/utils/auth";
import { useAuth } from "@/src/hooks/useAuth";

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(
    null
  );

  // Require auth for this page
  useAuth(true);

  useEffect(() => {
    // Get user info from cookies
    const userInfo = getUserInfo();
    console.log("User info:", userInfo);
    if (userInfo) {
      setUser(userInfo);
    } else {
      // If no user info, redirect to login (redundant with useAuth, but as a safety measure)
      router.push("/auth/login");
    }
  }, [router]);

  const handleLogout = () => {
    logout();
    toast.success("You have been logged out successfully");
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">
            Word Impact Network
          </h1>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Welcome, <span className="font-medium">{user.fullName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Home;
