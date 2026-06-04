// Authentication controller handling login, device tracking, and token management
import { Request, Response, RequestHandler, NextFunction } from "express";
import AuthService, { StudentManagementService } from "./service";
import { z } from "zod";
import geoip from "geoip-lite";
import useragent from "useragent";
import prisma from "../prisma/prisma.service";
import { JwtPayload } from "jsonwebtoken";
import { stat } from "fs";
import { RequestWithUser } from "../types";
import { zodSafeParse } from "../utils/zodUtils";
import { nanoid } from "nanoid";
import {
  AuthSchema,
  loginSchema,
  ManualPaymentSchema,
  portalType,
  UpdatePasswordSchema,
  userLogoutSchema,
} from "./schema";
import { sendSuccessResponse } from "../utils/responseUtils";
import { AppError } from "../utils/AppError";
import bcrypt from "bcryptjs";
import userDetails from "../../userInfo";
import createAuditLog from "../auditlog";
import axios from "axios";

// Type definition for GeoIP lookup result structure
type GeoIPResult = {
  country?: string;
  region?: string;
  city?: string;
  ll?: [number, number];
} | null;
class AuthController {
  static login = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // const { username, password } = req.body;
    const { username, password } = zodSafeParse(req.body, loginSchema);
    const userPortal = zodSafeParse(req.query.userportal, portalType);

    const agent = useragent.parse(req.headers["user-agent"]);
    const browser = agent.family; // E.g., "Chrome"
    const platform = agent.os.family; // E.g., "Windows"
    const deviceType = agent.device.family || "Unknown"; // E.g., "MacBook Pro"

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
      req.socket.remoteAddress ||
      "Unknown";
    console.log("User IP address:", ip);

    const deviceId = nanoid();

    const { user, accessToken, refreshToken } = await AuthService.login(
      username,
      password,
      userPortal,
      ip,
      deviceId,
      platform,
      browser,
    );

    // Step 3: Perform GeoIP lookup to determine user's location
    const geoData = geoip.lookup(ip) as GeoIPResult;
    const country = geoData?.country || "Unknown";
    const region = geoData?.region || "Unknown";
    const city = geoData?.city || "Unknown";
    const [latitude, longitude] = geoData?.ll || [0, 0];

    // Step 4: Record device and browser information for security tracking
    const orConditions: any[] = [
      { ip: ip, platform: platform, browser: browser },
    ];

    const existingDevice = await prisma.browsersAndDevices.findFirst({
      where: {
        userId: user.id,
        OR: orConditions,
      },
    });

    if (existingDevice) {
      await prisma.browsersAndDevices.update({
        where: { id: existingDevice.id },
        data: {
          deviceType,
          platform,
          browser,
          country,
          region,
          ip: ip || "Unknown",
          city,
          latitude,
          longitude,
          isActive: true,
          deviceId: deviceId || existingDevice.deviceId,
        },
      });
    } else {
      await prisma.browsersAndDevices.create({
        data: {
          deviceType,
          deviceId: deviceId || null,
          platform,
          browser,
          country,
          region,
          ip: ip || "Unknown",
          city,
          latitude,
          longitude,
          session: "Current Session",
          userId: user.id,
          isActive: true,
        },
      });
    }
    // Log successful login attempt in audit trail
    await prisma.auditLog.create({
      data: {
        action: " has logged in",
        userId: user.id,
        actionType: "success_login",
      },
    });

