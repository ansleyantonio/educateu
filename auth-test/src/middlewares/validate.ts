import { Request, Response, NextFunction, RequestHandler } from "express";
import { z } from "zod";

export const validate = (schema: z.ZodSchema<any>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body); // Only validate req.body

    if (!result.success) {
      res.status(400).json({
        message: "Validation error",
        errors: result.error.errors,
      });
      return; // Ensures function exits after sending response
    }

    next(); // Proceed if validation is successful
  };
};