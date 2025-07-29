"use client";
import { Message, User } from "@/types";
import { useAuth } from "@/context/Auth.Context";
import { useEffect, useRef } from "react";

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
  const lastMessageRef = useRef<HTMLDivElement | null>(null);
  const typingRef = useRef<HTMLParagraphElement | null>(null);

  useEffect(() => {
    if (messages.length > 0) {
      lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
    } else if (typingRef.current) {
      typingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingUser]);

  return (
    <div className="flex flex-col gap-2 px-2 py-4 sm:px-4 overflow-y-auto">
      {messages.length > 0 ? (
        messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <div
              key={msg._id}
              ref={isLast ? lastMessageRef : null}
              className={`p-2 sm:p-3 rounded-md break-words w-fit max-w-[85%] sm:max-w-[70%] text-sm sm:text-base ${
                String(msg.sender._id) === String(user?.id)
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200 dark:bg-gray-600 text-black dark:text-white"
              }`}
            >
              <p
                className={`${
                  msg.sticker ? "text-3xl" : "text-sm sm:text-base"
                }`}
              >
                {msg.content?.trim() || msg.sticker}
              </p>
            </div>
          );
        })
      ) : (
        <p className="text-xs sm:text-sm text-center text-gray-400">
          No messages yet.
        </p>
      )}

      {typingUser &&
        selectedUser &&
        String(typingUser) === String(selectedUser.id) && (
          <p
            ref={typingRef}
            className="text-sm italic text-gray-500 px-2 sm:px-4"
          >
            {selectedUser.username} is typing...
          </p>
        )}
    </div>
  );
}
