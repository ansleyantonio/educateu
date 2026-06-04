import { z } from 'zod';

// Define the schema for the Stripe application outcome email request
export const stripeApplicationOutcomeSchema = z.object({
  applicationId: z.string().min(1, { message: "Application ID is required" }),
  outcome: z.enum(['APPROVED_UNCONDITIONAL', 'APPROVED_CONDITIONAL', 'REJECTED'])
});

// Export the inferred type
export type StripeApplicationOutcomeRequest = z.infer<typeof stripeApplicationOutcomeSchema>;