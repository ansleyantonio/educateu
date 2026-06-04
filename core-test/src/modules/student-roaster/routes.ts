import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { StudentRoasterController } from "./controllers";

export const studentRoasterRouter = Router();
export const supportRouter = Router();

studentRoasterRouter.post("/", asyncWrapper(StudentRoasterController.getRegistries));
studentRoasterRouter.post(
  "/registered-student-details",
  asyncWrapper(StudentRoasterController.getRegisteredStudentDetails),
);
studentRoasterRouter.post("/download-csv", asyncWrapper(StudentRoasterController.downloadCsv));

// Get Withdrawable Course Details
studentRoasterRouter.get(
  "/withdrawable-course-details",
  asyncWrapper(StudentRoasterController.getWithdrawableCourseDetails),
);

studentRoasterRouter.get("/student-payment-details/email/:email", asyncWrapper(StudentRoasterController.getStudentPaymentDetails));

// Withdraw Course Manually
studentRoasterRouter.patch("/withdraw-course", asyncWrapper(StudentRoasterController.withdrawCourse));

export const supportTicketRouter = Router();

// Get Support Tokens
supportTicketRouter.get("/", asyncWrapper(StudentRoasterController.getSupportTokensController));

// Transfer Support Tokens
supportTicketRouter.patch("/transfer", asyncWrapper(StudentRoasterController.transferSupportTokens));

// Assign Support Tokens
supportTicketRouter.patch("/assign", asyncWrapper(StudentRoasterController.assignSupportTokens));

// Resolve Support Tokens
supportTicketRouter.patch("/resolve", asyncWrapper(StudentRoasterController.resolveSupportTokens));

// Reject Support Tokens
supportTicketRouter.patch("/reject", asyncWrapper(StudentRoasterController.rejectSupportTokens));
