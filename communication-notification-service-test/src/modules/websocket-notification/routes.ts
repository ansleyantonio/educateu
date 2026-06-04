import { Router } from 'express';
import type { Request, Response } from 'express';
import type { WebSocketServer } from 'ws';
import { WebSocket } from 'ws';

// We need to store the WebSocket server instance to broadcast messages
let wssInstance: WebSocketServer | null = null;

export const setWebSocketInstance = (wss: WebSocketServer): void => {
  wssInstance = wss;
};

const router = Router();

// Test endpoint to broadcast a message to all connected WebSocket clients
router.post('/test-broadcast', (req: Request, res: Response) => {
  if (!wssInstance) {
    res.status(500).json({ error: 'WebSocket server not initialized' });
    return;
  }

  const { message = 'Test message from REST API' } = req.body;

  // Broadcast message to all connected clients
  wssInstance.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'broadcast',
          content: message,
          timestamp: new Date().toISOString(),
          source: 'REST_API_TEST',
        })
      );
    }
  });

  res.json({
    success: true,
    message: 'Broadcast message sent to all WebSocket clients',
    broadcastContent: message,
  });
});

// Endpoint to send notification to all connected clients
router.post('/notification', (req: Request, res: Response) => {
  if (!wssInstance) {
    res.status(500).json({ error: 'WebSocket server not initialized' });
    return;
  }

  const { title, content, type = 'notification' } = req.body;

  if (!content) {
    res.status(400).json({ error: 'Content is required' });
    return;
  }

  const notificationMessage = {
    type,
    title,
    content,
    timestamp: new Date().toISOString(),
    source: 'SERVER_NOTIFICATION',
  };

  // Broadcast notification to all connected clients
  wssInstance.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(notificationMessage));
    }
  });

  res.json({
    success: true,
    message: 'Notification sent to all WebSocket clients',
    notification: notificationMessage,
  });
});

// Get WebSocket server status
router.get('/status', (_req: Request, res: Response) => {
  if (!wssInstance) {
    res.status(500).json({ error: 'WebSocket server not initialized' });
    return;
  }

  res.json({
    connectedClients: wssInstance.clients.size,
    status: 'active',
    path: '/ws/message',
  });
});

export default router;
