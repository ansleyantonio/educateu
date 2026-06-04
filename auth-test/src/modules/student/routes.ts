import { Router, NextFunction } from "express";
import { StudentAuthController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { studentAuthenticate } from "../../middlewares/studentAuthenticate";

const studentRouter = Router();

// Public routes
studentRouter.post("/login", asyncWrapper(StudentAuthController.login));
studentRouter.post(
  "/login/send-otp",
  asyncWrapper(StudentAuthController.sendLoginOTP)
);
studentRouter.post(
  "/login/with-otp",
  asyncWrapper(StudentAuthController.loginWithOTP)
);
studentRouter.post(
  "/forgot-password",
  asyncWrapper(StudentAuthController.forgotPassword)
);
studentRouter.post(
  "/reset-password",
  asyncWrapper(StudentAuthController.resetPassword)
);
studentRouter.post(
  "/refresh-token",
  asyncWrapper(StudentAuthController.refreshToken)
);

studentRouter.post(
  "/:studentId/verify-mfa",
  asyncWrapper(StudentAuthController.verifyMFA)
);

studentRouter.post(
  "/change-password",
  studentAuthenticate,
  asyncWrapper(StudentAuthController.changePassword)
);

studentRouter.get(
  "/profile",
  studentAuthenticate,
  asyncWrapper(StudentAuthController.getProfile)
);
studentRouter.put(
  "/profile",
  studentAuthenticate,
  asyncWrapper(StudentAuthController.updateProfile)
);

studentRouter.get(
  "/get-academic-information",
  studentAuthenticate,
  asyncWrapper(StudentAuthController.getAcademicInformation)
);
studentRouter.post("/setup-mfa", asyncWrapper(StudentAuthController.setupMFA));
studentRouter.post(
  "/verify-mfa-setup",
  asyncWrapper(StudentAuthController.verifyMFASetup)
);

studentRouter.post("/verify", asyncWrapper(StudentAuthController.verifyEmail));
studentRouter.get(
  "/security-questions",
  asyncWrapper(StudentAuthController.getSecurityQuestions)
);
studentRouter.post(
  "/security-questions",
  asyncWrapper(StudentAuthController.createSecurityQuestions)
);
studentRouter.patch(
  "/security-questions/:id",
  asyncWrapper(StudentAuthController.updateSecurityQuestions)
);
export default studentRouter;
