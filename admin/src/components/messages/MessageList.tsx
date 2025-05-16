import React from "react";
import { User, Message } from "@/redux/features/messagesSlice";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  messages: Message[];
  onSelectContact: (user: User) => void;
  onMarkAsRead: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onSelectContact,
  onMarkAsRead,
}) => {
  // Group messages by unique contacts (sender for received messages)
  const uniqueContacts = React.useMemo(() => {
    const contactMap = new Map<
      string,
      { user: User; latestMessage: Message }
    >();

    messages.forEach((message) => {
      const contact =
        message.direction === "received" ? message.sender : message.recipient;
      const existingContact = contactMap.get(contact.id);

      // If contact doesn't exist yet or this message is newer
      if (
        !existingContact ||
        new Date(message.createdAt) >
          new Date(existingContact.latestMessage.createdAt)
      ) {
        contactMap.set(contact.id, {
          user: contact,
          latestMessage: message,
        });
      }
    });

    return Array.from(contactMap.values());
  }, [messages]);

  // Handle contact click
  const handleContactClick = (contact: {
    user: User;
    latestMessage: Message;
  }) => {
    onSelectContact(contact.user);

    // If the latest message is unread and received, mark it as read
    if (
      !contact.latestMessage.isRead &&
      contact.latestMessage.direction === "received"
    ) {
      onMarkAsRead(contact.latestMessage.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-indigo-600 text-white">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>

      {uniqueContacts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">No messages found</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {uniqueContacts.map((contact) => (
            <li
              key={contact.user.id}
              onClick={() => handleContactClick(contact)}
              className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${
                !contact.latestMessage.isRead &&
                contact.latestMessage.direction === "received"
                  ? "bg-blue-50"
                  : ""
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900 flex items-center">
                    {contact.user.fullName}
                    {!contact.latestMessage.isRead &&
                      contact.latestMessage.direction === "received" && (
                        <span className="ml-2 w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                      )}
                  </h3>
                  <p className="text-sm text-gray-500">{contact.user.email}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(
                    new Date(contact.latestMessage.createdAt),
                    { addSuffix: true }
                  )}
                </span>
              </div>
              <p className="mt-1 text-sm text-gray-600 truncate">
                {contact.latestMessage.direction === "sent" ? "You: " : ""}
                {contact.latestMessage.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MessageList;
