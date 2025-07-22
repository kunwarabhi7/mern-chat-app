// app/chat/component/MessageList.tsx
"use client";

import { Message, User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/Auth.Context";
import { motion } from "framer-motion";

interface MessageListProps {
  messages: Message[];
  selectedUser: User | null;
}

export default function MessageList({
  messages,
  selectedUser,
}: MessageListProps) {
  const { user } = useAuth();

  // Animation variants for messages
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <ScrollArea className="flex-1 h-[50vh] border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-100 dark:bg-gray-700">
      {messages && messages.length > 0 ? (
        messages.map((msg) => (
          <motion.div
            key={msg._id}
            className={`mb-2 p-2 rounded-md ${
              msg.sender._id === user?.id
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            } max-w-[70%]`}
            variants={messageVariants}
            initial="hidden"
            animate="visible"
          >
            <p className="text-xs sm:text-sm">
              <strong>{msg.sender.username}</strong> (
              {new Date(msg.createdAt).toLocaleTimeString()})
            </p>
            {msg.content && <p>{msg.content}</p>}
            {msg.sticker && <p className="text-lg">{msg.sticker}</p>}
          </motion.div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center">
          {selectedUser
            ? "No messages yet."
            : "Select a user to start chatting."}
        </p>
      )}
    </ScrollArea>
  );
}
