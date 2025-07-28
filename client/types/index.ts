export interface User {
  id: string; // Single ID field
  username: string;
  email: string;
  isOnline?: boolean;
  dp?: string | null;
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
