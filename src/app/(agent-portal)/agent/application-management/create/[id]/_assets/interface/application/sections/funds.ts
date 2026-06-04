import { z } from "zod";

export const fund = z.object({
  source: z.string().min(1, {
    message: "Sources of Funds is required.",
  }),
});
