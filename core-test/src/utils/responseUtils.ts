/*
 * Response utility functions for standardizing API responses
 *
 * This file provides utility functions for creating consistent, standardized
 * API responses across the EducateU application. It ensures all success
 * responses follow the same structure and includes data cleaning capabilities.
 *
 * Features:
 * - Standardized response format
 * - Automatic null value removal from response data
 * - Support for pagination metadata
 * - Support for additional metadata
 * - Configurable status codes and messages
 */

import { SuccessResponse, Meta, Pagination } from "../types";
import { Response } from "express";

/*
 * Sends a standardized success response with optional pagination and metadata
 *
 * This function creates a consistent response structure for all successful API calls.
 * It automatically cleans the response data by removing null values and provides
 * optional support for pagination and metadata.
 */
export const sendSuccessResponse = <T>(
  res: Response,
  data: T,
  message = "Request was successful",
  statusCode = 200,
  pagination: Pagination = null,
  meta: Meta = null,
): void => {
  /*
   * Recursively removes null values from objects and arrays
   *
   * This helper function traverses the data structure and removes any null
   * values while preserving undefined values, Date objects, and primitives.
   * This helps clean up the API response by removing unwanted null values
   * that might come from database queries or data transformations.
   */
  function removeNullValuesDeep(obj: T): T {
    // Preserve null/undefined values if the type allows it
    if (obj === null || obj === undefined) return obj;
    
    // Preserve Date objects as-is
    if (obj instanceof Date) return obj;
    
    // Preserve primitive values (string, number, boolean)
    if (typeof obj !== "object") return obj;

    // Handle arrays recursively
    if (Array.isArray(obj)) {
      return obj.map(removeNullValuesDeep).filter((item) => item !== null) as T;
    }

    // Handle objects recursively
    return Object.fromEntries(
      Object.entries(obj)
        .map(([key, value]) => [key, removeNullValuesDeep(value)]) // Clean each property
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value !== null), // Remove properties with null values
    );
  }

  // Clean the response data by removing null values
  const cleanedData = removeNullValuesDeep(data);

  // Construct the standardized response object
  const response: SuccessResponse<T> = {
    status: "success",
    statusCode,
    message,
    data: cleanedData,
    ...(pagination && { pagination }), // Include pagination if provided
    ...(meta && { meta }), // Include metadata if provided
  };

  // Send the JSON response with appropriate status code
  res.status(statusCode).json(response);
};
