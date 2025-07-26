"use client";

import { Power, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useBackendControl } from "@/hooks/useBackendControl";

const SystemControlPage = () => {
  const { status, isLoading, error, toggleBackend } = useBackendControl();

  const isBackendEnabled = status?.isEnabled ?? true;
  const lastUpdated = status?.timestamp ?? "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <Power className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">System Control Panel</h1>
          <p className="text-gray-400 text-lg">
            Advanced backend management interface
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-gray-800 rounded-lg p-8 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Backend Status</h2>
            <div className="flex items-center space-x-2">
              {isBackendEnabled ? (
                <CheckCircle className="w-6 h-6 text-green-500" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-red-500" />
              )}
              <span
                className={`text-lg font-medium ${
                  isBackendEnabled ? "text-green-500" : "text-red-500"
                }`}
              >
                {isBackendEnabled ? "ENABLED" : "DISABLED"}
              </span>
            </div>
          </div>

          {/* Toggle Switch */}
          <div className="flex items-center justify-center mb-6">
            <button
              onClick={toggleBackend}
              disabled={isLoading}
              className={`
                relative inline-flex h-16 w-32 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-500/50
                ${
                  isBackendEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
                ${
                  isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }
              `}
            >
              <span
                className={`
                  inline-block h-12 w-12 transform rounded-full bg-white transition-transform duration-300 ease-in-out
                  ${isBackendEnabled ? "translate-x-16" : "translate-x-2"}
                `}
              />
              {isLoading && (
                <Loader2 className="absolute inset-0 m-auto w-6 h-6 animate-spin text-white" />
              )}
            </button>
          </div>

          {/* Status Description */}
          <div className="text-center">
            <p className="text-gray-300 mb-2">
              {isBackendEnabled
                ? "All backend services are currently operational and accepting requests."
                : "Backend services are currently disabled. All API requests will return a 503 error."}
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Warning Card */}
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                ⚠️ Important Warning
              </h3>
              <p className="text-red-300 text-sm leading-relaxed">
                This control panel allows you to completely disable the backend
                API. When disabled, all client applications will be unable to
                function properly. Use this feature responsibly and only when
                absolutely necessary.
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">How it works:</h3>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>
              • <strong>Enabled:</strong> All API endpoints work normally
            </li>
            <li>
              • <strong>Disabled:</strong> All API endpoints return 503 Service
              Unavailable
            </li>
            <li>
              • <strong>Health check:</strong> Always remains accessible for
              monitoring
            </li>
            <li>
              • <strong>Control endpoints:</strong> Always remain accessible for
              management
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SystemControlPage;
