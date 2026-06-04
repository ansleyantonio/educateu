// src/prismaClient.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Graceful shutdown on SIGINT (Ctrl+C)
// prisma.$on("beforeExit", async () => {
//   await prisma.$disconnect();
// });

export default prisma;
