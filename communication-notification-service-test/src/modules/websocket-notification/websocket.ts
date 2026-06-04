import { WebSocket } from 'ws';
import type { WebSocketServer } from 'ws';
import { Prisma } from '@prisma/client';
import {
  createWebSocketHandler,
  webSocketRegistry,
} from '../../websocket/WebSocketRegistry';
import prisma from '../../prismaClient';
import { webSocketChatMessageSchema } from '../../schemas/chatSchema';
import { zodSafeParse } from '../../utils/zodUtils';
import { AppError } from '../../utils/AppError';

// Interfaces
interface WelcomeMessage {
  type: 'welcome';
  message: string;
}

interface EchoMessage {
  type: 'echo';
  content: string;
  timestamp: string;
  status: 'delivered';
}

interface ErrorMessage {
  type: 'error';
  content: string;
  timestamp: string;
}

interface ParsedMessage {
  type?: string;
  message?: string;
  content?: string;
  [key: string]: unknown;
}

interface ChatMessagePayload {
  type: 'chat';
  content: string;
  senderId: string;
  senderType: 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER';
  recipientId: string;
  recipientType: 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER';
  timestamp?: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
  userType?: 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER';
}

// Store connected clients
const clients = new Map<WebSocket, ConnectedClient>();

/**
 * Message WebSocket Handler
 * Handles connections at /ws/message
 */
export const handleMessageWebSocket = createWebSocketHandler(
  (ws: WebSocket): void => {
    console.log('New client connected to message WebSocket');

    // Add client to the map (unregistered initially)
    clients.set(ws, { ws });

    // Send welcome message
    const welcomeMessage: WelcomeMessage = {
      type: 'welcome',
      message:
        'Connected to message WebSocket. Send a "register" message with your userId and userType to receive chat messages.',
    };
    ws.send(JSON.stringify(welcomeMessage));

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const messageData = data.toString();
        let parsedMessage: ParsedMessage;

        try {
          parsedMessage = JSON.parse(messageData) as ParsedMessage;
        } catch {
          parsedMessage = { type: 'text', content: messageData };
        }

        // Handle registration
        if (parsedMessage.type === 'register') {
          await handleRegistration(ws, parsedMessage);
          return;
        }

        // Auto-detect chat message if it has required chat fields
        const isChatMessage =
          parsedMessage.type === 'chat' ||
          (parsedMessage.content &&
            parsedMessage['senderId'] &&
            parsedMessage['senderType'] &&
            parsedMessage['recipientId'] &&
            parsedMessage['recipientType']);

        if (isChatMessage) {
          await handleChatMessage(
            ws,
            parsedMessage as unknown as ChatMessagePayload
          );
          return;
        }

        // Broadcast message to all other connected clients
        const processedMessage = {
          type: parsedMessage.type ?? 'message',
          content:
            parsedMessage.message ?? parsedMessage.content ?? messageData,
          timestamp: new Date().toISOString(),
          sender: 'client',
        };

        clients.forEach(clientData => {
          if (
            clientData.ws !== ws &&
            clientData.ws.readyState === WebSocket.OPEN
          ) {
            clientData.ws.send(JSON.stringify(processedMessage));
          }
        });

        // Echo back to sender
        const echoMessage: EchoMessage = {
          type: 'echo',
          content: processedMessage.content,
          timestamp: new Date().toISOString(),
          status: 'delivered',
        };
        ws.send(JSON.stringify(echoMessage));
      } catch (error) {
        console.error('Error handling message:', error);
        const errorMessage: ErrorMessage = {
          type: 'error',
          content: 'Failed to process message',
          timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(errorMessage));
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      console.log('Client disconnected from message WebSocket');
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      clients.delete(ws);
    });
  }
);

/**
 * Handle user registration
 */
