import { z } from 'zod';

export const decisionRequestSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  outcome: z.enum(['APPROVED_UNCONDITIONAL', 'APPROVED_CONDITIONAL', 'REJECTED', 'PENDING']).default('PENDING'),
});