import { z } from 'zod';

// SenderType enum schema (matches Prisma schema)
export const senderTypeEnum = z.enum(['USER', 'STUDENT', 'SENDER', 'RECEIVER']);

// MessageStatus enum schema (matches Prisma schema)
export const messageStatusEnum = z.enum([
  'SENT',
  'DELIVERED',
  'READ',
  'FAILED',
]);

// Schema for sending a chat message
export const sendChatMessageSchema = z.object({
  content: z.string().optional(), // Optional for WebSocket messages
  senderId: z.string().uuid({ message: 'Sender ID must be a valid UUID' }),
  senderType: senderTypeEnum,
  recipientId: z
    .string()
    .uuid({ message: 'Recipient ID must be a valid UUID' }),
  attachments: z.array(z.string()).optional(), // Array of attachment URLs or identifiers
  recipientType: senderTypeEnum,
  conversationId: z
    .string()
    .min(1, { message: 'Conversation ID is required' })
    .optional(),
  status: messageStatusEnum.optional().default('SENT'),
});

// Schema for getting chat history between two users
export const getChatHistorySchema = z.object({
  participantId: z
    .string()
    .uuid({ message: 'Participant ID must be a valid UUID' }),
  participantType: senderTypeEnum,
  conversationId: z.string().optional(),
  limit: z.coerce.number().int().positive().optional().default(50),
  cursor: z.string().optional(),
});

// Schema for marking messages as read
export const markMessagesReadSchema = z.object({
  messageId: z.string().uuid({ message: 'Message ID must be a valid UUID' }),
  participantId: z
    .string()
    .uuid({ message: 'Participant ID must be a valid UUID' }),
});

// Schema for getting unread message count
export const getUnreadCountSchema = z.object({
  participantId: z
    .string()
    .uuid({ message: 'Participant ID must be a valid UUID' }),
  participantType: senderTypeEnum,
});

// Schema for deleting a chat message
export const deleteChatMessageSchema = z.object({
  messageId: z.string().uuid({ message: 'Message ID must be a valid UUID' }),
});

// Schema for WebSocket chat message
export const webSocketChatMessageSchema = z.object({
  type: z.literal('chat').optional(),
  content: z.string().optional(),
  recipientId: z
    .string()
    .uuid({ message: 'Recipient ID must be a valid UUID' }),
  recipientType: senderTypeEnum,
  senderId: z.string().uuid({ message: 'Sender ID must be a valid UUID' }),
  senderType: senderTypeEnum,
  attachments: z.array(z.string()).optional(), // Array of attachment URLs or identifiers
  conversationId: z
    .string()
    .min(1, { message: 'Conversation ID is required' })
    .optional(),
});

// Schema for updating message status
export const updateMessageStatusSchema = z.object({
  status: messageStatusEnum,
});

// Schema for chat message response
export const chatMessageResponseSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  senderId: z.string().uuid(),
  senderType: senderTypeEnum,
  recipientId: z.string().uuid(),
  recipientType: senderTypeEnum,
  conversationId: z.string().nullable(),
  status: messageStatusEnum,
  isRead: z.boolean(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Export types
export type SenderType = z.infer<typeof senderTypeEnum>;
export type MessageStatus = z.infer<typeof messageStatusEnum>;
export type ChatMessageResponse = z.infer<typeof chatMessageResponseSchema>;
