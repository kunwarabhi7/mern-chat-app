import { Message } from "@/types";
import { MessageBubble } from "./MessageBubble";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useRef } from "react";

interface ChatWindowProps {
  messages: Message[];
  onSend: (content: string, sticker?: string) => void;
  currentUser: string;
}

export function ChatWindow({ messages, onSend, currentUser }: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <ScrollArea className="flex-1 p-4">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.sender === currentUser}
          />
        ))}
      </ScrollArea>
      <ChatInput onSend={onSend} />
    </div>
  );
}
