export interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTimestamp?: Date;
}

export interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  isTyping?: boolean;
}

export interface User {
  uid: string;
  displayName?: string;
  email?: string;
}