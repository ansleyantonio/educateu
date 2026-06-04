import { Response } from "express";
import { RequestWithUser } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  getAgentCommissionsReqQuerySchema,
  getAgentCommissionDetailSchema,
  processCommissionPayoutSchema,
} from "./types";
import { AgentCommissionService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import z from "zod";
import prisma from "../../prismaClient";

const getAgentCommissions = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getAgentCommissionsReqQuerySchema);

  const { agents, pagination } = await AgentCommissionService.getAgentCommissions(reqQuery);

  sendSuccessResponse(res, { agents }, "Agent commissions retrieved successfully", undefined, pagination);
};

export const AgentCommissionController = {
  getAgentCommissions,
};
