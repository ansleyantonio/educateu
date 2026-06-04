/*
 * Zod validation utilities for consistent data validation
 *
 * This file provides utility functions for working with Zod schemas in the
 * EducateU application. It includes safe parsing with automatic error handling
 * and user-friendly error message generation for validation failures.
 *
 * Features:
 * - Safe parsing with automatic AppError throwing
 * - Human-readable error message generation
 * - Comprehensive coverage of Zod error types
 * - Consistent error handling across the application
 */

import { z } from "zod";
import { AppError } from "./AppError";
import { ZodError } from "zod";

/*
 * Safely parses data using a Zod schema and throws AppError on validation failure
 *
 * This function wraps Zod's safeParse method to automatically handle validation
 * errors by converting them to AppError instances with user-friendly messages.
 * This eliminates the need for manual error checking throughout the application.
 */
export const zodSafeParse = (data: unknown, schema: z.ZodSchema) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = getZodErrorMessages(result.error);
    throw new AppError(message, "BAD_REQUEST", 400);
  }
  return result.data;
};

/*
 * Converts Zod validation errors into human-readable error messages
 *
 * This function takes a ZodError and generates a user-friendly error message
 * that can be returned to API clients. It handles all common Zod error types
 * and provides context about which field failed validation and why.
 */
export const getZodErrorMessages = (error: ZodError, isUnionError?: boolean): string => {
  // Get the first error from the error array for simplicity
  const err = error.errors[0];
  
  // Build a readable field path for the error message
  const path = err.path.length ? err.path.at(-1) + (err.path.length > 1 ? " in " + err.path.at(-2) : "") : "Value";

  // Handle different types of validation errors with specific messages
  if (err.code === "invalid_type") {
    return `${path}: Expected type ${err.expected}, but received ${err.received}.`;
  } else if (err.code === "invalid_literal") {
    return `${path}: Invalid literal value, expected ${err.expected}.`;
  } else if (err.code === "too_small") {
    return `${path}: Value is too small. Minimum allowed is ${err.minimum}${err.type === "string" ? " characters" : ""}.`;
  } else if (err.code === "too_big") {
    return `${path}: Value is too big. Maximum allowed is ${err.maximum}${err.type === "string" ? " characters" : ""}.`;
  } else if (err.code === "invalid_enum_value") {
    return `${path}: Invalid enum value. Expected one of ${err.options.join(", ")}.`;
  } else if (err.code === "invalid_union_discriminator") {
    return `${path}: Invalid discriminator value. Expected one of ${err.options.join(", ")}.`;
  } else if (err.code === "invalid_date") {
    return `${path}: Invalid date format.`;
  } else if (err.code === "invalid_string") {
    return `${path}: Invalid string format. ${err.validation ? `Validation: ${err.validation}.` : ""}`;
  } else if (err.code === "invalid_intersection_types") {
    return `${path}: Intersection type mismatch.`;
  } else if (err.code === "not_multiple_of") {
    return `${path}: Value must be a multiple of ${err.multipleOf}.`;
  } else if (err.code === "custom") {
    return `${path}: ${err.message || "Custom validation failed."}`;
  } else if (err.code === "invalid_arguments") {
    return `${path}: Invalid function arguments.`;
  } else if (err.code === "invalid_return_type") {
    return `${path}: Invalid function return type.`;
  } else if (err.code === "unrecognized_keys") {
    return `${path}: Unrecognized keys in object: ${err.keys.join(", ")}.`;
  } else if (err.code === "invalid_union" && !isUnionError) {
    // Handle union errors recursively to get the first meaningful error
    return getZodErrorMessages(err.unionErrors[0], true);
  } else {
    // Fallback for any unhandled error types
    return `${path}: Unknown error: ${err.message}`;
  }
};
