"use client";

import { useState } from "react";
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

  const [showUserList, setShowUserList] = useState(false);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }
  console.log(users, "userss");
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        Please login
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-[calc(100vh-64px)] flex flex-col p-2 sm:p-4">
        {/* Mobile "Show Users" button */}
        <div className="sm:hidden sticky top-[64px] z-20 bg-white dark:bg-gray-900 px-2 py-2 flex items-center justify-between border-b dark:border-gray-700">
          <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400 text-base font-medium">
            <MessageSquare className="w-5 h-5" />
            <span>ChatApp - {user.username}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUserList(true)}
              className="bg-blue-500 text-white text-sm px-3 py-1 rounded"
            >
              Users
            </button>

            {user?.dp && (
              <img
                src={user?.dp}
                alt={user.username}
                className="w-9 h-9 rounded-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Mobile Slide-in UserList Overlay */}
        {showUserList && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 sm:hidden">
            <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white dark:bg-gray-900 p-4 shadow-lg">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-blue-500 dark:text-blue-400">
                  Users
                </h2>
                <button
                  onClick={() => setShowUserList(false)}
                  className="text-sm text-red-500"
                >
                  Close
                </button>
              </div>
              <div className="overflow-y-auto max-h-[80vh]">
                <UserList
                  users={users}
                  selectedUser={selectedUser}
                  setSelectedUser={(user) => {
                    selectUser(user);
                    setShowUserList(false);
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main Chat Card */}
        <Card className="flex flex-col h-full overflow-hidden">
          {/* Desktop-only Header */}
          <CardHeader className="sticky top-[32px] mt-4 hidden md:block  z-30 bg-white dark:bg-gray-900">
            <CardTitle className="text-lg sm:text-2xl flex items-center justify-between text-blue-500 dark:text-blue-400">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>ChatApp - {user.username}</span>
              </div>
              {user?.dp && (
                <img
                  src={user?.dp}
                  alt={user.username}
                  className="w-9 h-9 rounded-full object-cover"
                />
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden">
            {/* Desktop UserList */}
            <div className="hidden sm:block sm:w-1/3 h-full overflow-y-auto border-r dark:border-gray-700">
              <UserList
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={selectUser}
              />
            </div>

            {/* Chat Area */}
            <div className="w-full sm:w-2/3 flex flex-col h-full overflow-hidden">
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
