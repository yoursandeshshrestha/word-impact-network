"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useWebSocketConnection } from "@/hooks/useWebSocketConnection";
import { Send, AlertCircle, Loader2 } from "lucide-react";

// Types
interface Message {
  id: string;
  content: string;
  createdAt: string;
  isFromStudent: boolean;
}

interface SuggestionButtonProps {
  suggestion: string;
  onSelect: (suggestion: string) => void;
}

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
}

interface MessageInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSend: (e: React.FormEvent) => void;
  isLoading: boolean;
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
}

// Constants
const SUGGESTIONS = [
  "Hello",
  "I need help",
  "How do I reset my password?",
  "Can I speak to an admin?",
  "I have a question about my account",
] as const;

type MessageStatus = "idle" | "loading" | "success" | "error";

// Utility functions
const formatMessageTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
};

const sortMessagesByTime = (messages: Message[]): Message[] => {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
};

// Components
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-500`} />
    </div>
  );
};

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <div className="flex justify-center items-center min-h-screen p-4">
    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-sm max-w-md w-full">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5" />
        <span className="font-medium">Error</span>
      </div>
      <p className="mt-2 text-sm">{error}</p>
    </div>
  </div>
);

const SuggestionButton: React.FC<SuggestionButtonProps> = ({
  suggestion,
  onSelect,
}) => (
  <button
    type="button"
    onClick={() => onSelect(suggestion)}
    className="px-4 py-2 rounded-full bg-gray-100 border border-gray-300 text-gray-700 hover:bg-blue-100 hover:text-blue-700 transition-all text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
    aria-label={`Use suggestion: ${suggestion}`}
  >
    {suggestion}
  </button>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAdminMessage = !message.isFromStudent;
  const formattedTime = formatMessageTime(message.createdAt);

  return (
    <div
      className={`flex ${isAdminMessage ? "justify-start" : "justify-end"}`}
      role="listitem"
      aria-label={`${isAdminMessage ? "Admin" : "You"} message: ${
        message.content
      }`}
    >
      <div
        className={`max-w-[75%] px-3 py-2 rounded-lg ${
          isAdminMessage
            ? "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
            : "bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-br-none shadow-sm"
        }`}
      >
        <p className="text-sm break-words">{message.content}</p>
        <p
          className={`text-[10px] mt-1 text-right ${
            isAdminMessage ? "text-gray-500" : "text-blue-100"
          }`}
          aria-label={`Message sent at ${formattedTime}`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};

const MessageInput: React.FC<MessageInputProps> = ({
  message,
  onMessageChange,
  onSend,
  isLoading,
}) => {
  const isDisabled = !message.trim() || isLoading;

  return (
    <div className="bg-white border-t border-gray-200 p-4 fixed bottom-0 w-full shadow-xl">
      <div className="flex flex-wrap gap-2 mb-3">
        {SUGGESTIONS.map((suggestion, idx) => (
          <SuggestionButton
            key={idx}
            suggestion={suggestion}
            onSelect={onMessageChange}
          />
        ))}
      </div>
      <form onSubmit={onSend} className="w-[50%]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-3 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all text-sm rounded-none"
            disabled={isLoading}
            aria-label="Message input"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={isDisabled}
            className={`flex items-center gap-2 px-5 py-3 font-medium rounded-none shadow-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
              ${
                isDisabled
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-br from-blue-500 to-blue-400 text-white hover:from-blue-600 hover:to-blue-500"
              }
            `}
            aria-label="Send message"
          >
            <span>{isLoading ? "Sending..." : "Send"}</span>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Main Component
const SupportPage: React.FC = () => {
  const {
    adminConversation,
    messages,
    loading,
    error,
    sendMessageToAdmin,
    fetchAdminConversation,
  } = useMessages();

  const [message, setMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<MessageStatus>("idle");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize WebSocket connection for real-time updates
  useWebSocketConnection();

  // Memoized sorted messages
  const sortedMessages = useMemo(
    () =>
      sortMessagesByTime(
        (messages || []).filter(
          (msg) => msg.content && msg.content.trim() !== ""
        )
      ),
    [messages]
  );

  // Scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [sortedMessages]);

  // Fetch conversation on mount
  useEffect(() => {
    fetchAdminConversation();
  }, [fetchAdminConversation]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sendStatus === "loading") return;

    setSendStatus("loading");

    try {
      await sendMessageToAdmin(message);
      setMessage("");
      setSendStatus("success");

      // Reset success status after a brief delay
      setTimeout(() => {
        setSendStatus("idle");
      }, 1000);
    } catch (error) {
      console.error("Failed to send message:", error);
      setSendStatus("error");

      // Reset error status after a delay
      setTimeout(() => {
        setSendStatus("idle");
      }, 3000);
    }
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  // Error state
  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // No conversation state
  if (!adminConversation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p>No conversation found</p>
        </div>
      </div>
    );
  }

  const isLoading = sendStatus === "loading";

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-gray-50 pt-4 pb-32">
      {/* Messages Container */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="log"
        aria-label="Chat messages"
        aria-live="polite"
      >
        {sortedMessages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          sortedMessages.map((msg, index) => (
            <MessageBubble
              key={`${msg.id}-${index}`}
              message={msg}
              isLast={index === sortedMessages.length - 1}
            />
          ))
        )}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        message={message}
        onMessageChange={setMessage}
        onSend={handleSendMessage}
        isLoading={isLoading}
      />

      {/* Error toast for send failures */}
      {sendStatus === "error" && (
        <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">
              Failed to send message. Please try again.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;
