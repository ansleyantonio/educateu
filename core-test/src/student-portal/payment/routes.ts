import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { StudentPaymentController } from "./controllers";

export const studentPaymentRouter = Router();

studentPaymentRouter.get("/history", asyncWrapper(StudentPaymentController.getAllStudentPayment));
studentPaymentRouter.get("/due-history", asyncWrapper(StudentPaymentController.getDuePayment));
studentPaymentRouter.post(
  "/create-checkout-session",
  asyncWrapper(StudentPaymentController.createStudentPaymentCheckout),
);
studentPaymentRouter.post("/manual-payment", asyncWrapper(StudentPaymentController.createStudentManualPayment));

// New routes for studentId and studentCourseId based payments
studentPaymentRouter.post(
  "/stripe-checkout-by-course",
  asyncWrapper(StudentPaymentController.createStudentPaymentCheckoutByCourse),
);
studentPaymentRouter.post(
  "/manual-payment-by-course",
  asyncWrapper(StudentPaymentController.createStudentManualPaymentByCourse),
);
studentPaymentRouter.post(
  "/due-payment-by-course",
  asyncWrapper(StudentPaymentController.getStudentDuePaymentByCourse),
);
studentPaymentRouter.get("/stats", asyncWrapper(StudentPaymentController.getPaymentStats));
