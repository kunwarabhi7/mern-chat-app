"use client";

import { createContext, useContext, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAuth } from "./Auth.Context";
import { User, Message } from "@/types";

interface ChatContextType {
  users: User[];
  selectedUser: User | null;
  messages: Message[];
  typingUser: string | null;
  selectUser: (user: User | null) => void;
  sendMessage: (content: string, sticker?: string) => void;
  socket: Socket | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, getAllUsers, setUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const api = axios.create({
    baseURL: "http://localhost:5000/api",
    withCredentials: true,
  });

  // Socket setup
  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID, skipping socket setup");
      return;
    }

    const socket = io("http://localhost:5000", {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      socket.emit("join", String(user.id));
      console.log("Emitted join:", user.id);
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("reconnect", (attempt) => {
      console.log("Socket reconnected after attempt:", attempt);
      socket.emit("join", String(user.id));
      console.log("Emitted join on reconnect:", user.id);
    });

    socket.on("receiveMessage", (newMessage: Message) => {
      console.log("Received message:", newMessage);
      console.log("Checking condition:", {
        senderId: newMessage.sender._id,
        userId: user.id,
        recipientId: newMessage.recipient._id,
        selectedUserId: selectedUser?.id,
      });
      const senderId = String(newMessage.sender._id);
      const recipientId = String(newMessage.recipient._id);
      const userId = String(user.id);
      const selectedUserId = String(selectedUser?.id);

      if (
        (senderId === userId && recipientId === selectedUserId) ||
        (senderId === selectedUserId && recipientId === userId)
      ) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === newMessage._id)) {
            console.log("Duplicate message skipped:", newMessage._id);
            return prev;
          }
          const updatedMessages = [...prev, newMessage];
          console.log("Updated messages:", updatedMessages);
          return updatedMessages;
        });
        setTypingUser(null);
      } else {
        console.log("Message skipped, condition not met");
      }
    });

    socket.on("onlineUsers", (onlineUserIds: string[]) => {
      console.log("Online users:", onlineUserIds);
      setUsers((prev) =>
        prev.map((u) => ({ ...u, isOnline: onlineUserIds.includes(u.id) }))
      );
    });

    socket.on("typing", ({ senderId }) => {
      console.log(
        "Typing event from:",
        senderId,
        "Selected user ID:",
        selectedUser?.id
      );
      if (String(senderId) === String(selectedUser?.id)) {
        setTypingUser(senderId);
      }
    });

    socket.on("stopTyping", ({ senderId }) => {
      console.log("Stop typing event from:", senderId);
      if (String(senderId) === String(selectedUser?.id)) {
        setTypingUser(null);
      }
    });

    socket.on("error", (data) => {
      console.error("Socket error:", data.message);
    });

    socket.on("userUpdated", (updatedUser) => {
      console.log("Received userUpdated event:", updatedUser);
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
      console.log("Socket disconnected");
    };
  }, [user?.id, setUser]);

  // Fetch users
  useEffect(() => {
    if (!user?.id) {
      console.log("No user ID, skipping fetch users");
      return;
    }
    let isMounted = true;

    const fetchUsers = async () => {
      try {
        const fetchedUsers = await getAllUsers();
        if (isMounted) {
          console.log("Fetched users:", fetchedUsers);
          setUsers(fetchedUsers);
        }
      } catch (err: any) {
        console.error("Fetch users error:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
        });
        if (isMounted) {
          setUsers([]);
        }
      }
    };
    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [user?.id, getAllUsers]);

  // Fetch messages
  useEffect(() => {
    if (!selectedUser?.id) {
      console.log("No selected user ID, skipping fetch messages");
      return;
    }
    let isMounted = true;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await api.get(`/message/${selectedUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (isMounted) {
          console.log("Fetched messages:", data.messages);
          setMessages(data.messages || []);
        }
      } catch (err: any) {
        console.error("Fetch messages error:", err);
      }
    };
    fetchMessages();

    return () => {
      isMounted = false;
    };
  }, [selectedUser?.id]);

  const sendMessage = (content: string, sticker?: string) => {
    if (!selectedUser?.id || !user?.id || (!content?.trim() && !sticker)) {
      console.log("Send message skipped:", {
        selectedUserId: selectedUser?.id,
        userId: user?.id,
        content,
        sticker,
      });
      return;
    }
    console.log("Sending message:", {
      content,
      sticker,
      senderId: user.id,
      recipientId: selectedUser.id,
    });
    socketRef.current?.emit("sendMessage", {
      senderId: String(user.id),
      recipientId: String(selectedUser.id),
      content,
      sticker: sticker || null,
    });
  };

  const selectUser = (user: User | null) => {
    console.log("Selected user:", user);
    setSelectedUser(user);
    setMessages([]); // Clear messages when selecting new user
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
