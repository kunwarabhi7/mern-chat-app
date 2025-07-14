import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { StickerPicker } from "./StickerPicker";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (content: string, sticker?: string) => void;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleStickerSelect = (sticker: string) => {
    onSend("", sticker);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center space-x-2 p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700"
    >
      <StickerPicker onSelect={handleStickerSelect} />
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700"
      />
      <Button
        type="submit"
        size="icon"
        className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500 text-white"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
