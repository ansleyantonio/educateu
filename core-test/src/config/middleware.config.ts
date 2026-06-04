import express from "express";
import { errorHandler } from "../middlewares/errorHandler";
import { auth } from "../middlewares/auth";
import { asyncWrapper } from "../utils/asyncWrapper";

/**
 * Configure basic Express middleware
 */
export const configureBasicMiddleware = (app: express.Application) => {
  // Serve static files from public directory
  app.use(express.static("public"));
};

/**
 * Configure authentication middleware
 * This middleware extracts and validates user information from requests
 * All routes below this middleware will require valid authentication
 */
export const configureAuthMiddleware = (app: express.Application) => {
  app.use(asyncWrapper(auth));
};

/**
 * Configure error handling middleware
 * This must be the last middleware to catch and handle any unhandled errors
 */
export const configureErrorHandlingMiddleware = (app: express.Application) => {
  app.use(
    (
      error: AppError | MulterError | Error,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      errorHandler(error as any, req, res, next);
    },
  );
};

// Types for error handling
type AppError = import("../utils/AppError").AppError;
type MulterError = import("multer").MulterError;

