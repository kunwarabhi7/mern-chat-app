export interface User {
  id: string;
  username: string;
  email: string;
  isOnline?: boolean;
  dp?: string | null;
}

export interface Message {
  _id: string;
  sender: { _id: string; username: string };
  recipient: { _id: string; username: string };
  content?: string;
  sticker?: string;
  createdAt: string;
  dp?: string | null;
}

export interface MessageListProps {
  messages: Message[];
  selectedUser: { id: string; username: string } | null;
}
