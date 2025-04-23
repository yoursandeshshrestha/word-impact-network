"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const NotFound = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Set animation visibility after component mounts
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-32 pb-20 md:pt-40 md:pb-32 h-[90vh] flex justify-center items-center bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div
            className={`transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-gray-900 mb-6 leading-tight">
              Oops! Page <span className="font-semibold">Not Found</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-xl">
              The page you&apos;re looking for doesn&apos;t exist or has been
              moved. Let&apos;s get you back on track to continue your learning
              journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md text-base font-medium flex items-center justify-center group transition-all"
              >
                <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                Return Home
              </Link>
              <button className="border border-gray-300 text-gray-800 hover:border-gray-500 px-8 py-3 rounded-md text-base font-medium transition-all">
                Contact Support
              </button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
          >
            <div className="relative z-10 flex flex-col items-center">
              <Image
                src="/page-not-found.svg"
                alt="Page not found illustration"
                className="w-full h-auto max-w-md mx-auto"
                width={1000}
                height={1000}
              />
            </div>

            {/* Subtle gradient background - same style as the hero */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full bg-gradient-to-r from-red-50 to-orange-50 blur-3xl -z-10 opacity-70"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NotFound;
