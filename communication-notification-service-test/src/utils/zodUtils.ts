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

import type { ZodError, ZodSchema } from 'zod';
import { AppError } from './AppError';

/*
 * Safely parses data using a Zod schema and throws AppError on validation failure
 *
 * This function wraps Zod's safeParse method to automatically handle validation
 * errors by converting them to AppError instances with user-friendly messages.
 * This eliminates the need for manual error checking throughout the application.
 */
export const zodSafeParse = <T>(data: unknown, schema: ZodSchema<T>): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const message = getZodErrorMessages(result.error);
    throw new AppError(message, 'BAD_REQUEST', 400);
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
export const getZodErrorMessages = (
  error: ZodError,
  isUnionError?: boolean
): string => {
  // Get the first error from the issues array for simplicity
  const err = error.issues[0];
  if (!err) return 'Validation failed';

  // Build a readable field path for the error message
  const path = err.path.length
    ? String(err.path[err.path.length - 1]) +
      (err.path.length > 1
        ? ' in ' + String(err.path[err.path.length - 2])
        : '')
    : 'Value';

  // Handle different types of validation errors with specific messages
  switch (err.code) {
    case 'invalid_type':
      return `${path}: Expected type ${err.expected}, but received ${err.input === null ? 'null' : err.input === undefined ? 'undefined' : typeof err.input}.`;
    case 'invalid_value':
      return `${path}: Invalid value. Expected one of ${err.values.join(', ')}.`;
    case 'too_big':
      return `${path}: Value is too big. Maximum allowed is ${err.maximum}${err.origin === 'string' || err.origin === 'array' ? ' characters' : ''}.`;
    case 'too_small':
      return `${path}: Value is too small. Minimum allowed is ${err.minimum}${err.origin === 'string' || err.origin === 'array' ? ' characters' : ''}.`;
    case 'invalid_format':
      return `${path}: Invalid format.${err.format ? ` Format: ${err.format}.` : ''}`;
    case 'not_multiple_of':
      return `${path}: Value must be a multiple of ${err.divisor}.`;
    case 'unrecognized_keys':
      return `${path}: Unrecognized keys in object: ${err.keys.join(', ')}.`;
    case 'invalid_union':
      if (
        !isUnionError &&
        'errors' in err &&
        err.errors &&
        Array.isArray(err.errors) &&
        err.errors.length > 0
      ) {
        const nestedError = { issues: err.errors[0] };
        return getZodErrorMessages(nestedError as ZodError, true);
      }
      return `${path}: Invalid value for union.`;
    case 'invalid_key':
      return `${path}: Invalid key.`;
    case 'invalid_element':
      return `${path}: Invalid element.`;
    case 'custom':
      return `${path}: ${err.message ?? 'Custom validation failed.'}`;
    default:
      return `${path}: ${(err as { message?: string }).message ?? 'Validation failed'}`;
  }
};
