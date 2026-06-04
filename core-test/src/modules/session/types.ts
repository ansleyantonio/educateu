import z from "zod";
import { MonthEnum } from "../awarding-body/types";

const nonEmptyString = z.string().min(1, "Field cannot be empty");

export const createSessionReqBodySchema = z
  .object({
    name: nonEmptyString,
    intakePeriod: MonthEnum,
    year: z.number().int().positive(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(["ACTIVE", "UPCOMING"]).optional().default("UPCOMING"),
    courseIds: z.array(z.string().uuid()).optional(),
  })
  .strict();

export type CreateSessionRequestBody = z.infer<typeof createSessionReqBodySchema>;

export const updateSessionReqBodySchema = z
  .object({
    stage: z.enum(["COMPLETED", "IN_PROGRESS"]).optional().default("IN_PROGRESS"),
    name: nonEmptyString,
    intakePeriod: MonthEnum,
    year: z.number().int().positive(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    status: z.enum(["ACTIVE", "UPCOMING", "CLOSED", "TEMPORARILY_ACTIVE"]),
    courseIds: z.array(z.string().uuid()).optional(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const getSessionCoursesReqBodySchema = z.object({
  stage: z.enum(["COMPLETED", "IN_PROGRESS"]).optional().default("IN_PROGRESS"),
  page: z.coerce.number().min(1).default(1),
  search: z.string().optional(),
  pageSize: z.coerce.number().min(1).default(10),
  intakePeriod: z.string().min(3).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  status: z
    .union([
      z.enum(["ACTIVE", "UPCOMING", "CLOSED", "TEMPORARILY_ACTIVE"]),
      z.array(z.enum(["ACTIVE", "UPCOMING", "CLOSED", "TEMPORARILY_ACTIVE"])),
    ])
    .optional(),
});

export type UpdateSessionRequestBody = z.infer<typeof updateSessionReqBodySchema>;

export type RoleDataType = {
  awardingBodyTemplates?: {
    awardingBodyId: string;
    status: string;
  }[];
};
