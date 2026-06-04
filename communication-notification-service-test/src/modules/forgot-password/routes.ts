import { Router } from "express";
import { sendForgotPasswordEmailController } from "./controller";
import { asyncWrapper } from "../../utils/asyncWrapper";

const router = Router();

// Forgot password email routes
router.post("/", asyncWrapper(sendForgotPasswordEmailController));

export default router;