/*
 * Global error handler middleware and logging utility for EducateU Core Backend
 */

import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";
import axios from "axios";

/**
 * Cleans Prisma validation error messages for client responses.
 */
function parsePrismaValidationError(rawMessage: string): string {
  // Try to extract the field inside a "where" clause
  const fieldMatch = rawMessage.match(/where:\s*\{\s*(\w+):/);
  const field = fieldMatch?.[1] ?? "field";

  // Try to extract the invalid value (quoted string or literal)
  const valueMatch = rawMessage.match(/(?::\s*)(["'])(.*?)\1/);
  const invalidValue = valueMatch?.[2] ?? "provided value";

  // Try to extract the expected type (e.g. "EmailType")
  const expectedMatch = rawMessage.match(/Expected\s+([^\n.]+)/);
  const expectedType = expectedMatch?.[1] ?? "a valid value";

  // If none of the patterns matched, fall back to the first line of the error
  if (!fieldMatch && !valueMatch && !expectedMatch) {
    const firstLine = rawMessage.split("\n")[0];
    return `Validation error: ${firstLine}`;
  }

  return `Invalid value for '${field}': "${invalidValue}". Expected ${expectedType}.`;
}

/**
 * Logs error details for debugging purposes
 * This can be used in both middleware and background tasks
 */
export const logError = (err: unknown): void => {
  // Log basic error
  console.error(err);

  if (axios.isAxiosError(err)) {
    // Log Axios error details
    console.error("[Axios Error]", {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      message: err.message,
      data: err.response?.data,
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("[Prisma Error]", {
      code: err.code,
      message: err.message,
      meta: err.meta,
    });
  }
};

/*
 * Global error handler middleware that processes all application errors
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (err: AppError | MulterError, _req: Request, res: Response, _next: NextFunction): void => {
  // Use the shared logging utility
  console.log(err);

  logError(err);

  // Initialize error response variables
  let errorCode;
  let statusCode;
  let message;

  /*
   * Handle custom application errors (AppError instances)
   * These are errors thrown by the application with specific error codes and status codes
   */
  if (err instanceof AppError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    message = err.message;
  }

  /*
   * Handle file upload errors (MulterError instances)
   * These errors occur during file upload operations and need specific handling
   */
  if (err instanceof MulterError) {
    errorCode = "UPLOAD_ERROR";

    switch (err.code) {
      case "LIMIT_FILE_SIZE":
        statusCode = 400;
        message = "File size exceeds the allowed limit";
        break;
      case "LIMIT_UNEXPECTED_FILE":
        statusCode = 400;
        message = "Unexpected file field";
        break;
      // Handle other Multer error codes as needed
      default:
        statusCode = 400;
        message = `Multer error: ${err.message}`;
        break;
    }
  }
  if (axios.isAxiosError(err)) {
    errorCode = err.response?.data.errorCode || err.response?.statusText || err.code;
    statusCode = err.response?.data.statusCode || err.response?.status || err.status;
    message = err.response?.data.message || err.message;
  }
  /*
   * Handle Prisma database errors (PrismaClientKnownRequestError)
   * These are database-level errors with specific error codes that need appropriate handling
   */
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Extract metadata from error for more detailed error messages
    const meta = typeof err.meta === "object" && err.meta !== null ? (err.meta as Record<string, unknown>) : undefined;

    switch (err.code) {
      case "P2000":
        errorCode = "VALUE_TOO_LONG";
        statusCode = 400;
        message = `Prisma: Value is too long for the column "${meta?.column_name || "unknown"}"`;
        break;
      case "P2001":
        errorCode = "RECORD_NOT_FOUND";
        statusCode = 404;
        message = "Prisma: Record not found";
        break;
      case "P2002": {
        errorCode = "DUPLICATE_RECORD";
        statusCode = 409;
        const meta =
          typeof err?.meta === "object" && err?.meta !== null ? (err?.meta as Record<string, unknown>) : undefined;
        const targetField =
          Array.isArray(meta?.target) && typeof meta?.target[0] === "string" ? meta?.target[0] : "unknown";
        message = `Prisma: Unique constraint failed on field "${targetField}"`;
        break;
      }
      case "P2003":
        errorCode = "FOREIGN_KEY_CONSTRAINT";
        statusCode = 400;
        message = `Prisma: Foreign key constraint failed on field "${meta?.field_name || "unknown"}"`;
        break;
      case "P2004":
        errorCode = "CONSTRAINT_FAILED";
        statusCode = 400;
        message = "Prisma: A constraint failed on the database";
        break;
      case "P2005":
        errorCode = "INVALID_VALUE";
        statusCode = 400;
        message = `Prisma: Invalid value for column "${meta?.column_name || "unknown"}"`;
        break;
      case "P2006":
        errorCode = "MISSING_VALUE";
        statusCode = 400;
        message = `Prisma: Missing value for field "${meta?.field_name || "unknown"}"`;
        break;
      case "P2007":
        errorCode = "INVALID_JSON";
        statusCode = 400;
        message = "Prisma: Invalid JSON value";
        break;
      case "P2008":
        errorCode = "QUERY_PARSE_ERROR";
        statusCode = 400;
        message = "Prisma: Query parsing error";
        break;
      case "P2009":
        errorCode = "QUERY_VALIDATION_ERROR";
        statusCode = 400;
        message = "Prisma: Query validation error";
        break;
      case "P2010":
        errorCode = "RAW_QUERY_ERROR";
        statusCode = 400;
        message = "Prisma: Raw query failed";
        break;
      case "P2011":
        errorCode = "NULL_CONSTRAINT";
        statusCode = 400;
        message = "Prisma: Null constraint violation";
        break;
      case "P2012":
        errorCode = "MISSING_REQUIRED_VALUE";
        statusCode = 400;
        message = "Prisma: Missing required value";
        break;
      case "P2013":
        errorCode = "MISSING_ARGUMENT";
        statusCode = 400;
        message = "Prisma: Missing argument in relation or data";
        break;
      case "P2014":
        errorCode = "RELATED_RECORD_ERROR";
        statusCode = 400;
        message = "Prisma: Incorrect number of records in relation";
        break;
      case "P2015":
        errorCode = "RECORD_RELATION_ERROR";
        statusCode = 404;
        message = "Prisma: Record not found or relation error";
        break;
      case "P2016":
        errorCode = "QUERY_INTERPRETER_ERROR";
        statusCode = 400;
        message = "Prisma: Error in query interpreter";
        break;
      case "P2017":
        errorCode = "RELATION_VIOLATION";
        statusCode = 400;
        message = "Prisma: Multiple related records found where only one expected";
        break;
      case "P2018":
        errorCode = "PATH_ERROR";
        statusCode = 400;
        message = "Prisma: Path error for relation";
        break;
      case "P2019":
        errorCode = "INPUT_ERROR";
        statusCode = 400;
        message = "Prisma: Input error";
        break;
      case "P2020":
        errorCode = "VALUE_OUT_OF_RANGE";
        statusCode = 400;
        message = "Prisma: Value out of range";
        break;
      case "P2021":
        errorCode = "TABLE_NOT_FOUND";
        statusCode = 500;
        message = "Prisma: Table not found";
        break;
      case "P2022":
        errorCode = "COLUMN_NOT_FOUND";
        statusCode = 500;
        message = "Prisma: Column not found";
        break;
      case "P2023":
        errorCode = "INCOMPATIBLE_COLUMN";
        statusCode = 400;
        message = "Prisma: Incompatible column type";
        break;
      case "P2024":
        errorCode = "TIMEOUT";
        statusCode = 503;
        message = "Prisma: Operation timed out";
        break;
      case "P2025":
        errorCode = "RECORD_NOT_FOUND";
        statusCode = 404;
        message = "Prisma: Record to update/delete does not exist";
        break;
      case "P2026":
        errorCode = "UNSUPPORTED_FEATURE";
        statusCode = 400;
        message = "Prisma: Unsupported feature or platform";
        break;
      case "P2027":
        errorCode = "TRANSACTION_API_ERROR";
        statusCode = 400;
        message = "Prisma: Transaction API error";
        break;
      case "P2028":
        errorCode = "RESTART_TRANSACTION";
        statusCode = 400;
        message = "Prisma: Transaction conflict, restart required";
        break;
      case "P2030":
        errorCode = "FIELD_DEFINITION_MISMATCH";
        statusCode = 400;
        message = "Prisma: Field definition mismatch";
        break;
      case "P2033":
        errorCode = "DATABASE_INTERNAL_ERROR";
        statusCode = 500;
        message = "Prisma: Database internal error";
        break;
      default:
        errorCode = `PRISMA_${err.code}`;
        statusCode = 400;
        message = `Prisma: ${err.message}`;
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    // 4. Validation error – bad input / wrong type / missing field
    errorCode = "PRISMA_VALIDATION_ERROR";
    statusCode = 400;
    // Use the parser to return a readable message
    message = parsePrismaValidationError(err.message);
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    /*
     * Handle unknown Prisma errors
     * These are database errors that don't fall into known categories
     */
    errorCode = "PRISMA_UNKNOWN_ERROR";
    statusCode = 500;
    message = "Prisma: An unknown error occurred";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    /*
     * Handle Prisma Rust engine panic errors
     * These are critical errors in the underlying Prisma engine
     */
    errorCode = "PRISMA_RUST_PANIC";
    statusCode = 500;
    message = "Prisma: Rust panic in Prisma engine";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    /*
     * Handle Prisma initialization errors
     * These occur when the Prisma client fails to initialize properly
     */
    errorCode = "PRISMA_INIT_ERROR";
    statusCode = 500;
    message = "Prisma: Initialization error";
  }
  // Set default values for unhandled error types
  errorCode = errorCode || "INTERNAL_SERVER_ERROR";
  statusCode = statusCode || 500;
  message = message || "Internal Server Error";

  /*
   * Send standardized error response to client
   * All errors are formatted consistently with status, errorCode, statusCode, and message
   */
  res.status(statusCode).json({
    status: "error",
    errorCode,
    statusCode,
    message,
  });
};
