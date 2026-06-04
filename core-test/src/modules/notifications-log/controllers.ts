import { RequestWithUser } from "../../types";
import { Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { NotificationsLogService } from "./services";
import { zodSafeParse } from "../../utils/zodUtils";
import { notificationsLogReqBodySchema } from "./types";

const getNotificationsLog = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  // Validate the request query parameters
  const reqBody = zodSafeParse(req.body, notificationsLogReqBodySchema);

  const notificationsLog = await NotificationsLogService.getNotificationsLog(reqBody, userId);

  sendSuccessResponse(res, notificationsLog, "Notifications log fetched successfully", 200);
};

const getAgentNotificationsLog = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  // Validate the request query parameters
  const reqBody = zodSafeParse(req.body, notificationsLogReqBodySchema);

  const notificationsLog = await NotificationsLogService.getNotificationsLog(reqBody, userId, false);

  sendSuccessResponse(res, notificationsLog, "Notifications log fetched successfully", 200);
};

export const NotificationsLogController = {
  getNotificationsLog,
  getAgentNotificationsLog,
};
