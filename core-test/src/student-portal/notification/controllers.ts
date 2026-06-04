import { Request, Response } from "express";
import { RequestWithUser } from "../../types";
import { getNotificationPreferencesService, updateNotificationPreferencesService } from "./services";
import { zodSafeParse } from "../../utils/zodUtils";
import { updateNotificationPreferencesSchema, notificationPreferencesSchema } from "./schema";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";

export const getNotificationPreferences = async (req: RequestWithUser, res: Response) => {
  if (!req.student?.id) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const result = await getNotificationPreferencesService({ studentId: req.student.id });
  sendSuccessResponse(res, result);
};

export const updateNotificationPreferences = async (req: RequestWithUser, res: Response) => {
  if (!req.student?.id) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }
  const body = zodSafeParse(req.body, notificationPreferencesSchema);

  const result = await updateNotificationPreferencesService(body, req.student.id);
  sendSuccessResponse(res, result, "Notification preferences updated successfully");
};