async function handleRegistration(
  ws: WebSocket,
  message: ParsedMessage
): Promise<void> {
  const { userId, userType } = message;

  if (!userId || !userType) {
    const errorMessage: ErrorMessage = {
      type: 'error',
      content: 'userId and userType are required for registration',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  // Update client info
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.userId = userId as string;
    clientData.userType = userType as
      | 'USER'
      | 'STUDENT'
      | 'SENDER'
      | 'RECEIVER';
    clients.set(ws, clientData);
  }

  const response = {
    type: 'registered',
    message: 'Successfully registered',
    userId,
    userType,
    timestamp: new Date().toISOString(),
  };
  ws.send(JSON.stringify(response));

  console.log(`Client registered: userId=${userId}, userType=${userType}`);
}

/**
 * Handle chat messages
 */
async function handleChatMessage(
  ws: WebSocket,
  message: ChatMessagePayload & {
    conversationId?: string;
    attachments?: string[];
  }
): Promise<void> {
  try {
    // Validate the chat message using Zod schema
    const validatedMessage = zodSafeParse(message, webSocketChatMessageSchema);

    const {
      content,
      senderId,
      senderType,
      recipientId,
      recipientType,
      conversationId,
      attachments,
    } = validatedMessage;

    // Generate conversationId if not provided
    // Format: sort participant IDs to ensure same conversation for both participants
    const participants = [
      `${senderId}-${senderType}`,
      `${recipientId}-${recipientType}`,
    ].sort();
    const generatedConversationId = conversationId ?? participants.join('--');

    const chatMessage = await prisma.chatMessage.create({
      data: {
        content: content ?? null,
        senderId,
        senderType,
        recipientId,
        recipientType,
        conversationId: generatedConversationId,
        status: 'SENT',
        attachments: attachments ?? Prisma.JsonNull,
      },
    });

    ws.send(
      JSON.stringify({
        type: 'chat_message_sent',
        data: {
          id: chatMessage.id,
          content: chatMessage.content,
          senderId: chatMessage.senderId,
          senderType: chatMessage.senderType,
          recipientId: chatMessage.recipientId,
          recipientType: chatMessage.recipientType,
          conversationId: chatMessage.conversationId,
          attachments: chatMessage.attachments,
          status: chatMessage.status,
          isRead: chatMessage.isRead,
          createdAt: chatMessage.createdAt,
        },
        timestamp: new Date().toISOString(),
      })
    );

    broadcastToUser(recipientId, recipientType, {
      type: 'chat_message_received',
      data: {
        id: chatMessage.id,
        content: chatMessage.content,
        senderId: chatMessage.senderId,
        senderType: chatMessage.senderType,
        recipientId: chatMessage.recipientId,
        recipientType: chatMessage.recipientType,
        conversationId: chatMessage.conversationId,
        attachments: chatMessage.attachments,
        status: chatMessage.status,
        isRead: chatMessage.isRead,
        createdAt: chatMessage.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in handleChatMessage:', error);
    const errorMessage: ErrorMessage = {
      type: 'error',
      content:
        error instanceof AppError
          ? error.message
          : 'Failed to process chat message',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(errorMessage));
  }
}

/**
 * Broadcast message to a specific user
 */
export function broadcastToUser(
  userId: string,
  userType: 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER',
  message: unknown
): void {
  const messageStr = JSON.stringify(message);
  clients.forEach(clientData => {
    if (
      clientData.userId === userId &&
      clientData.userType === userType &&
      clientData.ws.readyState === WebSocket.OPEN
    ) {
      clientData.ws.send(messageStr);
    }
  });
}

/**
 * Register a user with their WebSocket connection
 */
export function registerUserConnection(
  ws: WebSocket,
  userId: string,
  userType: 'USER' | 'STUDENT' | 'SENDER' | 'RECEIVER'
): void {
  const clientData = clients.get(ws);
  if (clientData) {
    clientData.userId = userId;
    clientData.userType = userType;
    clients.set(ws, clientData);
  }
}

/**
 * Get connected clients count
 */
export function getConnectedClientsCount(): {
  total: number;
  byUserId: Record<string, number>;
} {
  const byUserId: Record<string, number> = {};
  clients.forEach(clientData => {
    const id = clientData.userId ?? 'unregistered';
    byUserId[id] = (byUserId[id] ?? 0) + 1;
  });
  return { total: clients.size, byUserId };
}

/**
 * Get WebSocket server instance (for backward compatibility)
 * @deprecated Use webSocketRegistry.getServer('/ws/message') instead
 */
export const getWebSocketInstance = (): WebSocketServer | null => {
  return webSocketRegistry.getServer('/ws/message') ?? null;
};
