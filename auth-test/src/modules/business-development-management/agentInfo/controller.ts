import e, { Request, Response, RequestHandler, NextFunction } from "express";
import AuthService from "./service";
import { z, ZodError } from "zod";
import {
  registerSchema,
  updateAgreementSchema,
  updateUserSchema,
  upgradeTemplateSchema,
} from "./schema";
import geoip from "geoip-lite";
import useragent from "useragent";
import prisma from "../../../prismaClient";
import { JwtPayload } from "jsonwebtoken";
import { sendVerificationEmail } from "../../communication/mail/mailer";
import { RequestWithUser } from "../../../types";
import userDetails from "../../../../userInfo";
import { zodSafeParse } from "../../../utils/zodUtils";
import { AppError } from "../../../utils/AppError";
import { send } from "process";
import { sendSuccessResponse } from "../../../utils/responseUtils";
import axios from "axios";
type GeoIPResult = {
  country?: string;
  region?: string;
  city?: string;
  ll?: [number, number];
} | null;
class AuthController {
  static async register(req: RequestWithUser, res: Response): Promise<void> {
    const validatedData = zodSafeParse(req.body, registerSchema);
    const newUser = await AuthService.register(validatedData);

    if (req.user && newUser) {
      await prisma.auditLog.create({
        data: {
          action: ` created new user ${validatedData.username}`,
          userId: req.user?.userId,
          targetUserId: newUser.id,
          actionType: "user_creation",
          moduleName: "business_development",
        },
      });
    }
    // await sendVerificationEmail(validatedData.email);
    setImmediate(() =>
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/registration`, {
        email: validatedData.email || "",
        username: validatedData.username || undefined,
        firstName: validatedData.firstName,
        password: validatedData.password,
        loginUrl:
          process.env.AGENT_LOGIN_URL || "http://localhost:3000/agent/login",
      }),
    );

    sendSuccessResponse(res, newUser, "User registered successfully");
  }

  static getAllUsers = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { page = 1, pageSize = 10, name = "", status = "" } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(pageSize as string);
    const searchName = name as string;
    const searchStatus = status as string;
    // const agentType = req.query.agentType as string;
    const agentType =
      typeof req.query.agentType === "string"
        ? req.query.agentType.toLowerCase()
        : "";

    const users = await AuthService.getAllUsers(
      pageNumber,
      pageLimit,
      searchName,
      searchStatus,
      agentType,
    );

    sendSuccessResponse(res, users, "Successfully fetched");
  };

  static getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.params.id;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    const data = await AuthService.getUserById(userId);
    sendSuccessResponse(res, data, "Successfully fetched");
  };

  static updateUser = async (
    req: RequestWithUser,
    res: Response,
  ): Promise<void> => {
    const userId = req.params.userId;

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    const validatedData = zodSafeParse(req.body, updateUserSchema);

    const updatedUser = await AuthService.updateUser(userId, validatedData);

    let actionType = "user_update";
    let action = `Updated the profile of ${(await userDetails(userId)).username}`;

    if ("userStatus" in validatedData) {
      if (validatedData.userStatus === "DEACTIVATED") {
        actionType = "user_deactivation";
        action = `Deactivated the application of ${(await userDetails(userId)).username}`;
      } else if (validatedData.userStatus === "ACTIVE") {
        actionType = "user_activation";
        action = `Activated the application of ${(await userDetails(userId)).username}`;
      }
    }

    if (req.user && updatedUser) {
      await prisma.auditLog.create({
        data: {
          action: action,
          userId: req.user.userId,
          targetUserId: updatedUser.id,
          actionType,
          moduleName: "business_development",
        },
      });
    }

    sendSuccessResponse(res, updatedUser, "User updated successfully");
  };

  // Delete user
  static deleteUser: RequestHandler = async (req, res) => {
    const userId = req.params.userId;

    await AuthService.deleteUser(userId);
    sendSuccessResponse(res, null, "User deleted successfully");
  };

  static async getPendingAgents(req: Request, res: Response) {
    const { page = 1, pageSize = 10, name = "" } = req.query;

    // Convert page and pageSize to numbers, since query parameters are strings
    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(pageSize as string, 10);
    const searchName = name as string;

    const pendingAgents = await AuthService.getPendingAgents(
      pageNumber,
      pageLimit,
      searchName,
    );
    sendSuccessResponse(res, pendingAgents, "Successfully fetched");
  }

  static checkUser: RequestHandler = async (req, res) => {
    try {
      const userId = req.query.userid as string | undefined; // Get the userId from query params
      const username = req.query.username as string | undefined;
      const email = req.query.email as string | undefined;
      const mobile = req.query.mobile as string | undefined;

      if (!username && !email && !mobile) {
        res.status(400).json({
          message: "Please provide username, email, or mobile to check.",
        });
        return;
      }

      const currentUser = userId
        ? await prisma.user.findUnique({
            where: { id: userId },
          })
        : null;

      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            {
              OR: [
                username ? { username } : undefined,
                email ? { email } : undefined,
                mobile ? { mobile } : undefined,
              ].filter(Boolean) as any, // Filters out `undefined` values
            },
            {
              NOT: {
                id: userId, // Exclude the current user
              },
            },
          ],
        },
      });

      if (existingUser) {
        // Dynamically set the message based on the field that exists
        const field = username ? "username" : email ? "email" : "mobile";
        res.status(200).json({
          exists: true,
          message: `${field} already exists`,
        });
        return;
      }

      const field = username ? "username" : email ? "email" : "mobile";
      res.status(200).json({ exists: false, message: `${field} is available` });
      return;
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ message: "Internal server error" });
      return;
    }
  };

  static getUsersWithNullCommissionRate: RequestHandler = async (req, res) => {
    const { page = 1, pageSize = 10, name = "", agentType } = req.query;

    const pageNumber = parseInt(page as string, 10);
    const pageLimit = parseInt(pageSize as string, 10);
    const searchName = name as string;
    const users = await AuthService.getUsersWithNullCommissionRate(
      pageNumber,
      pageLimit,
      searchName,
      agentType as string,
    );

    sendSuccessResponse(res, users, "Successfully fetched");
  };

  static async updateAgreement(req: RequestWithUser, res: Response) {
    const data = zodSafeParse(req.body, updateAgreementSchema);
    const existingUser = await prisma.user.findUnique({
      where: {
        id: data.userId,
      },
    });
    if (!existingUser) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }
    const existingAgreement = await prisma.agreementTemplate.findUnique({
      where: {
        id: data.agreementId,
      },
    });
    if (!existingAgreement) {
      throw new AppError("Agreement not found", "NOT_FOUND", 404);
    }
    const updatedUser = await AuthService.updateAgreement(data);
    sendSuccessResponse(res, updatedUser, "User updated successfully");
  }

  static async upgradeTemplateVersion(req: Request, res: Response) {
    const parsedBody = zodSafeParse(req.body, upgradeTemplateSchema);

    const result = await AuthService.upgradeTemplateVersion(parsedBody);

    sendSuccessResponse(res, result, "Template version upgraded successfully");
  }
  static async getAwardingBodyTemplates(req: Request, res: Response) {
    const { userId } = req.params;
    const { page = "1", pageSize = "10", search = "" } = req.query;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    const { awardingBodyTemplates, pagination } =
      await AuthService.getAwardingBodyTemplates(
        userId,
        Number(page),
        Number(pageSize),
        search as string,
      );

    sendSuccessResponse(
      res,
      awardingBodyTemplates,
      "Successfully fetched",
      200,
      pagination,
    );
  }
}

export default AuthController;
