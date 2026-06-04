/*
 * Admission Module Type Definitions
 *
 * This module defines comprehensive type definitions and validation schemas for the admission system.
 * It includes schemas for application queries, note management, file check operations, and various
 * admission-related data structures with complex validation rules.
 *
 * Features:
 * - Application and admission officer query schemas with pagination
 * - Note type definitions with conditional validation rules
 * - File check status management schemas
 * - Complex validation logic for different note types
 * - Document status tracking enums
 */

import { z } from "zod";

// Schema for validating application request query parameters.
// Supports pagination with optional page parameter that defaults to 1.
export const admissionGetApplicationsReqBodySchema = z
  .object({
    agentId: z.string().uuid().optional(),
    subAgentId: z.string().uuid().optional(),
    admissionOfficerId: z.string().uuid().optional(),
    awardingBodyId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    year: z.coerce.number().optional(),
    applicationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    nationality: z.string().optional(),
    interviewOutcome: z.enum(["PASS", "FAIL", "PENDING"]).optional(),
    ownership: z.enum(["ALL", "OWN"]).optional().default("ALL"),
    additionalFileCheckStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),

    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    searchTerm: z.string().min(1).optional(),
  })
  .strict();

// Type definition for application request query parameters.
export type AdmissionGetApplicationsRequestBody = z.infer<typeof admissionGetApplicationsReqBodySchema>;

// Schema for validating application request query parameters.
// Supports pagination with optional page parameter that defaults to 1.

// Schema for validating admission officer request query parameters.
// Supports pagination and optional search functionality.
export const getAdmissionOfficersReqQuerySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    searchTerm: z.string().min(1).optional(),
  })
  .strict();

// Type definition for admission officer request query parameters.
export type AdmissionOfficerRequestQuery = z.infer<typeof getAdmissionOfficersReqQuerySchema>;

// Enum defining the different types of notes that can be added to applications.
//
// - GENERAL: Standard notes without specific requirements
// - UPDATE_REQUEST: Notes requesting updates to specific fields
// - FILE_UPDATE_REQUEST: Notes requesting file updates
// - CHECK: Notes for file verification
// - ADDITIONAL_CHECK: Notes for additional file verification
export const NoteType = z.enum(["GENERAL", "UPDATE_REQUEST", "FILE_UPDATE_REQUEST", "CHECK", "ADDITIONAL_CHECK"]);

// Comprehensive schema for application notes with conditional validation.
//
// This schema implements complex business rules:
// - UPDATE_REQUEST notes must include fieldName but not attachmentName
// - FILE_UPDATE_REQUEST, CHECK, and ADDITIONAL_CHECK notes must include attachmentName but not fieldName
// - GENERAL notes must not include fieldName or attachmentName
export const applicationNoteSchema = z
  .object({
    note: z.string().min(3),
    type: NoteType.default("GENERAL"),
    visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC").optional(),
    fieldName: z.string().optional(),
    attachmentName: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // Validation for UPDATE_REQUEST type notes
    if (data.type === "UPDATE_REQUEST") {
      if (!data.fieldName || data.fieldName.trim() === "") {
        ctx.addIssue({
          path: ["fieldName"],
          code: z.ZodIssueCode.custom,
          message: "fieldName is required when type is UPDATE_REQUEST",
        });
      }
      if (data.attachmentName && data.attachmentName.trim() !== "") {
        ctx.addIssue({
          path: ["attachmentName"],
          code: z.ZodIssueCode.custom,
          message: "attachmentName must not be present when type is UPDATE_REQUEST",
        });
      }
    }

    // Validation for file-related note types
    if (data.type === "FILE_UPDATE_REQUEST" || data.type === "CHECK" || data.type === "ADDITIONAL_CHECK") {
      if (!data.attachmentName || data.attachmentName.trim() === "") {
        ctx.addIssue({
          path: ["attachmentName"],
          code: z.ZodIssueCode.custom,
          message: "attachmentName is required when type is FILE_UPDATE_REQUEST, CHECK or ADDITIONAL_CHECK",
        });
      }
      if (data.fieldName && data.fieldName.trim() !== "") {
        ctx.addIssue({
          path: ["fieldName"],
          code: z.ZodIssueCode.custom,
          message: "fieldName must not be present when type is CHECK or ADDITIONAL_CHECK",
        });
      }
    }

    // Validation for GENERAL type notes
    if (data.type === "GENERAL") {
      if (data.fieldName && data.fieldName.trim() !== "") {
        ctx.addIssue({
          path: ["fieldName"],
          code: z.ZodIssueCode.custom,
          message: "fieldName must not be present when type is GENERAL",
        });
      }
      if (data.attachmentName && data.attachmentName.trim() !== "") {
        ctx.addIssue({
          path: ["attachmentName"],
          code: z.ZodIssueCode.custom,
          message: "attachmentName must not be present when type is GENERAL",
        });
      }
    }
  });

// Type definition for application notes derived from the schema.
export type ApplicationNote = z.infer<typeof applicationNoteSchema>;

// Enum defining document status values for file checks.
//
// Tracks the progress of document verification:
// - PENDING: Document awaiting review
// - INFORMATION_REQUIRED: Additional information needed
// - INFORMATION_REQUIRED_ADDITIONAL: Additional supplementary information needed
// - NO_INFORMATION_REQUIRED: Document approved, no further action needed
// - NO_INFORMATION_REQUIRED_ADDITIONAL: Document approved with additional notes
const documentStatusEnum = z.enum([
  "PENDING",
  "INFORMATION_REQUIRED",
  "INFORMATION_REQUIRED_ADDITIONAL",
  "NO_INFORMATION_REQUIRED",
  "NO_INFORMATION_REQUIRED_ADDITIONAL",
]);

// Schema for updating general file checks with business rule validation.
//
// Validates an array of file check updates where:
// - Each item must have an attachment name and status
// - Notes are required when status is "INFORMATION_REQUIRED"
// - At least one item must be provided in the array
export const updateGeneralFileChecksSchema = z
  .array(
    z.object({
      attachmentName: z.string().min(1),
      status: documentStatusEnum,
      note: z.string().min(3).optional(),
    }),
  )
  .min(1)
  .superRefine((items, ctx) => {
    // Ensure notes are provided when information is required
    items.forEach((item, index) => {
      if (item.status === "INFORMATION_REQUIRED" && !item.note) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Note is required when status is "INFORMATION_REQUIRED"',
          path: [index, "note"],
        });
      }
    });
  });

// Type definition for general file check updates.
export type UpdateGeneralFileChecks = z.infer<typeof updateGeneralFileChecksSchema>;
