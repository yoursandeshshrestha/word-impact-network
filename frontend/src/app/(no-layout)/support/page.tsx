"use client";

import React, { useEffect, useState, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { Send } from "lucide-react";

const Messages: React.FC = () => {
  const {
    adminConversation,
    loading,
    error,
    sendMessageToAdmin,
    fetchAdminConversation,
    markAsRead,
  } = useMessages();

  // Initialize WebSocket connection for real-time updates
  useWebSocketConnection();

  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAdminConversation();
  }, [fetchAdminConversation]);

  useEffect(() => {
    if (adminConversation?.admin?.id) {
      markAsRead(adminConversation.admin.id);
    }
  }, [adminConversation?.admin?.id, markAsRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [adminConversation?.messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessageToAdmin(message);
      await fetchAdminConversation();
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Suggestion messages
  const suggestions = [
    "Hello",
    "I need help",
    "How do I reset my password?",
    "Can I speak to an admin?",
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          {error}
        </div>
      </div>
    );
  }

  if (!adminConversation) {
    return null;
  }

  // Sort messages by time
  const sortedMessages = [...adminConversation.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50 pt-4 pb-30">
      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
      >
        {sortedMessages.map((msg, index) => {
          const isAdminMessage = !msg.isFromStudent;
          return (
            <div
              key={`${msg.id}-${index}`}
              className={`flex ${
                isAdminMessage ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[75%] px-3 py-2 rounded-lg ${
                  isAdminMessage
                    ? "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                    : "bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-br-none shadow-sm"
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 text-right ${
                    isAdminMessage ? "text-gray-500" : "text-blue-100"
                  }`}
                >
                  {(() => {
                    const date = new Date(msg.createdAt);
                    return isNaN(date.getTime())
                      ? new Date().toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : date.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                  })()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t p-4 fixed bottom-0 w-full">
        {/* Suggestions */}
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMessage(suggestion)}
              className="px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all text-sm shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm rounded-none"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className={`flex items-center gap-2 px-5 py-3 font-medium rounded-none shadow-sm transition-all duration-150
                ${
                  !message.trim()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-br from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500 focus:ring-2 focus:ring-blue-400"
                }
              `}
              aria-label="Send message"
            >
              <span>Send</span>
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;
