// Custom error class for application-specific errors with enhanced context
export class AppError extends Error {
  public errorCode: string;
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, errorCode: string, statusCode: number, isOperational = true) {
    super(message);
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capturing the stack trace is useful for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}