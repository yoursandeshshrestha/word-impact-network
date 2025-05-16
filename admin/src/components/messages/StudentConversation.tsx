// src/components/messages/StudentConversation.tsx
import React from "react";
import { User, Message } from "@/redux/features/messagesSlice";
import { format } from "date-fns";
import { ArrowLeft, UserCircle } from "lucide-react";

interface StudentConversationProps {
  messages: Message[];
  selectedStudent: User;
  onMarkAsRead: (messageId: string) => void;
  onBack?: () => void;
  isMobile?: boolean;
}

const StudentConversation: React.FC<StudentConversationProps> = ({
  messages,
  selectedStudent,
  onMarkAsRead,
  onBack,
  isMobile = false,
}) => {
  const conversationRef = React.useRef<HTMLDivElement>(null);

  // Filter messages that involve the selected student
  const conversationMessages = React.useMemo(() => {
    // Filter to show all messages involving the selected student,
    // regardless of which admin is involved
    return messages
      .filter((msg) => {
        // A message belongs to this conversation if it involves the selected student
        return (
          msg.sender.id === selectedStudent.id ||
          msg.recipient.id === selectedStudent.id
        );
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [messages, selectedStudent.id]);

  // Mark unread messages as read
  React.useEffect(() => {
    conversationMessages.forEach((message) => {
      // Only mark messages as read if they are from the student to any admin
      // and they are currently unread
      if (
        !message.isRead &&
        message.sender.role === "STUDENT" &&
        message.recipient.role === "ADMIN"
      ) {
        onMarkAsRead(message.id);
      }
    });
  }, [conversationMessages, onMarkAsRead]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [conversationMessages]);

  // Format date for message groups
  const formatMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return format(date, "MMMM d, yyyy");
  };

  // Group messages by date
  const groupedMessages = React.useMemo(() => {
    const groups: { [key: string]: Message[] } = {};

    conversationMessages.forEach((message) => {
      const date = new Date(message.createdAt);
      const dateString = date.toDateString();

      if (!groups[dateString]) {
        groups[dateString] = [];
      }

      groups[dateString].push(message);
    });

    return groups;
  }, [conversationMessages]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-3 bg-white border-b flex items-center">
        {isMobile && onBack && (
          <button
            onClick={onBack}
            className="mr-2 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 mr-3">
          <UserCircle size={24} />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-gray-900 truncate">
            {selectedStudent.fullName}
          </h2>
          <p className="text-xs text-gray-500 truncate">
            {selectedStudent.email}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={conversationRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-100"
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        {conversationMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <UserCircle size={40} />
            </div>
            <p className="font-medium">No messages yet</p>
            <p className="text-sm">
              Start the conversation with {selectedStudent.fullName}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedMessages).map(([dateString, messages]) => (
              <div key={dateString} className="space-y-3">
                <div className="flex justify-center">
                  <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                    {formatMessageDate(new Date(dateString))}
                  </div>
                </div>

                {messages.map((message) => {
                  const isAdmin = message.sender.role === "ADMIN";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isAdmin ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isAdmin && (
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 mr-2 self-end">
                          <UserCircle size={18} />
                        </div>
                      )}
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg shadow-sm ${
                          isAdmin
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-xs mt-1 text-right ${
                            isAdmin ? "text-indigo-200" : "text-gray-500"
                          }`}
                        >
                          {format(new Date(message.createdAt), "h:mm a")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentConversation;
