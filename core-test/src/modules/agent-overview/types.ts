/*
 * Agent Commission Type Definitions
 *
 * This module defines comprehensive type definitions and validation schemas
 * for agent commission management, including commission calculations,
 * tier assignments, and payout processing.
 *
 * Features:
 * - Commission query schemas with pagination
 * - Agent commission data structures
 * - Commission breakdown and year-wise tracking
 * - Payout processing validation
 */

import z from "zod";
import { sessionRouter } from "../session/routes";

// Schema for validating agent commission request parameters (GET method).
export const getAgentCommissionsReqQuerySchema = z.object({
  page: z.coerce.number().int().default(1),
  pageSize: z.coerce.number().int().default(10),
  searchTerm: z.string().optional(),
  agentId: z.string().uuid().optional(),
  commissionStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sessionId: z.string().uuid().optional(),
});

export type GetAgentCommissionsReqQuery = z.infer<typeof getAgentCommissionsReqQuerySchema>;

// Schema for agent commission detail requests.
export const getAgentCommissionDetailSchema = z.object({
  agentId: z.string().uuid(),
});

// Schema for commission payout processing.
export const processCommissionPayoutSchema = z.object({
  agentId: z.string().uuid(),
  commissionIds: z.array(z.string().uuid()).min(1),
  payoutAmount: z.number().positive(),
});

export type ProcessCommissionPayoutBody = z.infer<typeof processCommissionPayoutSchema>;

// Interface for year-wise commission breakdown.
export interface YearBreakdown {
  count: number;
  amount: number;
}

// Main interface for agent commission data.
export interface AgentCommissionData {
  agentId: string;
  agentName: string;
  firstName: string;
  commissionTier: string;
  totalStudent: number;
  potentialCommission: number;
  eligibleCommission: number;
  paidCommission: number;
  status: string;
  totalApprovedInvoices?: number;
  firstYear: number;
  secondYear: number;
  thirdYear: number;
  fourthYear: number;
}

export interface SemesterBreakdown {
  semester: string;
  totalPaid: number;
  totalCommission: number;
}

export interface CommissionBreakdown {
  totalStudents: number;
  potentialCommission: number;
  eligibleCommission: number;
  paidCommission: number;
  totalApprovedInvoices: number; // ✅ Add this

  recentActivity: Date | null;
  firstYear: YearBreakdown;
  secondYear: YearBreakdown;
  thirdYear: YearBreakdown;
  fourthYear: YearBreakdown;
  semesterWise?: SemesterBreakdown[]; // ✅ new
}
