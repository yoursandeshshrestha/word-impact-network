import React from "react";
import { User, Message } from "@/redux/features/messagesSlice";
import { formatDistanceToNow } from "date-fns";
import { Circle, UserCircle } from "lucide-react";

interface StudentListProps {
  messages: Message[];
  onSelectStudent: (user: User) => void;
  onMarkAsRead: (messageId: string) => void;
  currentUserId: string;
  selectedStudentId?: string;
}

const StudentList: React.FC<StudentListProps> = ({
  messages,
  onSelectStudent,
  onMarkAsRead,
  selectedStudentId,
}) => {
  // Group messages by student - looking for STUDENT users only
  const studentContacts = React.useMemo(() => {
    const studentMap = new Map<
      string,
      { student: User; latestMessage: Message }
    >();

    messages.forEach((message) => {
      // Determine the student in this message (either sender or recipient)
      let student: User | null = null;

      if (message.sender.role === "STUDENT") {
        student = message.sender;
      } else if (message.recipient.role === "STUDENT") {
        student = message.recipient;
      }

      // Skip if no student found in this message
      if (!student) {
        return;
      }

      const existingStudent = studentMap.get(student.id);

      // If student doesn't exist yet or this message is newer
      if (
        !existingStudent ||
        new Date(message.createdAt) >
          new Date(existingStudent.latestMessage.createdAt)
      ) {
        studentMap.set(student.id, {
          student,
          latestMessage: message,
        });
      }
    });

    // Sort by latest message (newest first)
    return Array.from(studentMap.values()).sort(
      (a, b) =>
        new Date(b.latestMessage.createdAt).getTime() -
        new Date(a.latestMessage.createdAt).getTime()
    );
  }, [messages]);

  // Handle student click
  const handleStudentClick = (contact: {
    student: User;
    latestMessage: Message;
  }) => {
    onSelectStudent(contact.student);

    // If the latest message is unread and from student to admin, mark it as read
    if (
      !contact.latestMessage.isRead &&
      contact.latestMessage.sender.role === "STUDENT" &&
      contact.latestMessage.recipient.role === "ADMIN"
    ) {
      onMarkAsRead(contact.latestMessage.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
      <div className="p-3 bg-gray-50 border-b">
        <h2 className="text-lg font-semibold text-gray-800">Conversations</h2>
      </div>

      <div className="overflow-y-auto flex-1">
        {studentContacts.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No conversations with students
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {studentContacts.map((contact) => {
              // Determine if the latest message is unread and from student to admin
              const isUnread =
                !contact.latestMessage.isRead &&
                contact.latestMessage.sender.role === "STUDENT" &&
                contact.latestMessage.recipient.role === "ADMIN";

              // Determine message preview text with sender prefix
              const isFromAdmin = contact.latestMessage.sender.role === "ADMIN";
              const messagePreview = isFromAdmin
                ? `You: ${contact.latestMessage.content}`
                : contact.latestMessage.content;

              const isSelected = selectedStudentId === contact.student.id;

              return (
                <li
                  key={contact.student.id}
                  onClick={() => handleStudentClick(contact)}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-colors duration-150 
                    ${
                      isSelected
                        ? "bg-indigo-50"
                        : isUnread
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                >
                  <div className="relative mr-3 flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                      <UserCircle size={32} />
                    </div>
                    {isUnread && (
                      <Circle
                        size={10}
                        fill="#3b82f6"
                        className="absolute top-0 right-0 text-blue-500"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {contact.student.fullName}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDistanceToNow(
                          new Date(contact.latestMessage.createdAt),
                          { addSuffix: true }
                        )}
                      </span>
                    </div>
                    <p
                      className={`text-sm truncate ${
                        isUnread ? "font-medium text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {messagePreview}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentList;
