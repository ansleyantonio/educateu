// Type definitions and schemas for the EducateU Authentication Service
import { Prisma } from "@prisma/client";
import e, { Request } from "express";
import z from "zod";

// Validation schema for non-empty strings (minimum 3 characters)
export const nonEmptyString = z.string().min(3);

// Schema for user data attached to authenticated requests
export const userInRequestSchema = z.object({
  userId: z.string().uuid(),
  // TODO: Have to make portalCategoryId required
  userPortalCategoryId: z.string().uuid().optional(),
});

export const studentInRequestSchema = z.object({
  // studentId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type StudentJwtPayload = z.infer<typeof studentInRequestSchema>;
// export type User = Prisma.UserGetPayload<{
//   include: {
//     userRoles: true;
//     userPortalCategories: true;
//     userPortalCategoryModules: true;
//   };
// }>;

// Type derived from user request schema
export type UserInRequest = z.infer<typeof userInRequestSchema>;

// Extended Express Request interface with authenticated user data
export interface RequestWithUser extends Request {
  user?: UserInRequest;
  userPortalCategoryId?: string;
}

export interface studentRequest extends Request {
  user?: {
    userId: string;
  };
}

// Pagination metadata for paginated API responses
export type Pagination = {
  count: number; // Number of items in current page
  total: number; // Total number of items
  page: number; // Current page number
  perPage: number; // Items per page
  totalPages: number; // Total number of pages
} | null;

// Additional metadata for API responses
export type Meta = Record<string, unknown> | null;

// Standardized success response format for API endpoints
export interface SuccessResponse<T> {
  status: "success";
  statusCode: number;
  message: string;
  data: T;
  pagination?: Pagination;
  meta?: Meta;
}

// Standardized error response format for API endpoints
export interface ErrorResponse {
  status: "error";
  errorCode: string;
  message: string;
  stack?: string | null; // Stack trace for development purposes, optional
}

// JSON value types for type-safe JSON handling
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonArray;

// JSON object and array type definitions
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];