    // Step 5: Return user data and authentication tokens
    res.json({ user, accessToken, refreshToken, deviceId });
  };

  // Retrieve device login history for authenticated user
  static getdeviceHistory = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Extract user ID from authenticated request
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
      // Fetch complete device history for the user
      const deviceHistory = await AuthService.getDeviceHistory(userId);

      res.json({
        status: "success",
        message: "Device history fetched successfully",
        deviceHistory,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static getUserDeviceHistory = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const userId = req.params.userId;
    if (!userId) {
      throw new AppError("User ID is required", "BAD_REQUEST", 400);
    }
    // Fetch complete device history for the user
    const deviceHistory = await AuthService.getDeviceHistory(userId);

    sendSuccessResponse(
      res,
      deviceHistory,
      "User device history fetched successfully",
    );
  };
  // Remove specific device history record for authenticated user
  static deleteDeviceHistory = async (req: RequestWithUser, res: Response) => {
    const id = req.params.id;
    const userId = req.user?.userId;

    if (!userId || !id) {
      throw new AppError(
        "User ID and device ID are required",
        "BAD_REQUEST",
        400,
      );
    }
    const existingDevice = await prisma.browsersAndDevices.findFirst({
      where: {
        // userId: userId,
        id: id,
      },
      select: { deviceId: true, userId: true },
    });
    if (!existingDevice) {
      throw new AppError("Device history record not found", "NOT_FOUND", 404);
    }
    setImmediate(() =>
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
        userId: existingDevice.userId,
        type: "logout",
        deviceId: existingDevice.deviceId,
      }),
    );

    await prisma.browsersAndDevices.deleteMany({
      where: {
        userId: existingDevice.userId,
        OR: [{ id }, { deviceId: existingDevice.deviceId }],
        // deviceId: id,
      },
    });

    sendSuccessResponse(
      res,
      null,
      "Device history record deleted successfully",
    );
  };
  // Generate authentication token for user with audit logging
  static async generateToken(req: RequestWithUser, res: Response) {
    const token = zodSafeParse(req.body, AuthSchema);
    const tokenData = await AuthService.generateToken(token);

    if (!req.user?.userId) {
      throw new AppError("Unauthorized: User ID missing", "UNAUTHORIZED", 401);
    }

    // Fetch user details for audit logging
    const details = token.id ? await userDetails(token.id) : null;
    // Create descriptive audit message with user context
    const actionMessage = details
      ? `generated token for user ${details.username}  with portals ${details.portalNames.join(", ")}`
      : `generated token for unknown user`;

    sendSuccessResponse(res, tokenData, "Token generated successfully");
  }

  static async updatePassword(req: Request, res: Response) {
    const data = zodSafeParse(req.body, UpdatePasswordSchema);
    // Verify user exists before password update
    const user = await prisma.user.findFirst({
      where: {
        id: data.id,
      },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    // Hash new password using bcrypt with salt rounds
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Update password and reset security flags
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordChanged: true,
        mfaEnabled: false,
      },
    });

    sendSuccessResponse(res, updatedUser, "Password updated successfully");
  }
  static async logout(req: Request, res: Response) {
    const data = zodSafeParse(req.body, userLogoutSchema);

    if (data.deviceId) {
      await prisma.browsersAndDevices.deleteMany({
        where: { userId: data.userId, deviceId: data.deviceId },
      });
    }

    const logout = await prisma.user.update({
      where: { id: data.userId },
      data: {
        logoutTime: new Date(),
      },
    });
    sendSuccessResponse(res, logout, "Logout successful");
  }
}

export default AuthController;

const loginStudent = async (req: Request, res: Response) => {
  const reqBody = zodSafeParse(req.body, loginSchema);
  const { student, accessToken, refreshToken } =
    await StudentManagementService.loginStudent(reqBody);

  // await createAuditLog({
  //   userId: student?.id,
  //   action: "User logged in",
  //   actionType: "login",
  // });

  sendSuccessResponse(
    res,
    { student, accessToken, refreshToken },
    "Login successful",
  );
};
const createManualPayment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const validatedData = zodSafeParse(req.body, ManualPaymentSchema);
  const result =
    await StudentManagementService.createManualPayment(validatedData);
  sendSuccessResponse(res, result, "Manual payment recorded successfully");
};

export const StudentManagementController = {
  loginStudent,
  createManualPayment,
};
