import { z } from "zod";

export const fund = z.object({
  source: z.string().optional(),
});
