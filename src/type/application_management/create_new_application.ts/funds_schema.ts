import { z } from "zod";

export const funds_fromSchema = z.object({
  source: z.string().optional(),
});
