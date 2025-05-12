// src/app/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserInfo } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, FileText, Users, Video } from "lucide-react";

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
      router.push("/auth/login");
    }
  }, [router]);

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Card 1 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <BookOpen className="h-6 w-6 text-blue-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Courses
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      12
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card 2 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Students
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      354
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card 3 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                <FileText className="h-6 w-6 text-yellow-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Applications
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      28
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Card 4 */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                <Video className="h-6 w-6 text-purple-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Video Lessons
                  </dt>
                  <dd>
                    <div className="text-lg font-semibold text-gray-900">
                      142
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
