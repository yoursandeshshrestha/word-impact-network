import { useState, useEffect } from "react";
import { apiClient, News } from "@/lib/api-client";

export const useNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getActiveNews();
      setNews(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return {
    news,
    loading,
    error,
    refetch: fetchNews,
  };
};

export const useNewsBySlug = (slug: string) => {
  const [news, setNews] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNewsBySlug = async () => {
    if (!slug) return;

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getNewsBySlug(slug);
      setNews(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
      console.error("Error fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewsBySlug();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  return {
    news,
    loading,
    error,
    refetch: fetchNewsBySlug,
  };
};
