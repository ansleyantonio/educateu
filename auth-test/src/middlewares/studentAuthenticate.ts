import { Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import prisma from "../prismaClient";
import { asyncWrapper } from "../utils/asyncWrapper";
import { verifyAccessToken } from "../utils/token";
import { studentRequest } from "../types";

export const studentAuthenticate = asyncWrapper(
  async (req: studentRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("No token provided", "UNAUTHORIZED", 401);
    }

    const token = authHeader.split(" ")[1];

    let decoded: { userId: string };

    try {
      decoded = verifyAccessToken(token) as { userId: string };
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        throw new AppError("Token expired", "UNAUTHORIZED", 401);
      }
      if (error.name === "JsonWebTokenError") {
        throw new AppError("Invalid token", "UNAUTHORIZED", 401);
      }
      throw error;
    }

    if (!decoded.userId) {
      throw new AppError("Invalid token payload", "UNAUTHORIZED", 401);
    }

    const student = await prisma.student.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        accountStatus: true,
      },
    });

    if (!student) {
      throw new AppError("Student not found", "UNAUTHORIZED", 401);
    }

    if (student.accountStatus === "SUSPENDED") {
      throw new AppError("Account suspended", "FORBIDDEN", 403);
    }

    if (student.accountStatus === "INACTIVE") {
      throw new AppError("Account inactive", "FORBIDDEN", 403);
    }

    req.user = { userId: student.id };
    next();
  }
);
