// component/MessageList.tsx
import { Message, User } from "@/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/context/Auth.Context";

interface MessageListProps {
  messages: Message[];
  selectedUser: User | null;
}

export default function MessageList({
  messages,
  selectedUser,
}: MessageListProps) {
  const { user } = useAuth();

  return (
    <ScrollArea className="h-64 border border-gray-300 dark:border-gray-600 p-4 rounded-md bg-gray-100 dark:bg-gray-700">
      {messages && messages.length > 0 ? (
        messages.map((msg) => (
          <div
            key={msg._id}
            className={`mb-2 p-2 rounded-md ${
              msg.sender._id === user?.id
                ? "ml-auto bg-blue-500 text-white"
                : "mr-auto bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-gray-100"
            } max-w-[70%]`}
          >
            <p className="text-sm">
              <strong>{msg.sender.username}</strong> (
              {new Date(msg.createdAt).toLocaleTimeString()})
            </p>
            {msg.content && <p>{msg.content}</p>}
            {msg.sticker && <p className="text-lg">{msg.sticker}</p>}
          </div>
        ))
      ) : (
        <p className="text-gray-600 dark:text-gray-400">
          {selectedUser
            ? "No messages yet."
            : "Select a user to start chatting."}
        </p>
      )}
    </ScrollArea>
  );
}
