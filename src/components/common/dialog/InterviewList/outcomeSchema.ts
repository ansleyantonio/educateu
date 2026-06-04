import * as z from "zod";

export const OutcomeSchema = z.object({
  outcomes: z.record(z.string(), z.string()), // { [interviewId]: outcome }
});

export type OutcomeFormValues = z.infer<typeof OutcomeSchema>;
