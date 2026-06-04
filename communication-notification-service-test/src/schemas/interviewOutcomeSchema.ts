import { z } from 'zod';

export const interviewOutcomeSchema = z.object({
  applicationId: z.string().min(1, {
    message: 'Application ID is required',
  }),

  outcome: z
    .string()
    // .transform(val => val.toLowerCase())
    .refine(
      val =>
        val === 'PASS' ||
        val === 'FAIL' ||
        val === 'RESCHEDULED' ||
        val === 'PENDING' ||
        val === 'CANCELLED'
    ),
});

export type InterviewOutcomeRequest = z.infer<typeof interviewOutcomeSchema>;
