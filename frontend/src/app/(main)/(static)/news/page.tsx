"use client";

import React from "react";
import {
  ArrowLeft,
  Calendar,
  User,
  Image as ImageIcon,
  Video,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNews } from "@/hooks/useNews";
import Image from "next/image";
import Link from "next/link";

const NewsPage = () => {
  const { news, loading, error } = useNews();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error Loading News
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-34">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Latest News & Updates
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Stay updated with the latest news, announcements, and insights from
            WIN Impact Network.
          </p>
        </div>

        {/* News Grid */}
        {!news || news.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No News Available
            </h2>
            <p className="text-gray-600">Check back later for updates.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 hover:border-gray-200"
              >
                {/* Image */}
                {item.images.length > 0 && (
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={item.images[0].url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(item.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span className="font-medium">
                        {item.createdBy.fullName}
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
                    {item.title}
                  </h2>

                  {item.description && (
                    <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed text-sm">
                      {item.description.replace(/<[^>]*>/g, "")}
                    </p>
                  )}

                  {/* Attachments */}
                  <div className="flex items-center gap-4 text-xs text-gray-400 pt-3 border-t border-gray-100">
                    {item.images.length > 0 && (
                      <div className="flex items-center gap-1">
                        <ImageIcon size={12} />
                        <span>
                          {item.images.length} image
                          {item.images.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                    {item.videos.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Video size={12} />
                        <span>
                          {item.videos.length} video
                          {item.videos.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
