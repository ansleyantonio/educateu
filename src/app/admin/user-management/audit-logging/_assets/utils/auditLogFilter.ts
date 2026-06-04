import { z } from "zod";

export const actionTypes = [
  "user_creation",
  "user_update",
  "success_login",
  "failed_login",
  "password_reset",
  "module_permission",
  "role_assign",
  "user_activation",
  "user_deactivation",
] as const;

export type ActionType = (typeof actionTypes)[number];

// Schema
export const AuditLogFilterFormSchema = z
  .object({
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    name: z.string().trim().optional(),
    actionTypes: z.array(z.enum(actionTypes)).optional().default([]),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    },
  );
