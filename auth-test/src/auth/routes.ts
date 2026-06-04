import { Router } from "express";
import AuthController, { StudentManagementController } from "./controller";
import { authenticate } from "../middlewares/authenticate";
import { asyncWrapper } from "../utils/asyncWrapper";

const router = Router();

// Login route
router.post("/login", asyncWrapper(AuthController.login));
router.post("/logout", asyncWrapper(AuthController.logout));
router.get(
  "/device/history",
  authenticate,
  asyncWrapper(AuthController.getdeviceHistory),
);
router.get(
  "/user-device/history/:userId",
  authenticate,
  asyncWrapper(AuthController.getUserDeviceHistory),
);
router.delete(
  "/device/history/:id",
  authenticate,
  asyncWrapper(AuthController.deleteDeviceHistory),
);
router.post("/token", authenticate, asyncWrapper(AuthController.generateToken));
router.post("/update/password", asyncWrapper(AuthController.updatePassword));
router.post(
  "/student-login",
  asyncWrapper(StudentManagementController.loginStudent),
);
router.post(
  "/create-manual-payment",
  asyncWrapper(StudentManagementController.createManualPayment),
);

export default router;
