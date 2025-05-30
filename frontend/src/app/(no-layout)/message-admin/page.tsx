import React, { useState, useEffect, useRef } from "react";
import { useMessages } from "@/hooks/useMessages";
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

  const [message, setMessage] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [fetchingMore, setFetchingMore] = useState(false);

  useEffect(() => {
    fetchAdminConversation();
  }, [fetchAdminConversation]);

  useEffect(() => {
    if (adminConversation?.admin?.id) {
      markAsRead(adminConversation.admin.id);
    }
  }, [adminConversation?.admin?.id, markAsRead]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const handleScroll = async () => {
      if (
        container.scrollTop === 0 &&
        adminConversation &&
        adminConversation.pagination.currentPage <
          adminConversation.pagination.totalPages &&
        !fetchingMore
      ) {
        setFetchingMore(true);
        const nextPage = adminConversation.pagination.currentPage + 1;
        await fetchAdminConversation(nextPage);
        setFetchingMore(false);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [adminConversation, fetchAdminConversation, fetchingMore]);

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

  const sortedMessages = [...adminConversation.messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-500 to-blue-400 text-white p-4 shadow-sm z-10">
        <h2 className="text-lg font-semibold">Chat with Admin</h2>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 space-y-2 relative"
        style={{ paddingTop: "1rem" }}
      >
        {fetchingMore && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-400">
            Loading more...
          </div>
        )}
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

      <div className="bg-white border-t p-4 z-10">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className={`p-3 rounded-full ${
                !message.trim()
                  ? "bg-gray-200 text-gray-400"
                  : "bg-gradient-to-br from-blue-500 to-blue-400 text-white hover:bg-blue-600"
              }`}
            >
              <Send className="w-5 h-5 rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Messages;
