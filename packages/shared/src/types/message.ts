import { z } from 'zod';
import { sendMessageSchema } from '../schemas/message.schema';

export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export interface ConversationResponse {
  id: string;
  participant: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  lastMessage: {
    content: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  createdAt: string;
}

export interface MessageResponse {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readAt: string | null;
  createdAt: string;
}
