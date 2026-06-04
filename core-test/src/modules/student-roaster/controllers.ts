import chalk from "chalk";
import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  getRegisteredStudentReqBodySchema,
  getRegistriesReqBodySchema,
  downloadCsvReqBodySchema,
  getSupportTokensReqBodySchema,
  assignSupportTokensBodySchema,
  resolveSupportTokensBodySchema,
  transferSupportTokensBodySchema,
} from "./types";
import { StudentRoasterService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { AppError } from "../../utils/AppError";
import { SupportTicketService } from "./supportTicket-service";
import z from "zod";

const getRegistries = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, getRegistriesReqBodySchema);

  const { registries, pagination } = await StudentRoasterService.getStudentRegistries(reqBody);

  sendSuccessResponse(res, registries, "Registry data fetched successfully", 200, pagination);
};

const getRegisteredStudentDetails = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, getRegisteredStudentReqBodySchema);

  const { studentInfo, pagination } = await StudentRoasterService.getRegisteredStudentDetails(reqBody);

  sendSuccessResponse(res, studentInfo, "Registered student details fetched successfully", 200, pagination);
};

const downloadCsv = async (req: RequestWithUser, res: Response) => {
  // Parse the request body for IDs and CSV fields
  const reqBody = zodSafeParse(req.body, downloadCsvReqBodySchema);

  const csvData = await StudentRoasterService.generateCsvData(reqBody);

  res.header("Content-Type", "text/csv");
  res.attachment("student-roaster.csv");
  res.status(200).send(csvData);
};

// get withdrawable course details
const getWithdrawableCourseDetails = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }

  const reqQuery = zodSafeParse(req.query, z.object({ sessionCourseId: z.string(), studentId: z.string() }));

  const withdrawableCourseDetails = await StudentRoasterService.getWithdrawableCourseDetails(reqQuery);

  sendSuccessResponse(res, withdrawableCourseDetails, "Withdrawable course details fetched successfully", 200);
};

const getStudentPaymentDetails = async (req: RequestWithUser, res: Response): Promise<void> => {
  const { email } = req.params;

  if (!email) {
      throw new AppError("Email address is required", "BAD_REQUEST", 400);
  }

  const result = await StudentRoasterService.getStudentPaymentDetails(email);

  sendSuccessResponse(res, result, "Payment history retrieved successfully");
}

// Manually Withdraw Course
const withdrawCourse = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, z.object({ studentId: z.string(), sessionCourseId: z.string() }));
  // Validate the request query parameters
  const withdrawal = await StudentRoasterService.withdrawCourse(userId, reqBody);

  sendSuccessResponse(res, withdrawal, "Withdraw Course Successfully", 200);
};

// Support Tokens Controller
const getSupportTokensController = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.query, getSupportTokensReqBodySchema);

  // Validate the request query parameters
  const supportTickets = await SupportTicketService.getSupportTokens(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tickets fetched successfully", 200);
};

// Transfer Support Tokens
const transferSupportTokens = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, transferSupportTokensBodySchema);

  // Validate the request query parameters
  const supportTickets = await SupportTicketService.transferSupportTokens(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens transferred successfully", 200);
};

// Assign Support Tokens
const assignSupportTokens = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, assignSupportTokensBodySchema);

  // Validate the request query parameters
  const supportTickets = await SupportTicketService.assignSupportTokens(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens assigned successfully", 200);
};

// Resolve Support Tokens
const resolveSupportTokens = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, resolveSupportTokensBodySchema);

  // Validate the request query parameters
  const supportTickets = await SupportTicketService.resolveSupportTokens(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens resolved successfully", 200);
};

// Reject Support Tokens
const rejectSupportTokens = async (req: RequestWithUser, res: Response) => {
  // Get the student ID from the authenticated student
  if (!req.user) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, resolveSupportTokensBodySchema);

  // Validate the request query parameters
  const supportTickets = await SupportTicketService.rejectSupportTicket(userId, reqBody);

  sendSuccessResponse(res, supportTickets, "Support tokens rejected successfully", 200);
};

export const StudentRoasterController = {
  getRegistries,
  getRegisteredStudentDetails,
  downloadCsv,
  getWithdrawableCourseDetails,
  withdrawCourse,

  // Support Tokens
  getSupportTokensController,
  transferSupportTokens,
  assignSupportTokens,
  resolveSupportTokens,
  rejectSupportTokens,
  getStudentPaymentDetails
};
