// src/components/messages/MessageComposer.tsx
import React, { useState, useRef, useEffect } from "react";
import { User } from "@/redux/features/messagesSlice";
import { Send, Paperclip, Smile } from "lucide-react";

interface MessageComposerProps {
  student: User;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const MessageComposer: React.FC<MessageComposerProps> = ({
  student,
  onSendMessage,
  isLoading,
}) => {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "40px";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [message]);

  // Handle keyboard submit (Ctrl/Cmd + Enter)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (message.trim()) {
        onSendMessage(message.trim());
        setMessage("");
        e.preventDefault();
      }
    }
  };

  return (
    <div className="bg-white border-t px-4 py-3">
      <form onSubmit={handleSubmit} className="flex items-end">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 mr-2"
          title="Attach file (coming soon)"
          onClick={() => alert("File attachments coming soon!")}
        >
          <Paperclip size={20} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="message"
            name="message"
            rows={1}
            className="w-full border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-full py-2 px-4 resize-none overflow-hidden"
            placeholder={`Message ${student.fullName}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            style={{ maxHeight: "120px" }}
          />
          <button
            type="button"
            className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            title="Emojis (coming soon)"
          >
            <Smile size={20} />
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading || !message.trim()}
          className={`ml-2 rounded-full p-2 ${
            isLoading || !message.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          <Send size={20} className="rotate-90" />
        </button>
      </form>
      <div className="text-xs text-gray-500 mt-1 text-center">
        Press Ctrl+Enter to send
      </div>
    </div>
  );
};

export default MessageComposer;
