/*
 * Server entry point for EducateU Core Backend
 *
 * This file starts the Express server and begins listening for incoming HTTP requests.
 * It imports the configured Express application from app.ts and binds it to a port.
 * Includes graceful shutdown capabilities and proper signal handling.
 *
 * Environment Variables:
 * - PORT: The port number on which the server should listen (defaults to 3000)
 */

import dotenv from 'dotenv';
dotenv.config();

import app from "./app";
import { prisma } from "./prismaClient";

/*
 * Define the port on which the server will run
 * Defaults to 3000 if PORT environment variable is not set
 */
const PORT = process.env.PORT || 3000;

// Create HTTP server instance
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Keep track of active connections
const connections = new Set<import("net").Socket>();

// Add connection tracking
server.on("connection", (connection) => {
  connections.add(connection);
  connection.on("close", () => {
    connections.delete(connection);
  });
});

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`${signal} signal received. Starting graceful shutdown...`);

  // Close all existing connections after a short delay to allow current requests to complete
  setTimeout(() => {
    connections.forEach((conn) => conn.destroy());
  }, 5000); // Wait up to 5 seconds to allow current requests to finish

  // Attempt to disconnect Prisma client first
  try {
    await prisma.$disconnect();
    console.log("Prisma client disconnected.");
  } catch (error) {
    console.error("Error during Prisma client cleanup:", error);
  }

  // Stop accepting new connections and close server
  server.close((err) => {
    if (err) {
      console.error("Error during server shutdown:", err);
      process.exit(1);
    }

    console.log("All connections closed. Shutting down.");
    process.exit(0);
  });
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
