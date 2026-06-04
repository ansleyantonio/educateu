import type { Request, Response } from 'express';
import { zodSafeParse } from '../../utils/zodUtils';
import {
  sendChatMessageSchema,
  getChatHistorySchema,
  markMessagesReadSchema,
  getUnreadCountSchema,
  deleteChatMessageSchema,
} from '../../schemas/chatSchema';
import {
  createChatMessage,
  getChatHistory,
  markMessageAsRead,
  getUnreadMessageCount,
  deleteChatMessage,
  getConversations,
  broadcastMessageToWebSocket,
} from './chat.service';
import { getWebSocketInstance } from '../websocket-notification/websocket';

/**
 * Send a chat message
 * POST /chat/send
 * Body: { content, senderId, senderType, recipientId, recipientType, conversationId?, status? }
 */
export const sendChatMessageController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body
  const validatedBody = zodSafeParse(req.body, sendChatMessageSchema);

  const {
    content,
    senderId,
    senderType,
    recipientId,
    recipientType,
    conversationId,
    status = 'SENT',
  } = validatedBody;

  const message = await createChatMessage({
    content: content ?? '',
    senderId,
    senderType,
    recipientId,
    recipientType,
    conversationId: conversationId ?? null,
    status,
  });

  // Broadcast to WebSocket clients
  try {
    const wss = getWebSocketInstance();
    if (wss) {
      broadcastMessageToWebSocket(
        {
          id: message.id,
          content: message.content ?? '',
          senderId: message.senderId,
          senderType: message.senderType,
          recipientId: message.recipientId,
          recipientType: message.recipientType,
          conversationId: message.conversationId,
          status: message.status,
          isRead: message.isRead,
          readAt: message.readAt,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
        },
        wss
      );
    }
  } catch (error) {
    console.error('Failed to broadcast message via WebSocket:', error);
  }

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      senderType: message.senderType,
      recipientId: message.recipientId,
      recipientType: message.recipientType,
      conversationId: message.conversationId,
      status: message.status,
      isRead: message.isRead,
      readAt: message.readAt,
      createdAt: message.createdAt,
    },
  });
};

/**
 * Get chat history between two participants
 * POST /chat/history
 * Body: { participantId, participantType, conversationId?, limit?, cursor? }
 */
export const getChatHistoryController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body

  const validatedBody = zodSafeParse(req.query, getChatHistorySchema);

  const { participantId, participantType, conversationId, limit, cursor } =
    validatedBody;

  // Get chat history
  const messages = await getChatHistory({
    participantId,
    participantType,
    conversationId: conversationId ?? null,
    limit,
    cursor: cursor ?? undefined,
  });

  res.status(200).json({
    success: true,
    data: {
      messages,
    },
  });
};

/**
 * Mark a message as read
 * POST /chat/mark-read
 * Body: { messageId, participantId }
 */
export const markMessagesReadController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body
  const validatedBody = zodSafeParse(req.body, markMessagesReadSchema);

  const { messageId, participantId } = validatedBody;

  // Mark message as read
  await markMessageAsRead(messageId, participantId);

  res.status(200).json({
    success: true,
    message: 'Message marked as read',
  });
};

/**
 * Get unread message count
 * GET /chat/unread-count?participantId=xxx&participantType=USER|STUDENT|SENDER|RECEIVER
 */
export const getUnreadCountController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate query parameters
  const validatedQuery = zodSafeParse(req.query, getUnreadCountSchema);

  const { participantId, participantType } = validatedQuery;

  // Get unread count for the participant
  const count = await getUnreadMessageCount(participantId, participantType);

  res.status(200).json({
    success: true,
    data: {
      unreadCount: count,
    },
  });
};

/**
 * Get all conversations
 * GET /chat/conversations
 */
export const getConversationsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const participantId = req.body.participantId as string;
  const participantType =
    (req.body.participantType as 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER') ||
    'USER';

  // Get all conversations
  const conversations = await getConversations(participantId, participantType);

  res.status(200).json({
    success: true,
    data: {
      conversations,
    },
  });
};

/**
 * Delete a chat message
 * DELETE /chat/:messageId
 */
export const deleteChatMessageController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate params
  const validatedParams = zodSafeParse(req.params, deleteChatMessageSchema);

  const { messageId } = validatedParams;

  // Get current user info from request
  const participantId = req.body.participantId as string;
  const participantType =
    (req.body.participantType as 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER') ||
    'USER';

  // Delete the message
  await deleteChatMessage(messageId, participantId, participantType);

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  });
};
