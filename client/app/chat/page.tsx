"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/Auth.Context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Message, User } from "@/types";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import UserList from "./component/UserList";
import MessageList from "./component/MessageList";
import MessageInput from "./component/MessageInput";
import { MessageSquare } from "lucide-react";

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", { withCredentials: true });
    socketRef.current = socket;

    socket.emit("join", user.id);

    socket.on("receiveMessage", (newMessage: Message) => {
      if (
        (newMessage.sender._id === user.id &&
          newMessage.recipient._id === selectedUser?.id) ||
        (newMessage.sender._id === selectedUser?.id &&
          newMessage.recipient._id === user.id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
        setTypingUser(null);
      }
    });

    socket.on("onlineUsers", (onlineUserIds: string[]) => {
      setUsers((prev) =>
        prev.map((u) => ({ ...u, isOnline: onlineUserIds.includes(u.id) }))
      );
    });

    socket.on("typing", ({ senderId }) => {
      if (senderId === selectedUser?.id) setTypingUser(senderId);
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (senderId === selectedUser?.id) setTypingUser(null);
    });

    return () => {
      socket.disconnect();
    };
  }, [user, selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      const { data } = await api.get("/user/list");
      setUsers(
        data.user.map((u: any) => ({
          id: u._id,
          username: u.username,
          email: u.email,
          dp: u.dp,
          isOnline: false,
        }))
      );
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      const { data } = await api.get(`/message/${selectedUser.id}`);
      setMessages(data.messages || []);
    };
    fetchMessages();
  }, [selectedUser]);

  const handleSendMessage = (content: string, sticker?: string) => {
    if (!selectedUser || !user || (!content.trim() && !sticker)) return;
    socketRef.current?.emit("sendMessage", {
      senderId: user.id,
      recipientId: selectedUser.id,
      content,
      sticker: sticker || null,
    });
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
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
                src={user?.dp}
                alt={user.username}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
              />
            </CardTitle>
          </CardHeader>

          {/* Main Content */}
          <CardContent className="flex-1 flex flex-col sm:flex-row gap-4 overflow-hidden">
            {/* User List */}
            <div className="sm:w-1/3 w-full border-b sm:border-b-0 sm:border-r dark:border-gray-700 overflow-y-auto sm:max-h-full">
              <UserList
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            </div>

            {/* Chat Area */}
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
                  onSendMessage={handleSendMessage}
                  socket={socketRef.current}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
