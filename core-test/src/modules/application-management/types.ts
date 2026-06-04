/*
 * Application Management Module Type Definitions
 *
 * This module defines type definitions and validation schemas for application management operations.
 * It provides schemas for different user roles (admin, agent) with role-specific filtering capabilities
 * for application queries, supporting complex filtering across multiple dimensions.
 *
 * Features:
 * - Comprehensive application query schemas with multi-dimensional filtering
 * - Role-based query parameter validation (admin vs agent views)
 * - Support for filtering by agents, companies, officers, intake periods, and status
 * - Stage-based application filtering for workflow management
 *
 * Author: EducateU Development Team
 * Version: 1.0.0
 */

import { z } from "zod";

/*
 * Schema for validating comprehensive application query parameters.
 *
 * This schema supports advanced filtering capabilities for administrators
 * and admission officers who need to view applications across multiple dimensions.
 *
 * Supported filters:
 * - Pagination with page parameter
 * - Agent and sub-agent filtering
 * - Company-based filtering
 * - Admission officer assignment filtering
 * - Intake period and year filtering
 * - Application status and nationality filtering
 */
export const getApplicationsReqQuerySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    "agent-id": z.string().uuid().optional(),
    "sub-agent-id": z.string().uuid().optional(),
    "company-id": z.string().uuid().optional(),
    "admission-officer-id": z.string().uuid().optional(),
    "intake-period": z.string().optional(),
    year: z.coerce.date().optional(),
    "application-status": z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
    nationality: z.string().optional(),
    search: z.string().optional(),
  })
  .strict();

/*
 * Type definition for comprehensive application query parameters.
 */
export type AllApplicationsQuery = z.infer<typeof getApplicationsReqQuerySchema>;

/*
 * Schema for validating agent-specific application query parameters.
 *
 * This schema provides a restricted set of filtering options for agents,
 * focusing on their own applications and sub-agents while supporting
 * stage-based workflow filtering.
 *
 * Supported filters:
 * - Pagination with page parameter
 * - Sub-agent filtering (for agents managing sub-agents)
 * - Intake period filtering
 * - Application status filtering (PENDING, ACCEPTED, REJECTED)
 * - Application stage filtering (NEW, ASSIGN, CHECK, SUBMIT, OUTCOME)
 */
export const agentGetApplicationsReqQuerySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    "sub-agent": z.string().uuid().optional(),
    "intake-period": z.string().optional(),
    "application-status": z.enum(["PENDING", "ACCEPTED", "REJECTED"]).optional(),
    "application-stage": z.enum(["NEW", "ASSIGN", "CHECK", "SUBMIT", "OUTCOME"]).optional(),
    applicationStatus: z.string().optional(),
    applicationStage: z.string().optional(),
    subAgent: z.string().optional(),
    intakePeriod: z.string().optional(),
    awardingBody: z.string().optional(),
    emailStatus: z.string().optional(),
    interviewStatus: z.string().optional(),
    interviewOutcome: z.string().optional(),
    offerResponse: z.string().optional(),
    search: z.string().optional(),
  })
  .strict();

/*
 * Type definition for agent-specific application query parameters.
 */
export type AgentGetApplicationsReqQuery = z.infer<typeof agentGetApplicationsReqQuerySchema>;
