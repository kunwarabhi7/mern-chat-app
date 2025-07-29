"use client";

import { useAuth } from "@/context/Auth.Context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useChat } from "@/context/Chat.Context";
import UserList from "./component/UserList";
import MessageList from "./component/MessageList";
import MessageInput from "./component/MessageInput";
import { MessageSquare } from "lucide-react";

export default function Chat() {
  const { user, loading: authLoading } = useAuth();
  const {
    users,
    selectedUser,
    messages,
    typingUser,
    selectUser,
    sendMessage,
    socket,
  } = useChat();

  console.log("users in Chat", users);
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Please login
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex mt-2 flex-col bg-gray-100 dark:bg-gray-900 p-2 sm:p-4">
        <Card className="flex flex-col h-full overflow-hidden">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl flex items-center justify-between text-blue-500 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>ChatApp - {user.username}</span>
              </div>
              <img
                src={
                  user.dp
                    ? `http://localhost:5000${user.dp}`
                    : "/images/default-dp.png"
                }
                alt={user.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden">
            <div className="sm:w-1/3 w-full border-b sm:border-b-0 sm:border-r dark:border-gray-700 overflow-y-auto sm:max-h-full">
              <UserList
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={selectUser}
              />
            </div>

            <div className="sm:w-2/3 w-full flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <MessageList
                  messages={messages}
                  selectedUser={selectedUser}
                  typingUser={typingUser}
                />
              </div>
              <div className="border-t dark:border-gray-700">
                <MessageInput
                  selectedUser={selectedUser}
                  onSendMessage={sendMessage}
                  socket={socket}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
