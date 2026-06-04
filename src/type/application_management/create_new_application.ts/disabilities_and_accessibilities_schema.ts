import { z } from "zod";

export const disability_and_accessibility_fromSchema = z.object({
  disabilityAndAccessibility: z.string().optional(),
});

//   disabilityAndAccessibility: z.string().min(1, "disabilityAndAccessibility is required."),
