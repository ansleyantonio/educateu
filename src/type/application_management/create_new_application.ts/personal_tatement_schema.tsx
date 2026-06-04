import { z } from "zod";

export const personal_statement_fromSchema = z.object({
  statement: z.string().optional(),
});

//   statement: z.string().min(1, "statement is required."),
