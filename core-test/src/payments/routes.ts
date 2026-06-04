import { Router } from "express";
import { PayNowController } from "./controllers";
import { asyncWrapper } from "../utils/asyncWrapper";
import express from "express";
import { StripePaymentController } from "./stripeControllers";

const payNowRouter = Router();

payNowRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }), // This is correct
  asyncWrapper(PayNowController.handleStripeWebhook),
);

// Test endpoints
payNowRouter.get("/webhook-test", asyncWrapper(PayNowController.testWebhook));

export default payNowRouter;

const stripePaymentRouter = Router();
const manualPaymentRouter = Router();

stripePaymentRouter.post("/create-checkout-session", asyncWrapper(StripePaymentController.createCheckoutSession));
stripePaymentRouter.post("/save-payment", asyncWrapper(StripePaymentController.savePaymentData));
stripePaymentRouter.get("/payment-success/:sessionId", asyncWrapper(StripePaymentController.verifyPayment));
stripePaymentRouter.get("/payment-canceled", asyncWrapper(StripePaymentController.handlePaymentCanceled));
stripePaymentRouter.get("/payment-success", asyncWrapper(StripePaymentController.handlePaymentSuccess));
manualPaymentRouter.post("/create-manual-payment", asyncWrapper(StripePaymentController.createManualPayment));

export { stripePaymentRouter, manualPaymentRouter };
