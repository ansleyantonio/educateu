import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { NotificationsLogController } from "./controllers";

// Admin Notifications Log
export const adminNotificationsLogRouter = Router();

adminNotificationsLogRouter.post("/", asyncWrapper(NotificationsLogController.getNotificationsLog));

// ================================
// Agent Notifications Log
export const agentNotificationsLogRouter = Router();

agentNotificationsLogRouter.post("/", asyncWrapper(NotificationsLogController.getAgentNotificationsLog));
