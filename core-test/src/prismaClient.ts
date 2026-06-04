/*
 * Prisma Client Instance
 *
 * This module exports a singleton instance of the Prisma client
 * with default configuration for the application.
 */

import { PrismaClient } from "@prisma/client";

/*
 * Prisma Client instance
 *
 * Configured with field-level access control to automatically omit
 * sensitive fields like user passwords from all queries and operations.
 *
 * The 'omit' configuration ensures that the 'password' field from the 'User' model
 * is never returned in any database query result, helping prevent accidental
 * exposure of sensitive data.
 */
const prisma = new PrismaClient({
  omit: {
    user: {
      password: true, // Automatically omit the password field from all User queries
    },
  },
});

// Export the Prisma client instance along with a cleanup function
export default prisma;

// Also export the client for external cleanup
export { prisma };

/*
 * TODO: Uncomment and implement graceful shutdown when needed
 *
 * The following code sets up a graceful shutdown handler that would disconnect
 * the Prisma client when the application receives a SIGINT signal (e.g., Ctrl+C).
 * This is commented out for now but can be enabled in production environments
 * where proper cleanup during shutdown is required.
 */
// process.on('SIGINT', async () => {
//   console.log('SIGINT received, shutting down gracefully');
//   await prisma.$disconnect();
//   process.exit(0);
// });
