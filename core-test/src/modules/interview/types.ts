import z from "zod";

const nonEmptyStringSchema = z.string().min(1);
export const createInterviewSchema = z.object({
  interviewerId: z.string().uuid().optional(),
  title: nonEmptyStringSchema,
  interviewDate: z.coerce.date(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  platform: nonEmptyStringSchema,
  interviewLink: nonEmptyStringSchema,
  guests: z.array(z.string().email()),
  color: nonEmptyStringSchema,
});

export type CreateInterviewSchema = z.infer<typeof createInterviewSchema>;

export type DayInfo = {
  day: number;
  name: string;
  weekday: number; // 0 (Sunday) to 6 (Saturday)
  monthName: string;
  year: number;
  dateString: string; // JavaScript date string
};

export type MonthDays = {
  month: string;
  year: number;
  days: DayInfo[];
};

export const interviewGetApplicationsReqBodySchema = z
  .object({
    interviewOutcome: z.enum(["PASS", "FAIL", "PENDING", "BOOKED", "RESCHEDULED", "CANCELLED"]).optional(),
    ownership: z.enum(["ALL", "OWN"]).optional().default("ALL"),

    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    searchTerm: z.string().min(1).optional(),
  })
  .strict();

  export const updateInterviewOutcomeSchema = z
  .object({
      outcome: z.string().transform((val) => val.toUpperCase()),
      // outcome: z.string(),
      interviewDate: z.coerce.date().optional(),
    startTime: z.coerce.date().optional(),
    endTime: z.coerce.date().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.outcome === "RESCHEDULED") {
        if (!data.interviewDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "interviewDate is required",
            path: ["interviewDate"],
          });
        }
        if (!data.startTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "startTime is required",
            path: ["startTime"],
          });
        }
        if (!data.endTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "endTime is required",
            path: ["endTime"],
          });
        }
      }
    });

/*
 * Type definition for application request query parameters.
 */
export type InterviewGetApplicationsRequestBody = z.infer<typeof interviewGetApplicationsReqBodySchema>;
