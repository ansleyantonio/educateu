import { handleAgentNotificationWebSocket } from '../modules/agent-notification/agent-notification.websocket';
import { handleMessageWebSocket } from '../modules/websocket-notification/websocket';
import { handleServerInfoWebSocket } from '../modules/websocket-notification/server-info/server-info.websocket';
import { webSocketRegistry } from './WebSocketRegistry';
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
  path: '/ws/server-info',
  handler: handleServerInfoWebSocket,
  perMessageDeflate: false,
});
