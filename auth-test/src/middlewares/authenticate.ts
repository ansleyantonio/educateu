// Authentication middleware for JWT token verification and user validation
import { Response, NextFunction } from "express";
// import jwt from "jsonwebtoken";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";

import { AppError } from "../utils/AppError";
import { RequestWithUser, userInRequestSchema } from "../types";
import { zodSafeParse } from "../utils/zodUtils";
import prisma from "../prismaClient";

// Middleware to authenticate requests using JWT tokens
export const authenticate = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  // Extract token from Authorization header (Bearer token format)
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    throw new AppError("Missing Authorization header", "UNAUTHORIZED", 401);
  }

  // Validate JWT secret is configured
  if (!process.env.JWT_SECRET && typeof process.env.JWT_SECRET !== "string") {
    console.error("JWT_SECRET is not set");
    throw new AppError("Internal Server Error", "INTERNAL_SERVER_ERROR", 500);
  }

  // const tokenData = jwt.verify(
  //   token.replace("Bearer ", ""),
  //   process.env.JWT_SECRET
  // );
  let tokenData;

  // Verify JWT token and handle different error types
  try {
    tokenData = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      throw new AppError("Token expired", "UNAUTHORIZED", 401);
    } else if (err instanceof JsonWebTokenError) {
      throw new AppError("Invalid token", "UNAUTHORIZED", 401);
    } else {
      throw new AppError("Authentication failed", "UNAUTHORIZED", 401);
    }
  }
  // Parse and validate token payload structure
  const user = zodSafeParse(tokenData, userInRequestSchema);

  // Verify user still exists in database
  const userFromDb = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!userFromDb) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  // Check if user has been force logged out
  if (userFromDb.isForceLogout) {
    throw new AppError("User is force logout", "UNAUTHORIZED", 401);
  }

  // Attach user data to request object for downstream use
  req.user = user;

  next();
};
