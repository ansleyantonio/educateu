import { Response } from "express";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import { zodSafeParse } from "../../utils/zodUtils";
import { createEmailTemplateReqBodySchema, getTemplatesReqBodySchema, updateEmailTemplateReqBodySchema } from "./types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { EmailTemplateService } from "./service";
import { EmailType } from "@prisma/client";

// Get email template variable
const getEmailTemplateVariable = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  // const userId = req.user?.userPortalCategory?.userId;
  const type = req.query.type as EmailType;

  const emailTemplate = await EmailTemplateService.getEmailTemplateVariable(type);

  sendSuccessResponse(res, emailTemplate, "Email template variable retrieved successfully", 200);
};

// Get email templates by type
const getEmailTemplatesByType = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;
  const type = req.query.type as EmailType;

  const emailTemplates = await EmailTemplateService.getEmailTemplates(type);

  sendSuccessResponse(res, emailTemplates, "Email templates retrieved successfully", 200);
};

// Get preview email templates
const getPreviewEmailTemplatesByType = async (req: RequestWithUser, res: Response) => {
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.query, getTemplatesReqBodySchema);

  const emailTemplates = await EmailTemplateService.getPreviewEmailTemplates(reqBody);

  sendSuccessResponse(res, emailTemplates, "Email templates retrieved successfully", 200);
};

// createEmailTemplate
const createEmailTemplate = async (req: RequestWithUser, res: Response) => {
  // Verify that user information is attached to the request
  if (!req.user?.userPortalCategory?.userId) {
    throw new AppError("User information not found in request", "UNAUTHORIZED", 401);
  }
  const userId = req.user?.userPortalCategory?.userId;

  const reqBody = zodSafeParse(req.body, createEmailTemplateReqBodySchema);

  const emailTemplate = await EmailTemplateService.createEmailTemplate(userId, reqBody);

  sendSuccessResponse(res, emailTemplate, "Email template created successfully", 200);
};

export const EmailTemplateController = {
  getEmailTemplateVariable,
  getEmailTemplatesByType,
  getPreviewEmailTemplatesByType,
  createEmailTemplate,
};
