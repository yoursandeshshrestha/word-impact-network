"use client";

import React from "react";
import { useParams } from "next/navigation";
import { ArrowLeft, Calendar, User, Video } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNewsBySlug } from "@/hooks/useNews";
import Image from "next/image";
import Link from "next/link";

const NewsDetailPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const { news, loading, error } = useNewsBySlug(slug);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              News Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              The news article you&apos;re looking for doesn&apos;t exist.
            </p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-34">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/news"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to News
        </Link>

        {/* News Content */}
        <article className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="p-8 md:p-12 border-b border-gray-200">
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                <Calendar size={14} />
                <span className="font-medium">
                  {formatDistanceToNow(new Date(news.createdAt), {
                    addSuffix: true,
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 text-gray-700 rounded-full">
                <User size={14} />
                <span className="font-medium">{news.createdBy.fullName}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              {news.title}
            </h1>

            {news.description && (
              <div
                className="text-lg md:text-xl text-gray-700 leading-relaxed prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: news.description }}
              />
            )}
          </div>

          {/* Images */}
          {news.images.length > 0 && (
            <div className="p-8 md:p-12 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">
                    {news.images.length}
                  </span>
                </div>
                Images
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {news.images.map((image) => (
                  <div key={image.id} className="group">
                    <div className="relative overflow-hidden rounded-xl">
                      <Image
                        src={image.url}
                        alt={image.fileName}
                        width={600}
                        height={400}
                        className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {news.videos.length > 0 && (
            <div className="p-8 md:p-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Video size={16} className="text-red-600" />
                </div>
                Videos ({news.videos.length})
              </h2>
              <div className="space-y-8">
                {news.videos.map((video) => (
                  <div key={video.id} className="space-y-3">
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                      <iframe
                        src={video.embedUrl}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={video.fileName}
                      />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {video.fileName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default NewsDetailPage;
