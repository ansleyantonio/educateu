import { Router } from "express";
import { getNotificationPreferences, updateNotificationPreferences } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const notificationRouter = Router();

notificationRouter.get("/", asyncWrapper(getNotificationPreferences));

notificationRouter.patch("/", asyncWrapper(updateNotificationPreferences));
