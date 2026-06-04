/*
 * Global type definitions for EducateU Core Backend
 *
 * This file contains shared type definitions, interfaces, and schemas used
 * throughout the application. It includes request/response types, pagination
 * structures, and other common data types.
 */

import { Prisma } from "@prisma/client";
import { Request } from "express";
import z from "zod";

/*
 * Recursive Zod schema for Prisma JSON values
 *
 * This schema handles the validation of JSON data structures that can contain
 * nested objects and arrays. It supports all valid JSON value types including
 * primitives, arrays, and objects with recursive nesting.
 */
const jsonValueSchema: z.ZodType<Prisma.JsonValue> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.lazy(() => jsonValueSchema)), // Recursive array support
  z.record(z.lazy(() => jsonValueSchema)), // Recursive object support
]);

/*
 * User Portal Category Role type with included relations
 *
 * This type represents a user's role within a specific portal category,
 * including all related data such as role details, user portal category
 * information, and application access permissions.
 */
export type UserPortalCategoryRole = Prisma.UserPortalCategoryRoleGetPayload<{
  include: {
    role: true; // Include role details (permissions, name, etc.)
    userPortalCategory: true; // Include user portal category relationship
    userPortalCategoryRoleApplications: true; // Include application access
  };
}>;

/*
 * Extended Express Request interface with user information
 *
 * This interface extends the standard Express Request to include user
 * authentication data that is attached by the auth middleware.
 */
export interface RequestWithUser extends Request {
  // User information attached by authentication middleware
  user?: UserPortalCategoryRole;
  // eslint-disable-next-line @typescript-eslint/ban-types
  student?: Prisma.StudentGetPayload<{}>;
}

/*
 * Pagination metadata structure
 *
 * Contains information about paginated data including current page,
 * total items, and pagination calculations. Can be null when pagination
 * is not applicable.
 */
export type Pagination = {
  count: number; // Number of items in current page
  total: number; // Total number of items across all pages
  page: number; // Current page number
  perPage: number; // Number of items per page
  totalPages: number; // Total number of pages
} | null;

/*
 * Generic metadata type for additional response information
 *
 * Can contain any additional metadata that needs to be included
 * in API responses. Can be null when no metadata is needed.
 */
export type Meta = Record<string, unknown> | null;

/*
 * Standardized success response structure
 *
 * This interface defines the consistent structure for all successful
 * API responses throughout the application. It includes status information,
 * data payload, and optional pagination and metadata.
 */
export interface SuccessResponse<T> {
  // Status indicator for successful responses
  status: "success";
  // HTTP status code
  statusCode: number;
  // Human-readable success message
  message: string;
  // The actual response data
  data: T;
  // Optional pagination information
  pagination?: Pagination;
  // Optional additional metadata
  meta?: Meta;
}

export interface ErrorResponse {
  status: "error";
  errorCode: string;
  message: string;
  stack?: string | null; // Stack trace for development purposes, optional
}

/*
 * Zod schema for validating public course listing API request parameters
 *
 * This schema validates query parameters for the /api/v1/public/courses endpoint.
 * It ensures the required parameters are present with correct types and values,
 * and transforms the course type to uppercase for consistent database queries.
 */
export const publicGetCoursesReqSchema = z.object({
  type: z
    // Accept course types in lowercase and transform to uppercase for database queries
    .enum(["degree_course", "diploma_course", "professional_course", "cpd_course"])
    .transform((val) => val.toUpperCase()),
  // Convert page parameter to number, ensure it's at least 1, default to 1 if not provided
  page: z.coerce.number().min(1).default(1),
  // Convert pageSize parameter to number, ensure it's at least 1, default to 10 if not provided
  pageSize: z.coerce.number().min(1).default(10),
});

/*
 * TypeScript type for validated public course listing API request parameters
 *
 * This type is derived from publicGetCoursesReqSchema using z.infer,
 * providing type safety for the validated request parameters.
 */
export type PublicGetCoursesRequest = z.infer<typeof publicGetCoursesReqSchema>;
