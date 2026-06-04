/* eslint-disable @typescript-eslint/consistent-type-imports */
import { WebSocket, WebSocketServer } from 'ws';
import http from 'http';

/**
 * WebSocket Handler Type
 * A function that handles new WebSocket connections
 */
export type WebSocketConnectionHandler = (ws: WebSocket, request: http.IncomingMessage) => void;

/**
 * WebSocket Route Configuration
 */
export interface WebSocketRouteConfig {
  path: string;
  handler: WebSocketConnectionHandler;
  perMessageDeflate?: boolean;
}

/**
 * WebSocket Registry - Centralized management for all WebSocket routes
 */
class WebSocketRegistry {
  private routes: Map<string, WebSocketRouteConfig> = new Map();
  private wssInstances: Map<string, WebSocketServer> = new Map();

  /**
   * Register a WebSocket route
   * @param config - Route configuration with path, handler, and options
   */
  register(config: WebSocketRouteConfig): void {
    if (this.routes.has(config.path)) {
      throw new Error(`WebSocket route ${config.path} is already registered`);
    }
    this.routes.set(config.path, config);
    console.log(`Registered WebSocket route: ${config.path}`);
  }

  /**
   * Initialize all WebSocket servers and attach to HTTP server
   * @param server - HTTP server to attach WebSocket servers to
   */
  initialize(server: http.Server): void {
    // Create WebSocket server instances for each route
    this.routes.forEach((config, path) => {
      const wss = new WebSocketServer({
        noServer: true,
        perMessageDeflate: config.perMessageDeflate ?? false,
      });

      wss.on('connection', (ws, request) => {
        console.log(`New connection to ${path}`);
        config.handler(ws, request);
      });

      this.wssInstances.set(path, wss);
    });

    // Handle HTTP upgrade requests for WebSocket connections
    server.on('upgrade', (request, socket, head) => {
      const { pathname } = new URL(request.url ?? '', `http://${request.headers.host}`);
      
      console.log('WebSocket upgrade request:', pathname);

      // Find the best matching route (exact match or longest prefix)
      let matchedPath = '';
      let bestWss: WebSocketServer | undefined;

      this.wssInstances.forEach((wss, path) => {
        if (pathname === path || pathname.startsWith(`${path}/`)) {
          if (path.length > matchedPath.length) {
            matchedPath = path;
            bestWss = wss;
          }
        }
      });
      
      if (bestWss) {
        console.log(`Routing to ${matchedPath}`);
        bestWss.handleUpgrade(request, socket, head, (ws) => {
          bestWss?.emit('connection', ws, request);
        });
      } else {
        console.log(`Unknown WebSocket path: ${pathname}, rejecting`);
        socket.destroy();
      }
    });

    console.log(`\nInitialized ${this.wssInstances.size} WebSocket route(s):`);
    this.wssInstances.forEach((_, path) => {
      console.log(`  - ${path}`);
    });
  }

  /**
   * Get WebSocket server instance for a specific path
   * @param path - WebSocket path (e.g., '/ws/message')
   * @returns WebSocketServer instance or undefined
   */
  getServer(path: string): WebSocketServer | undefined {
    return this.wssInstances.get(path);
  }

  /**
   * Get all WebSocket server instances
   * @returns Map of path to WebSocketServer
   */
  getAllServers(): Map<string, WebSocketServer> {
    return new Map(this.wssInstances);
  }

  /**
   * Get all registered paths
   * @returns Array of registered paths
   */
  getRegisteredPaths(): string[] {
    return Array.from(this.routes.keys());
  }

  /**
   * Check if a path is registered
   * @param path - Path to check
   * @returns true if registered
   */
  isRegistered(path: string): boolean {
    return this.routes.has(path);
  }

  /**
   * Close all WebSocket servers
   * @param callback - Optional callback when all servers are closed
   */
  closeAll(callback?: () => void): void {
    let closedCount = 0;
    const totalCount = this.wssInstances.size;

    if (totalCount === 0) {
      callback?.();
      return;
    }

    this.wssInstances.forEach((wss, path) => {
      wss.close(() => {
        console.log(`WebSocket server closed: ${path}`);
        closedCount++;
        if (closedCount === totalCount) {
          callback?.();
        }
      });
    });
  }

  /**
   * Close a specific WebSocket server
   * @param path - Path of the server to close
   * @param callback - Optional callback when server is closed
   */
  close(path: string, callback?: () => void): void {
    const wss = this.wssInstances.get(path);
    if (wss) {
      wss.close(() => {
        console.log(`WebSocket server closed: ${path}`);
        this.wssInstances.delete(path);
        this.routes.delete(path);
        callback?.();
      });
    } else {
      callback?.();
    }
  }
}

// Export singleton instance
export const webSocketRegistry = new WebSocketRegistry();

/**
 * Helper function to create a WebSocket handler wrapper
 * This allows you to easily create handlers for different modules
 * 
 * @param handlerFn - Your connection handler function
 * @returns A wrapped handler function
 * 
 * @example
 * // In your module file:
 * export const handleMessageWebSocket = createWebSocketHandler((ws) => {
 *   ws.send(JSON.stringify({ type: 'welcome' }));
 *   ws.on('message', (data) => { ... });
 * });
 */
export function createWebSocketHandler(
  handlerFn: (ws: WebSocket, request: http.IncomingMessage) => void
): WebSocketConnectionHandler {
  return handlerFn;
}
