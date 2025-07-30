"use client";

import { useState, useEffect, useRef } from "react";
import { MessageInputProps, User } from "@/types";
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
    if (!user?.id || !selectedUser?.id || !messageInput.trim()) {
      console.log("Submit skipped:", {
        userId: user?.id,
        selectedUserId: selectedUser?.id,
        messageInput,
      });
      return;
    }
    console.log("Submitting message:", messageInput);
    onSendMessage(messageInput);
    setMessageInput("");
    console.log("Emitting stopTyping:", {
      senderId: user.id,
      recipientId: selectedUser.id,
    });
    socket?.emit("stopTyping", {
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
    });
  };

  const handleEmojiClick = (emojiData: { emoji: string }) => {
    if (!user?.id || !selectedUser?.id) {
      console.log("Emoji click skipped:", {
        userId: user?.id,
        selectedUserId: selectedUser?.id,
      });
      return;
    }
    console.log("Selected emoji:", emojiData.emoji);
    onSendMessage("", emojiData.emoji);
    setShowStickerPicker(false);
    console.log("Emitting stopTyping:", {
      senderId: user.id,
      recipientId: selectedUser.id,
    });
    socket?.emit("stopTyping", {
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
    });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);
    if (!socket || !selectedUser?.id || !user?.id) {
      console.log("Typing event skipped:", {
        socket: !!socket,
        selectedUserId: selectedUser?.id,
        userId: user?.id,
      });
      return;
    }

    console.log("Emitting typing:", {
      senderId: user.id,
      recipientId: selectedUser.id,
    });
    socket.emit("typing", {
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      console.log("Emitting stopTyping:", {
        senderId: user.id,
        recipientId: selectedUser.id,
      });
      socket.emit("stopTyping", {
        senderId: String(user.id),
        recipientId: String(selectedUser.id),
      });
    }, 2000);
  };

  useEffect(() => {
    console.log("MessageInput render:", {
      userId: user?.id,
      selectedUserId: selectedUser?.id,
    });
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [showStickerPicker, user?.id, selectedUser?.id]);

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
          disabled={!selectedUser?.id || !user?.id}
          autoComplete="off"
        />
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowStickerPicker(!showStickerPicker)}
            disabled={!selectedUser?.id || !user?.id}
            className="text-blue-500 dark:text-blue-400"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </motion.div>
        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
          <Button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base"
            disabled={!selectedUser?.id || !user?.id || !messageInput.trim()}
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
