export interface User {
  id: string;
  username: string;
  email: string;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  sender: { _id: string; username: string };
  recipient: { _id: string; username: string };
  content?: string;
  sticker?: string;
  createdAt: string;
}

export interface MessageListProps {
  messages: Message[];
  selectedUser: { id: string; username: string } | null;
}
