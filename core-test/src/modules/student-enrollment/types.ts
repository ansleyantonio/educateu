import { z } from "zod";

export const getEnrollmentsReqBodySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    courseType: z.enum(["DIPLOMA_COURSE", "DEGREE_COURSE"]).optional(),
    awardingBodyId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    moduleId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    migrationStatus: z.boolean().optional(),
    searchTerm: z.string().optional(),
  })
  .strict();

export const migrateEnrollmentsSchema = z
  .object({
    studentEnrollmentIds: z.array(z.string().uuid()).min(1),
  })
  .strict();

export type EnrollmentsRequestBody = z.infer<typeof getEnrollmentsReqBodySchema>;
export type MigrateEnrollmentsRequestBody = z.infer<typeof migrateEnrollmentsSchema>;
