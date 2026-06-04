import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import axios from "axios";
import { AxiosError } from "axios";
import { Prisma } from "@prisma/client";
import { MulterError } from "multer";

// Global error handler middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  err: AppError | MulterError,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Don't send response if headers already sent
  if (res.headersSent) {
    console.error('[Error Handler] Headers already sent, skipping response');
    return;
  }

  // If the error is an instance of AppError, we use its message and status code

  let errorCode;
  let statusCode;
  let message;

  if (err instanceof AppError) {
    errorCode = err.errorCode;
    statusCode = err.statusCode;
    message = err.message;
  }

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
      // handle other Multer error codes if needed
      default:
        statusCode = 400;
        message = `Multer error: ${err.message}`;
        break;
    }
  }

  // Axios error
  if (axios.isAxiosError(err)) {
    errorCode =
      err.response?.data.errorCode || err.response?.statusText || err.code;
    statusCode =
      err.response?.data.statusCode || err.response?.status || err.status;
    message = err.response?.data.message || err.message;

    // Log Axios error details
    console.error('[Axios Error]', {
      url: err.config?.url,
      method: err.config?.method,
      status: err.response?.status,
      message: err.message,
    });
  }

  // Prisma Error
  // PrismaClientKnownRequestError
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2000":
        errorCode = "VALUE_TOO_LONG";
        statusCode = 400;
        message = "Prisma: Value is too long for the column";
        break;
      case "P2001":
        errorCode = "RECORD_NOT_FOUND";
        statusCode = 404;
        message = "Prisma: Record not found";
        break;
      case "P2002":
        errorCode = "DUPLICATE_RECORD";
        statusCode = 409;
        message = "Prisma: Unique constraint failed";
        break;
      case "P2003":
        errorCode = "FOREIGN_KEY_CONSTRAINT";
        statusCode = 400;
        message = "Prisma: Foreign key constraint failed";
        break;
      case "P2004":
        errorCode = "CONSTRAINT_FAILED";
        statusCode = 400;
        message = "Prisma: A constraint failed on the database";
        break;
      case "P2005":
        errorCode = "INVALID_VALUE";
        statusCode = 400;
        message = "Prisma: Invalid value for column";
        break;
      case "P2006":
        errorCode = "MISSING_VALUE";
        statusCode = 400;
        message = "Prisma: Missing value for field";
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
        message =
          "Prisma: Multiple related records found where only one expected";
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
  }

  // PrismaClientUnknownRequestError
  else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    errorCode = "PRISMA_UNKNOWN_ERROR";
    statusCode = 500;
    message = "Prisma: An unknown error occurred";
  }

  // PrismaClientRustPanicError
  else if (err instanceof Prisma.PrismaClientRustPanicError) {
    errorCode = "PRISMA_RUST_PANIC";
    statusCode = 500;
    message = "Prisma: Rust panic in Prisma engine";
  }

  // PrismaClientInitializationError
  else if (err instanceof Prisma.PrismaClientInitializationError) {
    errorCode = "PRISMA_INIT_ERROR";
    statusCode = 500;
    message = "Prisma: Initialization error";
  }

  // PrismaClientValidationError
  else if (err instanceof Prisma.PrismaClientValidationError) {
    errorCode = "PRISMA_VALIDATION_ERROR";
    statusCode = 400;
    message = `Prisma: ${err.message}`;
  }

  errorCode = errorCode || "INTERNAL_SERVER_ERROR";
  statusCode = statusCode || 500;
  message = message || "Internal Server Error";

  // Log the error (In production, you should use a proper logging library)
  // console.error(err);

  // Send a structured response
  res.status(statusCode).json({
    status: "error",
    errorCode,
    statusCode,
    message,
  });
};
