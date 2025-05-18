"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 h-[90vh] flex justify-center items-center bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div>
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-800 mb-6 leading-tight">
              Oops! Page <span className="font-semibold">Not Found</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-md text-base font-medium flex items-center justify-center group transition-all"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Return Home
              </Link>
              <Link
                href="/dashboard"
                className="border border-gray-300 text-gray-800 hover:border-gray-400 hover:bg-gray-50 px-8 py-3 rounded-md text-base font-medium transition-all"
              >
                Go Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
