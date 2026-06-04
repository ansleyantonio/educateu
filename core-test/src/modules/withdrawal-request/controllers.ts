import chalk from "chalk";
import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { WithdrawalRequestService } from "./service";
import {
  getWithdrawalRequestTicketReqBodySchema,
  rejectWithdrawalRequestTicketBodySchema,
  resolveWithdrawalRequestTicketBodySchema,
} from "./types";

// Support Tokens Controller
const getWithdrawalRequestTickets = async (req: RequestWithUser, res: Response) => {
  // Get the user ID from the authenticated student
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.query, getWithdrawalRequestTicketReqBodySchema);

  // Validate the request query parameters
  const supportTickets = await WithdrawalRequestService.getWithdrawalRequestTickets(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Withdrawal request tickets fetched successfully", 200);
};

// Resolve EC2 Support Tokens
const resolveWithdrawalRequestTicket = async (req: RequestWithUser, res: Response) => {
  // Verify that student information is attached to the request
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, resolveWithdrawalRequestTicketBodySchema);

  // Validate the request query parameters
  const supportTickets = await WithdrawalRequestService.resolveWithdrawSupportTicket(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Withdrawal request tickets resolved successfully", 200);
};

// Reject Support Tokens
const rejectWithdrawalRequestTicket = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, rejectWithdrawalRequestTicketBodySchema);

  // Validate the request query parameters
  const supportTickets = await WithdrawalRequestService.rejectECRequestTicket(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Withdrawal request tickets rejected successfully", 200);
};

export const WithdrawalRequestController = {
  getWithdrawalRequestTickets,
  resolveWithdrawalRequestTicket,
  rejectWithdrawalRequestTicket,
};
