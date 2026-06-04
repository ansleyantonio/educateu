import * as z from "zod";

export const temporaryAccessSchema = z.object({
  limitedAccess: z.boolean(),
  read: z.boolean(),
  write: z.boolean(),
  delete: z.boolean(),
  fullAccess: z.boolean(),
  timeBased: z.boolean(),
  days: z.string().optional(),
  manualRevocation: z.boolean(),
  time: z.array(z.string()).min(1, "Please select at least one time option"),
});

export type TemporaryAccessFormValues = z.infer<typeof temporaryAccessSchema>;
