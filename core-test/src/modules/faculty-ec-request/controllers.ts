import chalk from "chalk";
import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { ECRequestTicketService } from "./service";
import { getECRequestTicketReqBodySchema, rejectECRequestTicketBodySchema, resolveEC2TokensBodySchema } from "./types";

// Support Tokens Controller
const getECRequestTickets = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.query, getECRequestTicketReqBodySchema);

  // Validate the request query parameters
  const supportTickets = await ECRequestTicketService.getECRequestTickets(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens fetched successfully", 200);
};

// Resolve EC2 Support Tokens
const resolveECRequestTicket = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, resolveEC2TokensBodySchema);

  // Validate the request query parameters
  const supportTickets = await ECRequestTicketService.resolveECRequestTicket(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens resolved successfully", 200);
};

// Reject Support Tokens
const rejectECRequestTicket = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, rejectECRequestTicketBodySchema);

  // Validate the request query parameters
  const supportTickets = await ECRequestTicketService.rejectECRequestTicket(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens rejected successfully", 200);
};

export const ECRequestController = {
  getECRequestTickets,
  rejectECRequestTicket,
  resolveECRequestTicket,
};
