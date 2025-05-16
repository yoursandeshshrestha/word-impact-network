// src/components/DummyMessageSender.tsx
"use client";

import React, { useState } from "react";

interface MessageSenderProps {
  onSuccess?: () => void;
}

const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwZmNmMWQxZi0zZGQzLTQ1YzQtYTRlNi1jNzZjZmZiNWU3MjciLCJlbWFpbCI6ImNvbnRhY3R5b3VyYXJ5YW5AZ21haWwuY29tIiwicm9sZSI6IlNUVURFTlQiLCJpYXQiOjE3NDc0MTM5MTUsImV4cCI6MTc0NzUwMDMxNX0.4jieEup6_7p9izsKPd74PjjQ5evMBXxpvtv2q8DfWlE";

const DummyMessageSender: React.FC<MessageSenderProps> = ({ onSuccess }) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";

      console.log("Sending message to:", `${apiUrl}/messages`);
      console.log("Message content:", message);

      const response = await fetch(`${apiUrl}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TEST_TOKEN}`,
        },
        body: JSON.stringify({ content: message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send message");
      }

      const data = await response.json();
      console.log("Response:", data);

      // Handle success
      setSuccess(true);
      setMessage("");

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Reset success status after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error sending message:", err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Test Message Sender</h2>
      <p className="mb-4 text-gray-600 text-sm">
        Using student token for testing
      </p>

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
          Message sent successfully! The admin should receive a real-time
          notification.
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSendMessage}>
        <div className="mb-4">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message to Admin
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Type your test message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Sending..." : "Send Test Message"}
        </button>
      </form>
    </div>
  );
};

export default DummyMessageSender;
