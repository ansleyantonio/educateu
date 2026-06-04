import z from 'zod';

export const PRESCREENOUTCOME = z.enum([
  'DID_NOT_PICK_UP',
  'PRE_SCREENING_PASSED',
  'INCOMPLETE_OR_PENDING',
  'PRE_SCREENING_FAILED',
  'PRE_SCREENING_FAILED_2ND_TIME',
]);

export const sendPreScreenOutcomeEmailSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
  outcome: PRESCREENOUTCOME,
});
