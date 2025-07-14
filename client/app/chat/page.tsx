"use client";

import { ChatWindow } from "@/components/ChatWindow";
import { Message } from "@/types";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const currentUser = "User1"; // Replace with actual user logic

  const handleSend = (content: string, sticker?: string) => {
    const newMessage: Message = {
      id: uuidv4(),
      sender: currentUser,
      content,
      sticker,
      timestamp: new Date(),
    };
    setMessages([...messages, newMessage]);
  };

  return (
    <main className="container mx-auto p-4 h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-4">Chat App</h1>
      <ChatWindow
        messages={messages}
        onSend={handleSend}
        currentUser={currentUser}
      />
    </main>
  );
}
