import { z } from "zod";

export const personal_statement = z.object({
  statement: z.string().optional(),
});
