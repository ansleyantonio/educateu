/*
 * Agent Commission Routes
 *
 * This module defines the complete routing configuration for agent commission management.
 * It provides endpoints for commission tracking, agent performance analytics,
 * and payout processing.
 *
 * Route Structure:
 * - / : Main commission listing with filtering
 * - /:agentId/detail : Individual agent commission details
 * - /:agentId/summary : Agent commission summary for dashboards
 * - /:agentId/breakdown : Year-wise commission breakdown
 * - /payouts/process : Commission payout processing
 */

import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AgentCommissionController } from "./controllers";

// Main agent commission router handling all commission-related endpoints.
export const adminAgentOverviewRouter = Router();

// Commission listing and filtering
adminAgentOverviewRouter.get("/", asyncWrapper(AgentCommissionController.getAgentCommissions));

// Commission payout processing

export default adminAgentOverviewRouter;
