import express from "express";
import { configurePublicRoutes } from "./public-file-upload-routes.config";
import { configureAuthenticatedFileUploadRoutes } from "./authenticated-file-upload-routes.config";
import { registerRoutes } from "./routes.config";
import {
  configureBasicMiddleware,
  configureAuthMiddleware,
  configureErrorHandlingMiddleware,
} from "./middleware.config";
import { startSessionScheduler } from "../modules/session/scheduler";
import payNowRouter, { stripePaymentRouter } from "../payments/routes";
import decisionRouter from "../payments/mail/routes";

/**
 * Initialize and configure the Express application
 */
export const initializeApp = (): express.Application => {
  const app = express();

  // Configure basic middleware
  configureBasicMiddleware(app);

  app.use("/payment-stripe", payNowRouter);
  app.use("/stripe-payments", stripePaymentRouter);
  app.use("/decision-emails", decisionRouter);

  // Configure middleware to parse JSON request bodies
  app.use(express.json());

  // Configure public file upload routes (before authentication)
  configurePublicRoutes(app);

  // Configure authentication middleware
  configureAuthMiddleware(app);

  // Register all application routes
  registerRoutes(app);

  // Configure authenticated file upload routes
  configureAuthenticatedFileUploadRoutes(app);

  // Configure error handling middleware (must be last)
  configureErrorHandlingMiddleware(app);

  // Start the session scheduler
  // This initializes scheduled jobs for automatic session management
  startSessionScheduler();

  return app;
};
