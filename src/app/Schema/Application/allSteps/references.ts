import { z } from "zod";

export const references = z.object({
  relationship: z.string().optional(),
});
