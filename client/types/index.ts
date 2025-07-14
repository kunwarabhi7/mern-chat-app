export interface Message {
  id: Number;
  sender: string;
  content: string;
  sticker?: string; // Add sticker field
  timestamp: Date;
}

export interface User {
  email: string;
  password: string;
  username?: string;
}
