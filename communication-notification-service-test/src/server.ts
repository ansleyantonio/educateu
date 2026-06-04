import { env } from './config/env';
import createApp from './app';
import http from 'http';
import { webSocketRegistry } from './websocket/WebSocketRegistry';
import { setWebSocketInstance } from './modules/websocket-notification/routes';
import { handleMessageWebSocket } from './modules/websocket-notification/websocket';
import { handleAgentNotificationWebSocket } from './modules/agent-notification/agent-notification.websocket';
import { handleServerInfoWebSocket } from './modules/websocket-notification/server-info/server-info.websocket';
import { closeBullMQ } from './queue/bullmq';

const app = createApp();

// Create HTTP server
const server = http.createServer(app);

// Register WebSocket routes
console.log('Registering WebSocket routes...\n');

// Register each WebSocket endpoint
webSocketRegistry.register({
  path: '/ws/message',
  handler: handleMessageWebSocket,
  perMessageDeflate: false,
});

webSocketRegistry.register({
  path: '/ws/real-time-notification',
  handler: handleAgentNotificationWebSocket,
  perMessageDeflate: false,
});
webSocketRegistry.register({
  path: '/ws/agent-notification',
  handler: handleAgentNotificationWebSocket,
  perMessageDeflate: false,
});

webSocketRegistry.register({
  path: '/ws/server-info',
  handler: handleServerInfoWebSocket,
  perMessageDeflate: false,
});

// Initialize all WebSocket servers
webSocketRegistry.initialize(server);

// Make the message WebSocket instance available to routes (for backward compatibility)
const messageWss = webSocketRegistry.getServer('/ws/message');
if (messageWss) {
  setWebSocketInstance(messageWss);
}

// Start server
server.listen(env.PORT, () => {
  console.log(
    `\n✅ Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`
  );
  console.log(`📡 HTTP: http://localhost:${env.PORT}`);
  console.log(`🔌 WebSocket endpoints:`);
  webSocketRegistry.getRegisteredPaths().forEach(path => {
    console.log(`   - ws://localhost:${env.PORT}${path}`);
  });
  console.log(`\n📬 BullMQ workers are running and processing jobs`);
});

// Graceful shutdown
const shutdown = (): void => {
  console.log('\nShutting down server...');

  // Close BullMQ queues and workers
  closeBullMQ()
    .then(() => {
      console.log('BullMQ queues and workers closed');
    })
    .catch(error => {
      console.error('Error closing BullMQ:', error);
    });

  webSocketRegistry.closeAll(() => {
    console.log('All WebSocket servers closed');
  });

  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      'Could not close connections in time, forcefully shutting down'
    );
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM, shutting down gracefully...');
  shutdown();
});

process.on('SIGINT', () => {
  console.log('\nReceived SIGINT, shutting down gracefully...');
  shutdown();
});

process.on('uncaughtException', (error: Error) => {
  console.error('Uncaught Exception:', error);
  shutdown();
});

process.on(
  'unhandledRejection',
  (reason: unknown, promise: Promise<unknown>) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown();
  }
);

export default server;
