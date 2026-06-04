// Utility functions for standardizing API response format
import { SuccessResponse, Meta, Pagination } from "../types";
import { Response } from "express";

// Send standardized success response with optional pagination and metadata
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message = "Request was successful",
  statusCode = 200,
  pagination: Pagination = null,
  meta: Meta = null,
): void => {
  // Recursively remove null values from response data while preserving structure
  function removeNullValuesDeep(obj: T): T {
    if (obj === null || obj === undefined) return obj; // Preserve null/undefined if T allows it
    if (obj instanceof Date) return obj; // Preserve Date objects
    if (typeof obj !== "object") return obj; // Preserve primitives

    if (Array.isArray(obj)) {
      return obj.map(removeNullValuesDeep).filter((item) => item !== null) as T; // Recursively clean arrays
    }

    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, removeNullValuesDeep(value)]) // Recursively clean objects
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value !== null), // Remove null values
    );
  }

  // Clean response data and build standardized response object
  const cleanedData = removeNullValuesDeep(data);

  const response: SuccessResponse<T> = {
    status: "success",
    statusCode,
    message,
    data: cleanedData,
    ...(pagination && { pagination }),
    ...(meta && { meta }),
  };

  // Send formatted JSON response
  res.status(statusCode).json(response);
};
