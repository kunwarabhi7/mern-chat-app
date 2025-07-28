"use client";
import { Message, User } from "@/types";
import { useAuth } from "@/context/Auth.Context";

interface MessageListProps {
  messages: Message[];
  selectedUser: User | null;
  typingUser: string | null;
}

export default function MessageList({
  messages,
  selectedUser,
  typingUser,
}: MessageListProps) {
  const { user } = useAuth();
  console.log("typingUser:", typingUser);
  console.log("selectedUser:", selectedUser);
  console.log(
    "Condition check:",
    typingUser && selectedUser && typingUser === selectedUser.id
  );

  return (
    <div className="flex flex-col gap-2 px-2 py-4 sm:px-4">
      {typingUser && selectedUser && typingUser === selectedUser.id && (
        <p className="text-sm italic text-gray-500">
          {selectedUser.username} is typing...
        </p>
      )}
      {/* Temporary test to confirm rendering */}
      {/* <p className="text-sm italic text-gray-500">Test typing indicator</p> */}

      {messages.length > 0 ? (
        messages.map((msg) => (
          <div
            key={msg._id}
            className={`p-2 sm:p-3 rounded-md break-words w-fit max-w-[85%] sm:max-w-[70%] text-sm sm:text-base ${
              msg.sender._id === user?.id
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-600 text-black dark:text-white"
            }`}
          >
            <p
              className={`${msg.sticker ? "text-3xl" : "text-sm sm:text-base"}`}
            >
              {msg.content?.trim() || msg.sticker}
            </p>
          </div>
        ))
      ) : (
        <p className="text-xs sm:text-sm text-center text-gray-400">
          No messages yet.
        </p>
      )}
    </div>
  );
}
