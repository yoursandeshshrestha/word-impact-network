import React from "react";
import { ArrowRight, Calendar, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNews } from "@/hooks/useNews";
import Image from "next/image";
import Link from "next/link";

const News = () => {
  const { news, loading, error } = useNews();

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start max-w-6xl mx-auto">
            <div className="md:col-span-2 flex flex-col gap-10">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                  Latest News
                </h2>
                <p className="text-gray-600 text-lg mb-10 max-w-xs">
                  Get the latest news and updates from the word impact network.
                </p>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col gap-6 w-full">
              <div className="animate-pulse space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-gray-100 rounded-md p-8 h-32"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !news || news.length === 0) return null;
  return (
    <section className="py-20 bg-gradient-to-br from-white to-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column */}
          <div className="md:col-span-2 flex flex-col gap-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Latest Updates
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Latest News
              </h2>
              <p className="text-gray-600 text-lg mb-10 max-w-sm leading-relaxed">
                Stay informed with the latest news, announcements, and insights
                from WIN Impact Network.
              </p>
            </div>
            <Link
              href="/news"
              className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg text-base font-semibold transition-all duration-200 shadow-lg hover:shadow-xl w-fit group"
            >
              View All News
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Right Column */}
          <div className="md:col-span-3 flex flex-col gap-6 w-full">
            {news.slice(0, 3).map((item) => (
              <a
                key={item.id}
                href={`/news/${item.slug}`}
                className="block rounded-xl bg-white px-8 py-6 transition-all duration-300 hover:bg-gray-50 shadow-sm hover:shadow-lg border border-gray-100 hover:border-gray-200 group"
              >
                <div className="flex items-start space-x-4">
                  {item.images.length > 0 && (
                    <div className="relative w-20 h-20 flex-shrink-0">
                      <Image
                        src={item.images[0].url}
                        alt={item.title}
                        fill
                        className="object-cover rounded-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        <span>
                          {formatDistanceToNow(new Date(item.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <span className="mx-1">•</span>
                      <div className="flex items-center gap-1">
                        <User size={12} />
                        <span>{item.createdBy.fullName}</span>
                      </div>
                    </div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl text-gray-900 font-semibold leading-tight mb-2 group-hover:text-gray-700 transition-colors">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {item.description.replace(/<[^>]*>/g, "")}
                          </p>
                        )}
                      </div>
                                              <ArrowRight className="ml-4 w-5 h-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-200" />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default News;
