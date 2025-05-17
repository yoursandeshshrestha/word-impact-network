// src/components/WebSocketMonitor.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";

interface LogEntry {
  timestamp: Date;
  type: "connect" | "disconnect" | "message" | "error";
  message: string;
}

const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZmNmMWQxZi0zZGQzLTQ1YzQtYTRlNi1jNzZjZmZiNWU3MjciLCJlbWFpbCI6ImNvbnRhY3R5b3VyYXJ5YW5AZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NDc1MDQ1ODUsImV4cCI6MTc0NzU5MDk4NX0.G2x8p_A2w9pd-8oyt9oL74FsEloJ14RjhM0YIKeR1t4";

const WebSocketMonitor: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Add log entry
  const addLog = (type: LogEntry["type"], message: string) => {
    setLogs((prevLogs) =>
      [...prevLogs, { timestamp: new Date(), type, message }].slice(-100)
    ); // Keep only the last 100 logs
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    // Disconnect existing socket if any
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Clear existing ping interval
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";
      // Convert http:// to ws:// and https:// to wss://
      const wsUrl = `${apiUrl
        .replace("http://", "ws://")
        .replace("https://", "wss://")}/ws?token=${TEST_TOKEN}`;

      addLog("connect", `Connecting to ${wsUrl}`);

      const newSocket = new WebSocket(wsUrl);
      socketRef.current = newSocket;

      newSocket.onopen = () => {
        addLog("connect", "WebSocket connection established");
        setConnected(true);

        // Set up ping interval to keep connection alive
        pingIntervalRef.current = setInterval(() => {
          if (newSocket.readyState === WebSocket.OPEN) {
            newSocket.send(JSON.stringify({ type: "ping" }));
            addLog("message", "Sent: ping");
          }
        }, 30000);
      };

      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addLog("message", `Received: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
          console.error("Error parsing message:", error);
          addLog("message", `Received (non-JSON): ${event.data}`);
        }
      };

      newSocket.onclose = (event) => {
        addLog(
          "disconnect",
          `Connection closed: Code ${event.code} ${
            event.reason || "(No reason provided)"
          }`
        );
        setConnected(false);

        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
      };

      newSocket.onerror = (error) => {
        addLog("error", `WebSocket error occurred`);
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      addLog("error", `Failed to connect: ${(error as Error).message}`);
      console.error("WebSocket connection error:", error);
    }
  };

  // Connect when component mounts
  useEffect(() => {
    connectWebSocket();

    // Clean up on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  // Scroll to bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">WebSocket Monitor</h2>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-2 ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{connected ? "Connected" : "Disconnected"}</span>
          </div>

          <button
            onClick={connectWebSocket}
            className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reconnect
          </button>
        </div>
      </div>

      <div className="border border-gray-300 rounded-md h-96 overflow-y-auto bg-gray-50 p-4">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center mt-10">
            No WebSocket activity yet
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`p-2 rounded text-sm font-mono break-words ${
                  log.type === "connect"
                    ? "bg-green-100 text-green-800"
                    : log.type === "disconnect"
                    ? "bg-yellow-100 text-yellow-800"
                    : log.type === "error"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <span className="font-semibold">
                  {log.timestamp.toLocaleTimeString()}:
                </span>{" "}
                {log.message}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-between">
        <button
          onClick={() => setLogs([])}
          className="text-gray-600 text-sm hover:text-gray-900"
        >
          Clear Logs
        </button>
        <p className="text-gray-500 text-sm">Using student token for testing</p>
      </div>
    </div>
  );
};

export default WebSocketMonitor;
