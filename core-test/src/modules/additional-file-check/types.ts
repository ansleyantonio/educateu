import z from "zod";

/*
 * Schema for validating application request query parameters.
 * Supports pagination with optional page parameter that defaults to 1.
 */
export const additionalFileCheckGetApplicationsReqBodySchema = z
  .object({
    agentId: z.string().uuid().optional(),
    subAgentId: z.string().uuid().optional(),
    admissionOfficerId: z.string().uuid().optional(),
    awardingBodyId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    year: z.coerce.number().optional(),
    applicationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    nationality: z.string().optional(),
    interviewOutcome: z.enum(["PASS", "FAIL", "PENDING"]).optional(),

    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    searchTerm: z.string().min(1).optional(),
  })
  .strict();

/*
 * Type definition for application request query parameters.
 */
export type AdditionalFileCheckGetApplicationsRequestBody = z.infer<
  typeof additionalFileCheckGetApplicationsReqBodySchema
>;
