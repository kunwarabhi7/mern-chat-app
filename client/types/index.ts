import { Socket } from "socket.io-client";

export interface User {
  id: string; // Single ID field
  username: string;
  email: string;
  isOnline?: boolean;
  dp?: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  error: string | null;
  signup: (username: string, email: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  getAllUsers: () => Promise<User[]>;
  updateProfilePhoto: (base64Image: string) => Promise<void>;
}

export interface Message {
  _id: string;
  sender: {
    dp: string;
    _id: string; // Backend uses `_id`
    username: string;
  };
  recipient: {
    _id: string;
    username: string;
  };
  content?: string;
  sticker?: string;
  createdAt: string;
  dp?: string | null;
}

export interface MessageListProps {
  messages: Message[];
  selectedUser: User | null;
  typingUser: string | null;
}

export interface ChatContextType {
  users: User[];
  selectedUser: User | null;
  messages: Message[];
  typingUser: string | null;
  selectUser: (user: User | null) => void;
  sendMessage: (content: string, sticker?: string) => void;
  socket: Socket | null;
}

export interface MessageInputProps {
  selectedUser: User | null;
  onSendMessage: (content: string, sticker?: string) => void;
  socket: Socket | null;
}

export interface UserListProps {
  users: User[];
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
}
