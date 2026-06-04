import { WebSocket } from 'ws';
import { createWebSocketHandler } from '../../../websocket/WebSocketRegistry';
import type http from 'http';

interface ConnectedClient {
  ws: WebSocket;
  userId: string | undefined;
}

const clients = new Map<WebSocket, ConnectedClient>();

/**
 * Server Info WebSocket Handler
 * Handles connections at /ws/server-info and /ws/server-info/:userId
 */
export const handleServerInfoWebSocket = createWebSocketHandler(
  (ws: WebSocket, request: http.IncomingMessage): void => {
    console.log('New client connected to Server Info WebSocket');

    // Attempt to extract userId from URL (e.g., /ws/server-info/1)
    const url = request.url ?? '';
    const pathParts = url.split('/');
    // URL might be /ws/server-info/1, parts would be ['', 'ws', 'server-info', '1']
    const userIdFromPath = pathParts[3];

    clients.set(ws, { ws, userId: userIdFromPath });

    if (userIdFromPath) {
      console.log(
        `Client automatically registered from path: userId=${userIdFromPath}`
      );
      ws.send(
        JSON.stringify({
          type: 'registered',
          userId: userIdFromPath,
          source: 'path',
        })
      );
    }

    ws.on('message', (data: Buffer) => {
      try {
        const messageData = data.toString();
        const parsedMessage = JSON.parse(messageData);

        if (parsedMessage.type === 'register' && parsedMessage.userId) {
          const clientData = clients.get(ws);
          if (clientData) {
            clientData.userId = parsedMessage.userId;
            clients.set(ws, clientData);
            ws.send(
              JSON.stringify({
                type: 'registered',
                userId: parsedMessage.userId,
                source: 'message',
              })
            );
          }
        }
      } catch (error) {
        console.error('Error handling Server Info WebSocket message:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  }
);

/**
 * Send server info to a specific user
 */
export function sendServerInfoToUser(
  userId: string,
  type: 'module' | 'session' | 'logout' | 'profile',
  deviceId?: string
): boolean {
  const message = JSON.stringify({
    type,
    deviceId,
    message: `${type} sent`,
    timestamp: new Date().toISOString(),
  });
  let sent = false;

  clients.forEach(clientData => {
    if (
      clientData.userId === userId &&
      clientData.ws.readyState === WebSocket.OPEN
    ) {
      clientData.ws.send(message);
      sent = true;
    }
  });

  return sent;
}
