// app/chat/page.tsx
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
import { motion } from "framer-motion";

export default function ChatPage() {
  const {
    user,
    getAllUsers,
    loading: authLoading,
    error: authError,
  } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [typingUser, setTypingUser] = useState<string | null>(null); // Track typing user
  const socketRef = useRef<Socket | null>(null);
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);
      socket.emit("join", user.id);
    });

    socket.on("receiveMessage", (newMessage: Message) => {
      console.log("Received message:", newMessage);
      if (
        (newMessage.sender._id === user.id &&
          newMessage.recipient._id === selectedUser?.id) ||
        (newMessage.sender._id === selectedUser?.id &&
          newMessage.recipient._id === user.id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
        setTypingUser(null); // Clear typing indicator when message is received
      }
    });

    socket.on("onlineUsers", (onlineUserIds: string[]) => {
      console.log("Online users received:", onlineUserIds);
      setUsers((prevUsers) =>
        prevUsers.map((u) => ({
          ...u,
          isOnline: onlineUserIds.includes(u.id),
        }))
      );
    });

    socket.on("typing", ({ senderId }) => {
      console.log("Typing received from:", senderId);
      if (senderId === selectedUser?.id) {
        setTypingUser(senderId);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      console.log("Stop typing received from:", senderId);
      if (senderId === selectedUser?.id) {
        setTypingUser(null);
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setError("Failed to connect to chat server");
    });

    socket.on("error", (data: { message: string }) => {
      console.error("Socket.IO error:", data.message);
      setError(data.message);
    });

    console.log(users, "userssss");

    return () => {
      socket.disconnect();
      socket.off();
      console.log("Socket.IO disconnected");
    };
  }, [user, selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!user) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/user/list");
        console.log("Fetched users:", data.user);
        setUsers(
          data.user.map((u: any) => ({
            id: u._id,
            username: u.username,
            email: u.email,
            isOnline: false,
            dp: u.dp,
          }))
        );
      } catch (err: any) {
        console.error("Error fetching users:", err.message);
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/message/${selectedUser.id}`);
        console.log("Fetched messages:", data.messages);
        setMessages(data.messages || []);
      } catch (err: any) {
        console.error("Error fetching messages:", err.message);
        setError(err.response?.data?.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const handleSendMessage = (content: string, sticker?: string) => {
    if (!selectedUser || !user || (!content.trim() && !sticker)) return;
    try {
      setError(null);
      const messageData = {
        senderId: user.id,
        recipientId: selectedUser.id,
        content: content || "",
        sticker: sticker || null,
      };
      console.log("Sending message:", messageData);
      socketRef.current?.emit("sendMessage", messageData);
    } catch (err: any) {
      console.error("Error sending message:", err.message);
      setError("Failed to send message");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      console.log("Window size:", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (authLoading || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Please log in
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col items-center justify-start bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8 pt-16">
        <motion.div
          className="w-full max-w-4xl flex-1 flex flex-col"
          initial="hidden"
          animate="visible"
          variants={cardVariants}
        >
          <Card className="bg-white dark:bg-gray-800 shadow-xl flex-1 flex flex-col">
            <CardHeader>
              <CardTitle className="text-blue-500 dark:text-blue-400 text-2xl sm:text-3xl font-bold">
                ChatSphere
              </CardTitle>
              <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                Welcome, {user.username}!
              </p>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              {(authError || error) && (
                <p className="text-red-500 text-center text-sm">
                  {authError || error}
                </p>
              )}
              <div className="w-full md:w-1/3">
                <UserList
                  users={users}
                  selectedUser={selectedUser}
                  setSelectedUser={setSelectedUser}
                />
              </div>
              <div className="w-full md:w-2/3 flex flex-col space-y-4 flex-1">
                <MessageList
                  messages={messages}
                  selectedUser={selectedUser}
                  typingUser={typingUser}
                />
                <div className="sticky bottom-0 bg-white dark:bg-gray-800">
                  <MessageInput
                    selectedUser={selectedUser}
                    onSendMessage={handleSendMessage}
                    socket={socketRef.current}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
