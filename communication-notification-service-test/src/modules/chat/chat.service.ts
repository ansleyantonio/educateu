import prisma from '../../prismaClient';
import { AppError } from '../../utils/AppError';
import type { ChatMessage } from '@prisma/client';
import type { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';
import type { SenderType, MessageStatus } from '../../schemas/chatSchema';

export interface CreateChatMessageData {
  content: string;
  senderId: string;
  senderType: SenderType;
  recipientId: string;
  recipientType: SenderType;
  conversationId?: string | null;
  attachments?: string[]; // Array of attachment URLs or identifiers
  status?: MessageStatus;
}

export interface ChatMessageWithParticipant extends ChatMessage {
  sender?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    photo?: string | null;
  };
  recipient?: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    photo?: string | null;
  };
}

export interface ChatHistoryParams {
  participantId: string;
  participantType: SenderType;
  conversationId?: string | null;
  limit?: number;
  cursor?: string | null | undefined;
}

export interface ChatMessageResponse {
  id: string;
  content: string | null;
  senderId: string;
  senderType: SenderType;
  recipientId: string;
  recipientType: SenderType;
  conversationId: string | null;
  status: MessageStatus;
  isRead: boolean;
  readAt: Date | null;
  attachments?: string[] | undefined;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create a new chat message
 */
export const createChatMessage = async (
  data: CreateChatMessageData
): Promise<ChatMessage> => {
  // Validate that sender and recipient are different
  if (
    data.senderId === data.recipientId &&
    data.senderType === data.recipientType
  ) {
    throw new AppError(
      'Cannot send message to yourself',
      'INVALID_RECIPIENT',
      400
    );
  }

  // Create the chat message
  const message = await prisma.chatMessage.create({
    data: {
      content: data.content,
      senderId: data.senderId,
      senderType: data.senderType,
      recipientId: data.recipientId,
      recipientType: data.recipientType,
      conversationId: data.conversationId ?? null,
      status: data.status ?? 'SENT',
    },
  });

  return message;
};

/**
 * Get chat history between two participants
 */
export const getChatHistory = async ({
  participantId,
  participantType,
  conversationId,
  limit = 50,
  cursor,
}: ChatHistoryParams): Promise<ChatMessageResponse[]> => {
  // If conversationId is provided, use it as the primary filter
  if (conversationId) {
    // When conversationId is provided, just filter by conversationId
    // This gets all messages in the conversation regardless of participant type
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor
        ? {
            skip: 1,
            cursor: { id: cursor },
          }
        : {}),
    });

    // Reverse to get ascending order
    return messages.reverse().map(mapChatMessageToResponse);
  }

  // Build the where clause to get messages where the participant is either sender or recipient
  const whereClause = {
    OR: [
      {
        senderId: participantId,
        senderType: participantType,
      },
      {
        recipientId: participantId,
        recipientType: participantType,
      },
    ],
  };

  // Fetch messages with pagination
  const messages = await prisma.chatMessage.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor
      ? {
          skip: 1,
          cursor: { id: cursor },
        }
      : {}),
  });

  // Reverse to get ascending order
  return messages.reverse().map(mapChatMessageToResponse);
};

/**
 * Mark a message as read
 */
export const markMessageAsRead = async (
  messageId: string,
  participantId: string
): Promise<void> => {
  await prisma.chatMessage.update({
    where: {
      id: messageId,
      recipientId: participantId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
      status: 'READ',
    },
  });
};

/**
 * Get unread message count for a participant
 */
export const getUnreadMessageCount = async (
  participantId: string,
  participantType: SenderType
): Promise<number> => {
  const count = await prisma.chatMessage.count({
    where: {
      recipientId: participantId,
      recipientType: participantType,
      isRead: false,
    },
  });

  return count;
};

/**
 * Get all conversations for a user
 */
export const getConversations = async (
  participantId: string,
  participantType: SenderType
): Promise<
  Array<{
    participantId: string;
    participantType: SenderType;
    lastMessage: ChatMessageResponse;
    unreadCount: number;
  }>
> => {
  // Get all messages where user is either sender or recipient
  const messages = await prisma.chatMessage.findMany({
    where: {
      OR: [
        { senderId: participantId, senderType: participantType },
        { recipientId: participantId, recipientType: participantType },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by conversation partner
  const conversations = new Map<
    string,
    {
      participantId: string;
      participantType: SenderType;
      lastMessage: ChatMessage;
    }
  >();

  messages.forEach(message => {
    const partnerId =
      message.senderId === participantId &&
      message.senderType === participantType
        ? message.recipientId
        : message.senderId;
    const partnerType =
      message.senderId === participantId &&
      message.senderType === participantType
        ? message.recipientType
        : message.senderType;

    const key = `${partnerId}-${partnerType}`;

    if (!conversations.has(key)) {
      conversations.set(key, {
        participantId: partnerId,
        participantType: partnerType,
        lastMessage: message,
      });
    }
  });

  // Get unread counts for each conversation
  const result = await Promise.all(
    Array.from(conversations.values()).map(async conv => {
      const unreadCount = await prisma.chatMessage.count({
        where: {
          senderId: conv.participantId,
          senderType: conv.participantType,
          recipientId: participantId,
          recipientType: participantType,
          isRead: false,
        },
      });

      return {
        participantId: conv.participantId,
        participantType: conv.participantType,
        lastMessage: mapChatMessageToResponse(conv.lastMessage),
        unreadCount,
      };
    })
  );

  return result;
};

/**
 * Delete a chat message
 */
export const deleteChatMessage = async (
  messageId: string,
  participantId: string,
  participantType: SenderType
): Promise<void> => {
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new AppError('Message not found', 'NOT_FOUND', 404);
  }

  // Only the sender can delete the message
  if (
    message.senderId !== participantId ||
    message.senderType !== participantType
  ) {
    throw new AppError(
      'You can only delete your own messages',
      'FORBIDDEN',
      403
    );
  }

  await prisma.chatMessage.delete({
    where: { id: messageId },
  });
};

/**
 * Map ChatMessage to response format
 */
const mapChatMessageToResponse = (
  message: ChatMessage
): ChatMessageResponse => {
  return {
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    senderType: message.senderType,
    recipientId: message.recipientId,
    recipientType: message.recipientType,
    attachments: message.attachments as string[] | undefined,
    conversationId: message.conversationId,
    status: message.status as MessageStatus,
    isRead: message.isRead,
    readAt: message.readAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};

/**
 * Broadcast message to connected WebSocket clients
 */
export const broadcastMessageToWebSocket = (
  message: ChatMessageResponse,
  wss: WebSocketServer
): void => {
  const messagePayload = {
    type: 'chat_message',
    data: message,
    timestamp: new Date().toISOString(),
  };

  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(messagePayload));
    }
  });
};
