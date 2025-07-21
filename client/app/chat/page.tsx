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

export default function ChatPage() {
  const {
    user,
    loading: authLoading,
    error: authError,
    clearError,
  } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  // Initialize Socket.IO
  useEffect(() => {
    if (!user) return;

    const socket = io("http://localhost:5000", { withCredentials: true });
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
      }
    });

    socket.on("connect_error", (err) => {
      console.error("Socket.IO connection error:", err.message);
      setError("Failed to connect to chat server");
    });

    return () => {
      socket.disconnect();
      socket.off("receiveMessage");
      socket.off("connect_error");
      console.log("Socket.IO disconnected");
    };
  }, [user, selectedUser]);

  // Fetch users
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

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) return;
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/message/${selectedUser.id}`);
        console.log("Fetched messages:", data.messages);
        setMessages(data.messages || []); // Ensure messages is an array
      } catch (err: any) {
        console.error("Error fetching messages:", err.message);
        setError(err.response?.data?.message || "Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [selectedUser]);

  const handleSendMessage = (content: string) => {
    if (!selectedUser || !user || !content.trim()) return;
    try {
      setError(null);
      const messageData = {
        senderId: user.id,
        recipientId: selectedUser.id,
        content,
        sticker: null,
      };
      console.log("Sending message:", messageData);
      socketRef.current?.emit("sendMessage", messageData);
    } catch (err: any) {
      console.error("Error sending message:", err.message);
      setError("Failed to send message");
    }
  };

  if (authLoading || loading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto p-4 text-center">Please log in</div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-4 bg-gray-50 dark:bg-gray-900">
        <Card className="bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-500 dark:text-blue-400">
              Chat
            </CardTitle>
            <p className="text-gray-700 dark:text-gray-300">
              Welcome, {user.username}!
            </p>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="w-full md:w-1/4">
              <UserList
                users={users}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
              />
            </div>
            <div className="w-full md:w-3/4 space-y-4">
              {(authError || error) && (
                <p key={authError || error} className="text-red-500">
                  {authError || error}
                </p>
              )}
              <MessageList messages={messages} selectedUser={selectedUser} />
              <MessageInput
                selectedUser={selectedUser}
                onSendMessage={handleSendMessage}
              />
              <p className="mt-4 text-center">
                View your{" "}
                <a href="/profile" className="text-blue-500 hover:underline">
                  Profile
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
