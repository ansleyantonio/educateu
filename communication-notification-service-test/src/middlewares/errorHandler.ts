import type { Request, Response, NextFunction } from 'express';
import { HttpException } from './errorTypes';
import { AppError } from '../utils/AppError';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

interface ErrorResponse {
  success: boolean;
  status: number;
  message: string;
  timestamp: string;
  path: string;
  stack?: string;
}

export const errorHandler = (
  err: Error | HttpException | AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  // Default error
  let status = 500;
  let message = 'Internal Server Error';

  // Check if it's our custom HttpException
  if (err instanceof HttpException) {
    status = err.status;
    message = err.message;
  }

  // Check if it's AppError (from Zod validation)
  if (err instanceof AppError) {
    status = err.statusCode;
    message = err.message;
  }

  // Email (Nodemailer / SMTP errors)
  const smtpError = err as Error & {
    response?: string;
    responseCode?: number;
  };

  if (smtpError.response || smtpError.responseCode) {
    const smtpResponse = smtpError.response ?? '';

    switch (true) {
      case smtpResponse.includes('Daily user sending limit exceeded'):
      case smtpResponse.includes('5.4.5'):
        status = 429;
        message =
          'Email sending limit exceeded for today. Please try again after 24 hours.';
        break;

      case smtpResponse.includes('Invalid login'):
      case smtpResponse.includes('Authentication'):
        status = 401;
        message = 'Email service authentication failed.';
        break;

      default:
        status = 502;
        message = 'Email service rejected the email.';
    }
  }

  // Handle Prisma errors
  if (err instanceof PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        // Record not found for update/delete
        status = 404;
        message = 'Resource not found';
        break;
      case 'P2002':
        // Unique constraint failed
        status = 409;
        message = 'Resource already exists';
        break;
      case 'P2003':
        // Foreign key constraint failed
        status = 400;
        message = 'Invalid reference to related resource';
        break;
      default:
        status = 400;
        message = 'Database operation failed';
    }
  }

  // Prepare error response
  const errorResponse: ErrorResponse = {
    success: false,
    status,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  };

  // Add stack trace in development environment
  if (process.env['NODE_ENV'] === 'development' && err.stack) {
    errorResponse.stack = err.stack;
  }

  // Log the error
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - ${status} - ${message}`
  );
  // Only log stack trace for server errors (5xx)
  if (status >= 500 && err.stack) {
    console.error(err.stack);
  }

  // Send error response
  res.status(status).json(errorResponse);
};
