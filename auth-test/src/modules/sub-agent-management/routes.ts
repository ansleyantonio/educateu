import express from "express";
// import authenticateToken from '../middleware/authMiddleware';
import { validate } from "../../middlewares/validate";
import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AuthController } from "./controller";

export const subAgentRouter = Router();

subAgentRouter.get("/", authenticate, asyncWrapper(AuthController.getAllUsers));
subAgentRouter.get("/:id", asyncWrapper(AuthController.getUserById));
subAgentRouter.post("/register", asyncWrapper(AuthController.register));
subAgentRouter.patch("/:userId", asyncWrapper(AuthController.updateUser));
subAgentRouter.get(
  "/agent-wise/:id",
  asyncWrapper(AuthController.getAgentWiseSubAgents)
);
export const agentRouter = Router();
agentRouter.get(
  "/agent-wise/:id",
  asyncWrapper(AuthController.getAgentWiseSubAgents)
);
