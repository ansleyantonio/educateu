/* eslint-disable @typescript-eslint/no-explicit-any */
import { textSchema } from "@/lib/SchemaType/validationSchema";
import { ValidateDateGap } from "@/utils/DateGapValidator";
import { z } from "zod";

const statusSchema = z.enum(["UPCOMING", "ACTIVE", "CLOSED"], {
  required_error: "Session status is required",
  invalid_type_error: "Invalid session status",
});

const baseSessionSchema = z.object({
  name: textSchema({ label: "Session Name" }),
  startTime: z
    .date({ required_error: "Start date is required" })
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid start date",
    }),
  endTime: z
    .date({ required_error: "End date is required" })
    .refine((date) => !isNaN(date.getTime()), {
      message: "Invalid end date",
    }),
  status: statusSchema,
});

const validateAllSessionConditions = (data: any, ctx: z.RefinementCtx) => {
  if (data.status === "ACTIVE" || data.status === "UPCOMING") {
    const today = new Date();
    const minEndDate = new Date(today);
    minEndDate.setDate(today.getDate() + 30);

    if (data.endTime < minEndDate) {
      ctx.addIssue({
        path: ["endTime"],
        code: z.ZodIssueCode.custom,
        message:
          "End date must be at least 30 days from today when status is ACTIVE or UPCOMING",
      });
    }
  }

  ValidateDateGap({
    data,
    ctx,
    startKey: "startTime",
    endKey: "endTime",
    minGap: "30d",
  });
};

const createSession = baseSessionSchema.superRefine(
  validateAllSessionConditions,
);

const updateSession = baseSessionSchema
  .partial()
  .superRefine(validateAllSessionConditions);

export const SessionSchema = {
  createSession,
  updateSession,
};

export type ISessionForm = z.infer<typeof createSession>;
