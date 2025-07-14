import { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { format } from "date-fns";
interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-4`}
    >
      <div className="flex items-start space-x-2 max-w-[70%]">
        {!isOwnMessage && (
          <Avatar>
            <AvatarImage
              src={`https://i.pravatar.cc/150?u=${message.sender}`}
            />
            <AvatarFallback>{message.sender[0]}</AvatarFallback>
          </Avatar>
        )}
        <div
          className={`rounded-lg p-3 ${
            isOwnMessage
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white"
          }`}
        >
          {message.sticker ? (
            <Image src={message.sticker} alt="Sticker" width={80} height={80} />
          ) : (
            <p className="text-sm">{message.content}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {format(new Date(message.timestamp), "h:mm a")}
          </p>
        </div>
      </div>
    </div>
  );
}
