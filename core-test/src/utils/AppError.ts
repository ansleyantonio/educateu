/*
 * Custom Application Error class for EducateU Core Backend
 *
 * This file defines a custom error class that extends the native JavaScript Error
 * to provide additional context and structure for application-specific errors.
 * It enables consistent error handling throughout the application with proper
 * categorization and HTTP status codes.
 */

/*
 * Custom application error class with enhanced error information
 *
 * This class extends the native Error class to provide structured error handling
 * with additional properties for error categorization, HTTP status codes, and
 * operational error identification.
 *
 * Features:
 * - Custom error codes for easy error categorization
 * - HTTP status codes for proper API responses
 * - Operational error flagging to distinguish between operational and programming errors
 * - Stack trace preservation for debugging
 */
export class AppError extends Error {
  // Custom error code for categorizing the type of error
  public errorCode: string;

  // HTTP status code appropriate for the error
  public statusCode: number;

  // Flag indicating whether this is an operational error (expected) or programming error
  public isOperational: boolean;

  /*
   * Creates a new AppError instance
   */
  constructor(message: string, errorCode: string, statusCode: number, isOperational = true) {
    // Call parent constructor with error message
    super(message);
    
    // Set custom error properties
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // Capture stack trace for debugging purposes
    // This excludes the constructor itself from the stack trace
    Error.captureStackTrace(this, this.constructor);
  }
}
