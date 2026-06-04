import { z } from "zod";

export const references_fromSchema = z.object({
  relationship: z.string().optional(),
  otherRelationship: z.string().optional(),
  email: z
    .string()
    .min(1, "Email is required.")
    .email({ message: "Invalid email format." }),
});
