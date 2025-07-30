"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./Auth.Context";
import { User, Message, ChatContextType } from "@/types";

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, getAllUsers, setUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
  });

  // 📦 Socket setup
  useEffect(() => {
    if (!user?.id) return;
    const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join", String(user.id));
    });

    socket.on("reconnect", () => {
      socket.emit("join", String(user.id));
    });

    socket.on("onlineUsers", (onlineUserIds: string[]) => {
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          isOnline: onlineUserIds.includes(u.id),
        }))
      );
    });

    socket.on("typing", ({ senderId }) => {
      if (String(senderId) === String(selectedUser?.id)) {
        setTypingUser(senderId);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      if (String(senderId) === String(selectedUser?.id)) {
        setTypingUser(null);
      }
    });

    socket.on("userUpdated", (updatedUser) => {
      if (user && String(updatedUser.id) === String(user.id)) {
        setUser({ ...user, dp: updatedUser.dp });
      }
      if (selectedUser && String(updatedUser.id) === String(selectedUser.id)) {
        setSelectedUser({ ...selectedUser, dp: updatedUser.dp });
      }
      setUsers((prev) =>
        prev.map((u) =>
          String(u.id) === String(updatedUser.id)
            ? { ...u, dp: updatedUser.dp }
            : u
        )
      );
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?.id, setUser, selectedUser]);

  // ✅ Typing indicator timeout
  useEffect(() => {
    if (!typingUser) return;
    const timeout = setTimeout(() => {
      setTypingUser(null);
    }, 3000);
    return () => clearTimeout(timeout);
  }, [typingUser]);

  // ✅ Real-time receiveMessage handler
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !user?.id || !selectedUser?.id) return;

    const handleReceiveMessage = (newMessage: Message) => {
      const senderId = String(newMessage.sender._id);
      const recipientId = String(newMessage.recipient._id);
      const userId = String(user.id);
      const selectedUserId = String(selectedUser.id);

      if (
        (senderId === userId && recipientId === selectedUserId) ||
        (senderId === selectedUserId && recipientId === userId)
      ) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        setTypingUser(null);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser?.id, user?.id]);

  // 📥 Fetch users
  useEffect(() => {
    if (!user?.id) return;
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        if (isMounted) setUsers(fetchedUsers);
      } catch (err) {
        if (isMounted) setUsers([]);
      }
    };

    fetchUsers();
    return () => {
      isMounted = false;
    };
  }, [user?.id, getAllUsers]);

  // 📥 Fetch messages when user is selected
  useEffect(() => {
    if (!selectedUser?.id) return;
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/message/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) setMessages(data.messages || []);
      } catch (err) {
        console.error("Fetch messages error:", err);
      }
    };

    fetchMessages();
    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id]);

  // ✉️ Send message
  const sendMessage = (content: string, sticker?: string) => {
    if (!socketRef.current || !selectedUser || !user) return;
    if (!content.trim() && !sticker) return;

    console.log("📤 Emitting sendMessage:", {
      senderId: user.id,
      recipientId: selectedUser.id,
      content,
      sticker,
    });

    socketRef.current.emit("sendMessage", {
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
      content,
      sticker: sticker || null,
    });
  };

  const selectUser = (user: User | null) => {
    setSelectedUser(user);
    setMessages([]);
  };

  return (
    <ChatContext.Provider
      value={{
        users,
        selectedUser,
        messages,
        typingUser,
        selectUser,
        sendMessage,
        socket: socketRef.current,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
