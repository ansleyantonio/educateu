import { WebSocket } from 'ws';
import { createWebSocketHandler } from '../../websocket/WebSocketRegistry';

// Interfaces
interface WelcomeMessage {
  type: 'welcome';
  message: string;
}

interface ClientRegistrationMessage {
  type: 'register';
  userId: string;
}

interface NotificationMessage {
  type: 'notification';
  data: {
    notificationId: string;
    action: 'created' | 'updated' | 'deleted';
    notification?: Record<string, unknown>;
  };
}

interface ErrorMessage {
  type: 'error';
  content: string;
  timestamp: string;
}

interface ConnectedClient {
  ws: WebSocket;
  userId?: string;
}

const clients = new Map<WebSocket, ConnectedClient>();

/**
 * Agent Notification WebSocket Handler
 * Handles connections at /ws/agent-notification
 */
export const handleAgentNotificationWebSocket = createWebSocketHandler((ws: WebSocket): void => {
  console.log('New client connected to agent notification WebSocket');

  clients.set(ws, { ws });

  // Send welcome message
  const welcomeMessage: WelcomeMessage = {
    type: 'welcome',
    message: 'Connected to Agent Notification WebSocket',
  };
  ws.send(JSON.stringify(welcomeMessage));

  // Handle incoming messages
  ws.on('message', async (data: Buffer) => {
    try {
      const messageData = data.toString();
      const parsedMessage = JSON.parse(messageData);

      if (parsedMessage.type === 'register') {
        await handleClientRegistration(ws, parsedMessage as ClientRegistrationMessage);
        return;
      }

      if (parsedMessage.type === 'ping') {
        ws.send(
          JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() })
        );
        return;
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
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
    console.log('Client disconnected from agent notification WebSocket');
    clients.delete(ws);
  });

  // Handle errors
  ws.on('error', (error: Error) => {
    console.error('Agent notification WebSocket error:', error);
    clients.delete(ws);
  });
});

/**
 * Handle client registration
 */
async function handleClientRegistration(
  ws: WebSocket,
  message: ClientRegistrationMessage
): Promise<void> {
  const { userId } = message;

  if (!userId) {
    const errorMessage: ErrorMessage = {
      type: 'error',
      content: 'userId is required for registration',
      timestamp: new Date().toISOString(),
    };
    ws.send(JSON.stringify(errorMessage));
    return;
  }

  const clientData = clients.get(ws);
  if (clientData) {
    clientData.userId = userId;
    clients.set(ws, clientData);
  }

  ws.send(
    JSON.stringify({
      type: 'registered',
      message: 'Successfully registered',
      userId,
      timestamp: new Date().toISOString(),
    })
  );

  console.log(`Client registered: userId=${userId}`);
}

/**
 * Send notification to a specific user
 */
export function sendNotificationToUser(
  userId: string,
  notification: {
    notificationId: string;
    action: 'created' | 'updated' | 'deleted';
    notification?: Record<string, unknown>;
  }
): void {
  const message: NotificationMessage = {
    type: 'notification',
    data: notification,
  };
  const messageStr = JSON.stringify(message);

  let sentCount = 0;
  clients.forEach((clientData) => {
    if (
      clientData.userId === userId &&
      clientData.ws.readyState === WebSocket.OPEN
    ) {
      clientData.ws.send(messageStr);
      sentCount++;
    }
  });

  if (sentCount > 0) {
    console.log(`Notification sent to user ${userId} - ${sentCount} connection(s)`);
  } else {
    console.log(`No active connections for user ${userId} - notification stored in DB`);
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
  clients.forEach((clientData) => {
    const id = clientData.userId ?? 'unregistered';
    byUserId[id] = (byUserId[id] ?? 0) + 1;
  });
  return { total: clients.size, byUserId };
}
