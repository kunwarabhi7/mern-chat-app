// app/chat/component/MessageInput.tsx
"use client";

import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";

interface MessageInputProps {
  selectedUser: User | null;
  onSendMessage: (content: string) => void;
}

export default function MessageInput({
  selectedUser,
  onSendMessage,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");

  // Animation variants
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log("Submitting message:", messageInput);
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => {
            console.log("Typing:", e.target.value);
            setMessageInput(e.target.value);
          }}
          className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          disabled={!selectedUser}
        />
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            disabled={!selectedUser || !messageInput.trim()}
          >
            Send
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
}
