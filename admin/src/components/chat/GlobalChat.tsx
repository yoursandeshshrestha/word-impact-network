import React, { useState, useEffect } from "react";
import { useMessages } from "@/hooks/useMessages";
import { MessageCircle, X, ChevronLeft, Send } from "lucide-react";
import { Conversation, Message, User } from "@/redux/features/messagesSlice";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

const GlobalChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showConversation, setShowConversation] = useState(false);
  const [message, setMessage] = useState("");

  const {
    conversations,
    messages,
    selectedStudent,
    isLoading,
    success,
    error,
    statusMessage,
    getConversations,
    getConversationMessages,
    createMessage,
    readConversation,
    selectStudent,
    clearStudent,
    clearStatus,
    unreadCount,
    fetchUnreadCount,
  } = useMessages();

  // Fetch unread count on component mount - real-time updates handled by Socket.IO
  useEffect(() => {
    // Initial fetch of unread count (even before opening the chat)
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  // Refresh conversations when new messages arrive (for real-time updates)
  useEffect(() => {
    if (isOpen && !showConversation) {
      // Refresh conversations list when chat is open but not in a conversation
      getConversations();
    }
  }, [isOpen, showConversation, getConversations, unreadCount]);

  // Refresh conversation messages when conversation view is opened - real-time updates handled by Socket.IO
  useEffect(() => {
    if (isOpen && showConversation && selectedStudent) {
      // Load conversation messages when entering conversation view
      getConversationMessages(selectedStudent.id);
    }
  }, [isOpen, showConversation, selectedStudent, getConversationMessages]);

  // Initial load of conversations (only when chat is opened)
  useEffect(() => {
    if (isOpen && !showConversation) {
      getConversations();
    }
  }, [isOpen, showConversation, getConversations]);

  // Handle student selection
  const handleSelectStudent = (student: User) => {
    selectStudent(student);
    getConversationMessages(student.id);
    setShowConversation(true);

    // If there are unread messages, mark the conversation as read
    const conversation = conversations.find((c) => c.partner.id === student.id);
    if (conversation && conversation.unreadCount > 0) {
      readConversation(student.id);
    }
  };

  // Handle success and error messages
  useEffect(() => {
    if (success && statusMessage) {
      toast.success(statusMessage);
      clearStatus();

      // Refresh conversation messages after sending a new one
      if (selectedStudent) {
        getConversationMessages(selectedStudent.id);
      }
    }

    if (error) {
      toast.error(error);
      clearStatus();
    }
  }, [
    success,
    statusMessage,
    error,
    clearStatus,
    getConversationMessages,
    selectedStudent,
  ]);

  // Handle back to conversation list
  const handleBackToList = () => {
    setShowConversation(false);
    clearStudent();
    getConversations(); // Refresh the list when going back
  };

  // Handle send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedStudent && message.trim()) {
      createMessage(selectedStudent.id, message.trim());
      setMessage("");
    }
  };

  return (
    <>
      {/* Chat button */}
      <button
        id="global-chat-button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors z-50 flex items-center justify-center"
        aria-label="Chat with students"
      >
        <MessageCircle size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold shadow-md border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 w-80 md:w-96 h-[600px] max-h-[80vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-400 text-white flex items-center justify-between">
            {showConversation ? (
              <>
                <button
                  onClick={handleBackToList}
                  className="p-1 hover:bg-blue-600 rounded-full"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex-1 mx-2 truncate font-medium">
                  {selectedStudent?.fullName || "Conversation"}
                </div>
              </>
            ) : (
              <div className="font-medium">Student Messages</div>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-blue-600 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            {showConversation ? (
              // Conversation view
              <ConversationView
                messages={messages}
                studentName={selectedStudent?.fullName || "Student"}
              />
            ) : (
              // Conversations list
              <ConversationsList
                conversations={conversations}
                onSelectStudent={handleSelectStudent}
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Message input (only shown in conversation view) */}
          {showConversation && (
            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t flex items-center"
            >
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 py-2 px-3 border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className={`ml-2 p-2 rounded-full ${
                  !message.trim() || isLoading
                    ? "bg-gray-200 text-gray-400"
                    : "bg-gradient-to-br from-blue-500 to-blue-400 text-white hover:bg-blue-600"
                }`}
              >
                <Send size={16} className="rotate-90" />
              </button>
            </form>
          )}
        </div>
      )}
    </>
  );
};

// Component for conversation list
const ConversationsList: React.FC<{
  conversations: Conversation[];
  onSelectStudent: (student: User) => void;
  isLoading: boolean;
}> = ({ conversations, onSelectStudent, isLoading }) => {
  if (isLoading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="mb-2 text-blue-500">
          <MessageCircle size={40} />
        </div>
        <p className="text-gray-600">No conversations yet</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-200">
      {conversations.map((conversation) => (
        <li
          key={conversation.partner.id}
          onClick={() => onSelectStudent(conversation.partner)}
          className={`p-3 hover:bg-gray-100 cursor-pointer flex items-start ${
            conversation.unreadCount > 0 ? "bg-blue-50" : ""
          }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white">
            {conversation.partner.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {conversation.partner.fullName}
              </h3>
              {conversation.lastMessage && (
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {formatDistanceToNow(
                    new Date(conversation.lastMessage.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 truncate">
              {conversation.lastMessage
                ? conversation.lastMessage.isFromUser
                  ? `You: ${conversation.lastMessage.content}`
                  : conversation.lastMessage.content
                : "No messages yet"}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-bold bg-red-500 text-white rounded-full shadow-md border-2 border-white">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

// Component for conversation view
const ConversationView: React.FC<{
  messages: Message[];
  studentName: string;
}> = ({ messages, studentName }) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <div className="mb-2 text-blue-500">
          <MessageCircle size={40} />
        </div>
        <p className="text-gray-600">No messages yet</p>
        <p className="text-xs text-gray-500 mt-1">
          Start a conversation with {studentName}
        </p>
      </div>
    );
  }

  // Group messages by date
  const groupedMessages: { [key: string]: Message[] } = {};

  [...messages]
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    .forEach((message) => {
      const date = new Date(message.createdAt).toLocaleDateString();
      if (!groupedMessages[date]) {
        groupedMessages[date] = [];
      }
      groupedMessages[date].push(message);
    });

  return (
    <div className="p-4 space-y-4">
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/*  */}
          <div className="space-y-2">
            {dateMessages.map((message) => {
              const isAdmin =
                message.isFromUser !== undefined
                  ? message.isFromUser
                  : message.sender.role === "ADMIN";

              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isAdmin ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[75%] px-3 py-2 rounded-lg ${
                      isAdmin
                        ? "bg-gradient-to-br from-blue-500 to-blue-400 text-white rounded-br-none shadow-sm"
                        : "bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                    <p
                      className={`text-[10px] mt-1 text-right ${
                        isAdmin ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default GlobalChat;
