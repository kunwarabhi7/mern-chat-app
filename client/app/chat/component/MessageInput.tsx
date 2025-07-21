import { User } from "@/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface MessageInputProps {
  selectedUser: User | null;
  onSendMessage: (content: string) => void;
}

export default function MessageInput({
  selectedUser,
  onSendMessage,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <Input
        type="text"
        placeholder="Type a message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
        disabled={!selectedUser}
      />
      <Button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white"
        disabled={!selectedUser || !messageInput.trim()}
      >
        Send
      </Button>
    </form>
  );
}
