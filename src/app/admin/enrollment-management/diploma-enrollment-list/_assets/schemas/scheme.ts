import { z } from "zod";

const optionalTextSchema = z.string().optional();

export const filterDataSchema = z.object({
  awardingBodyId: optionalTextSchema,
  yearOfEntry: optionalTextSchema,
  courseId: optionalTextSchema,
  moduleId: optionalTextSchema,
  sessionId: optionalTextSchema,
  migrationStatus: z.boolean().optional(),
  finance: optionalTextSchema,
  financeCheck: optionalTextSchema,
  offerOfAcceptance: optionalTextSchema,
});

export type IFilterDataType = z.infer<typeof filterDataSchema>;
