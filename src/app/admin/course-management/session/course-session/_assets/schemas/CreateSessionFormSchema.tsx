/* eslint-disable @typescript-eslint/no-explicit-any */
import { textSchema } from "@/lib/SchemaType/validationSchema";
import { ValidateDateGap } from "@/utils/DateGapValidator";
import { z } from "zod";

const statusSchema = z.enum(
  ["UPCOMING", "ACTIVE", "CLOSED", "TEMPORARILY_ACTIVE"],
  {
    required_error: "Session status is required",
    invalid_type_error: "Invalid session status",
  },
);

const baseSessionSchema = z.object({
  name: textSchema({ label: "Session Name" }),
  intakePeriod: z.enum(["january-april", "may-august", "september-december"], {
    required_error: "Intake Period is required",
    invalid_type_error: "Invalid Intake Period",
  }),
  year: z
    .number()
    .min(2000, "Year must be 4 digits")
    .max(9999, "Year must be 4 digits"),

  status: statusSchema,
  courseIds: z.array(z.string()).optional(),
  startDate: z.date({
    required_error: "Start date is required",
    invalid_type_error: "Invalid start date",
  }),
  endDate: z.date({
    required_error: "End date is required",
    invalid_type_error: "Invalid end date",
  }),
});

const validateAllSessionConditions = (data: any, ctx: z.RefinementCtx) => {
  if (data.status === "ACTIVE" || data.status === "UPCOMING") {
    const today = new Date();
    const minEndDate = new Date(today);
    minEndDate.setDate(today.getDate() + 30);

    if (data.endDate < minEndDate) {
      ctx.addIssue({
        path: ["endDate"],
        code: z.ZodIssueCode.custom,
        message:
          "End date must be at least 30 days from today when status is ACTIVE or UPCOMING",
      });
    }
  }

  ValidateDateGap({
    data,
    ctx,
    startKey: "startDate",
    endKey: "endDate",
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

export type ISessionForm = z.infer<typeof baseSessionSchema>;
