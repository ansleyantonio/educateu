/*
 * Async wrapper utility for Express route handlers
 *
 * This utility provides a wrapper function for Express route handlers that use
 * async/await syntax. It automatically catches any thrown errors and passes
 * them to the Express error handling middleware, eliminating the need for
 * try-catch blocks in every async route handler.
 */

import { Request, Response, NextFunction } from "express";
import { logError } from "../middlewares/errorHandler";

/*
 * Wraps async Express route handlers to automatically handle promise rejections
 */
export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Execute the wrapped async function
      await fn(req, res, next);
    } catch (error) {
      // Automatically pass any caught errors to Express error handling middleware
      next(error);
    }
  };
};

/**
 * Wraps background async functions to catch and log errors
 * Useful for setImmediate, setTimeout, or background processes
 * where there is no Express 'next' function available.
 */
export const backgroundAsyncWrapper = <T extends unknown[]>(fn: (...args: T) => Promise<void>) => {
  return (...args: T) => {
    fn(...args).catch((error) => {
      logError(error);
    });
  };
};
