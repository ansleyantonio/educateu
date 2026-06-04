/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";

const statusSchema = z
  .enum(["UPCOMING", "ACTIVE", "CLOSED", "TEMPORARILY_ACTIVE"], {
    invalid_type_error: "Invalid session status",
  })
  .optional();

const baseSessionSchema = z.object({
  intakePeriod: z
    .enum(["january-april", "may-august", "september-december"], {
      invalid_type_error: "Invalid Intake Period",
    })
    .optional(),

  year: z
    .number()
    .min(2000, "Year must be 4 digits")
    .max(9999, "Year must be 4 digits")
    .optional(),

  status: statusSchema,

  startDate: z
    .date({
      invalid_type_error: "Invalid start date",
    })
    .optional(),

  endDate: z
    .date({
      invalid_type_error: "Invalid end date",
    })
    .optional(),
});

// Export the schema
export const filterSession = baseSessionSchema;

export const SessionSchema = {
  filterSession,
};

export type IFilterSessionForm = z.infer<typeof baseSessionSchema>;
