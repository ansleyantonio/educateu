import { z } from "zod";

export const actionTypes = [
  "payment_management",
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
