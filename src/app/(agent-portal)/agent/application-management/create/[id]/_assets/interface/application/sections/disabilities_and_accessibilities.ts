import { z } from "zod";

export const disability_and_accessibility = z.object({
  disabilityAndAccessibility: z.array(z.string()).optional(),
  disabilityAndAccessibilityOther: z.string().optional(),
});

//   disabilityAndAccessibility: z.string().min(1, "disabilityAndAccessibility is required."),
