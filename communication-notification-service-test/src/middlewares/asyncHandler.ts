import type { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Async Controller Wrapper
 *
 * Wraps async route handlers to catch any rejected promises and pass the error
 * to the next middleware (our global error handler).
 *
 * Usage:
 * router.get('/users', asyncHandler(getUsers));
 *
 * Instead of:
 * router.get('/users', (req, res, next) => {
 *   getUsers(req, res).catch(next);
 * });
 */
export const asyncHandler =
  (fn: RequestHandler) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
