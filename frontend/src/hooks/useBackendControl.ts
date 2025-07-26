import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";

interface BackendStatus {
  isEnabled: boolean;
  timestamp: string;
}

export const useBackendControl = () => {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.request<BackendStatus>(
        "/backend-control/x9k2m7p4q8r3s6t1u5v0w2y7z4a8b3c6d1e5f0g2h7i4j8k3l6m1n5o0p2q7r4s8t3u6v1w5x0y2z7a4b8c3d6e1f5g0h2i7j4k8l3m6n1o5p0q2r7s4t8u3v6w1x5y0z2a7b4c8d3e6f1g5h0i2j7k4l8m3n6o1p5q0r2s7t4u8v3w6x1y5z0/status"
      );
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch status");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.request<BackendStatus>(
        "/backend-control/x9k2m7p4q8r3s6t1u5v0w2y7z4a8b3c6d1e5f0g2h7i4j8k3l6m1n5o0p2q7r4s8t3u6v1w5x0y2z7a4b8c3d6e1f5g0h2i7j4k8l3m6n1o5p0q2r7s4t8u3v6w1x5y0z2a7b4c8d3e6f1g5h0i2j7k4l8m3n6o1p5q0r2s7t4u8v3w6x1y5z0/toggle",
        { method: "POST" }
      );
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to toggle backend");
    } finally {
      setIsLoading(false);
    }
  };

  const enableBackend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.request<BackendStatus>(
        "/backend-control/x9k2m7p4q8r3s6t1u5v0w2y7z4a8b3c6d1e5f0g2h7i4j8k3l6m1n5o0p2q7r4s8t3u6v1w5x0y2z7a4b8c3d6e1f5g0h2i7j4k8l3m6n1o5p0q2r7s4t8u3v6w1x5y0z2a7b4c8d3e6f1g5h0i2j7k4l8m3n6o1p5q0r2s7t4u8v3w6x1y5z0/enable",
        { method: "POST" }
      );
      setStatus(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enable backend");
    } finally {
      setIsLoading(false);
    }
  };

  const disableBackend = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.request<BackendStatus>(
        "/backend-control/x9k2m7p4q8r3s6t1u5v0w2y7z4a8b3c6d1e5f0g2h7i4j8k3l6m1n5o0p2q7r4s8t3u6v1w5x0y2z7a4b8c3d6e1f5g0h2i7j4k8l3m6n1o5p0q2r7s4t8u3v6w1x5y0z2a7b4c8d3e6f1g5h0i2j7k4l8m3n6o1p5q0r2s7t4u8v3w6x1y5z0/disable",
        { method: "POST" }
      );
      setStatus(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to disable backend"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  return {
    status,
    isLoading,
    error,
    fetchStatus,
    toggleBackend,
    enableBackend,
    disableBackend,
  };
};
