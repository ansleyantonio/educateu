import z from "zod";

/*
 * Schema for validating application request query parameters.
 * Supports pagination with optional page parameter that defaults to 1.
 */
export const wellbeingGetApplicationsReqBodySchema = z
  .object({
    agentId: z.string().uuid().optional(),
    subAgentId: z.string().uuid().optional(),
    awardingBodyId: z.string().uuid().optional(),
    courseId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    applicationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    dateFrom: z.coerce.date().optional(),
    dateTo: z.coerce.date().optional(),
    nationality: z.string().optional(),
    year: z.coerce.number().optional(),
    admissionOfficer: z.string().optional(),

    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    searchTerm: z.string().min(1).optional(),
  })
  .strict();

/*
 * Type definition for application request query parameters.
 */
export type WellbeingGetApplicationsRequestBody = z.infer<typeof wellbeingGetApplicationsReqBodySchema>;
