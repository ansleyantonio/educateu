import express from "express";
import AuthController from "./controller";
import { validate } from "../../../middlewares/validate";
import { registerSchema, updateUserSchema } from "./schema";
import { authenticate } from "../../../middlewares/authenticate";
import { agentSettingRoutes } from "../agentSetting/routes";
import { asyncWrapper } from "../../../utils/asyncWrapper";
const router = express.Router();
const agentRouter = express.Router();

router.get("/", asyncWrapper(AuthController.getAllUsers));
router.get("/:id", asyncWrapper(AuthController.getUserById));
router.post("/register", asyncWrapper(AuthController.register));
router.patch("/:userId", asyncWrapper(AuthController.updateUser));
router.get("/pending/agents", AuthController.getPendingAgents);
router.delete("/:userId", authenticate, AuthController.deleteUser);
router.get("/check-user", AuthController.checkUser);
router.get("/unassign/users", AuthController.getUsersWithNullCommissionRate);
router.use("/agent", agentSettingRoutes);
router.post("/agreement-update", asyncWrapper(AuthController.updateAgreement));
router.post(
  "/update-version",
  asyncWrapper(AuthController.upgradeTemplateVersion)
);
router.get(
  "/awarding-body-templates/:userId",
  asyncWrapper(AuthController.getAwardingBodyTemplates)
);

export default router;
agentRouter.get("/:id", asyncWrapper(AuthController.getUserById));
agentRouter.patch("/:userId", asyncWrapper(AuthController.updateUser));
agentRouter.post(
  "/agreement-update",
  asyncWrapper(AuthController.updateAgreement)
);
agentRouter.post(
  "/update-version",
  asyncWrapper(AuthController.upgradeTemplateVersion)
);
agentRouter.get(
  "/awarding-body-templates/:userId",
  asyncWrapper(AuthController.getAwardingBodyTemplates)
);
