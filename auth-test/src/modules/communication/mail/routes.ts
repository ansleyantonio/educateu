import { Router } from "express";
import * as mailController from "./controller";
import { authenticate } from "../../../middlewares/authenticate";
import { asyncWrapper } from "../../../utils/asyncWrapper";

const router = Router();

router.post("/request-reset", mailController.requestPasswordReset);
router.post("/send-otp", asyncWrapper(mailController.requestPasswordReset));
router.post("/match-otp", mailController.matchOtp);
router.post("/reset-password", mailController.resetPasswordController);
router.post("/change-password", mailController.changePasswordController);
router.post("/new-change-password", mailController.changeNewPasswordController);
router.post("/verify-email", mailController.verifyEmail);
router.get(
  "/verify-email/application",
  asyncWrapper(mailController.verifyApplicationEmail)
);

router.put(
  "/mfa-status/:userId",
  asyncWrapper(mailController.mafaStatusController)
);
router.post(
  "/send-bulk-emails",

  asyncWrapper(mailController.sendMultipleEmailsController)
);

export default router;
