import { Request, Response, NextFunction } from "express";

export const asyncWrapper = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Don't call next if response already sent
      if (res.headersSent) {
        console.error('[asyncWrapper] Error after response sent:', error);
        return;
      }
      next(error);
    }
  };
};
