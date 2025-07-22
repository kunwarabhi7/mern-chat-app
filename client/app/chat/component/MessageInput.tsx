// app/chat/component/MessageInput.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/Auth.Context";
import { Socket } from "socket.io-client";

const EmojiPicker = dynamic(
  () => import("emoji-picker-react").then((mod) => mod.default),
  { ssr: false }
);

interface MessageInputProps {
  selectedUser: User | null;
  onSendMessage: (content: string, sticker?: string) => void;
  socket: Socket | null; // Add socket prop
}

export default function MessageInput({
  selectedUser,
  onSendMessage,
  socket,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  };

  const pickerVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      console.log("Submitting message:", messageInput);
      onSendMessage(messageInput);
      setMessageInput("");
      // Emit stopTyping when message is sent
      if (user && selectedUser) {
        socket?.emit("stopTyping", {
          senderId: user.id,
          recipientId: selectedUser.id,
        });
      }
    }
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    console.log("Selected sticker:", emojiData.emoji);
    onSendMessage("", emojiData.emoji);
    setShowStickerPicker(false);
    // Emit stopTyping when sticker is sent
    if (user && selectedUser) {
      socket?.emit("stopTyping", {
        senderId: user.id,
        recipientId: selectedUser.id,
      });
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);
    if (!user || !selectedUser) return;

    // Emit typing event
    socket?.emit("typing", { senderId: user.id, recipientId: selectedUser.id });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to emit stopTyping after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket?.emit("stopTyping", {
        senderId: user.id,
        recipientId: selectedUser.id,
      });
    }, 2000);
  };

  useEffect(() => {
    console.log("Sticker picker visible:", showStickerPicker);
    // Cleanup timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [showStickerPicker]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative z-10 p-2 bg-white dark:bg-gray-800 min-h-[60px]"
    >
      <form onSubmit={handleSubmit} className="flex space-x-2 items-center">
        <Input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={handleTyping}
          className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm sm:text-base"
          disabled={!selectedUser}
        />
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            disabled={!selectedUser}
            className="text-blue-500 dark:text-blue-400"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base"
            disabled={!selectedUser || !messageInput.trim()}
          >
            Send
          </Button>
        </motion.div>
      </form>
      <AnimatePresence>
        {showStickerPicker && (
          <motion.div
            variants={pickerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="absolute bottom-16 left-0 right-0 mx-auto max-w-[280px] sm:max-w-[320px] z-20"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="auto"
              previewConfig={{ showPreview: false }}
              skinTonePickerLocation="SEARCH"
              emojiStyle="native"
              width="100%"
              height={350}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
