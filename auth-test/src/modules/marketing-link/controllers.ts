import { Response, Request } from "express";
import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { marketingLinkSchema } from "./schema";
import { MarketingLinkService } from "./services";
import { AppError } from "../../utils/AppError";
import z from "zod";
import { applicationSchema } from "../../prisma/zodSchema/application";

/* Get all marketing links Controller */
const getMarketingLinks = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  const reqQuery = zodSafeParse(
    req.query,
    z.object({
      page: z.coerce.number().min(1).max(100).optional(),
      search: z.string().optional(),
      pageSize: z.coerce.number().min(1).max(100).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
  );

  const marketingLinks = await MarketingLinkService.getMarketingLinks(
    req.user,
    reqQuery,
  );

  sendSuccessResponse(
    res,
    marketingLinks,
    "Marketing links retrieved successfully",
    200,
  );
};

/* Create a marketing link Controller */
const createMarketingLink = async (req: RequestWithUser, res: Response) => {
  // console.log("Triggered to create marketing link");
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  const data = zodSafeParse(req.body, marketingLinkSchema);
  const response = await MarketingLinkService.createMarketingLink(
    data,
    req.user,
  );

  sendSuccessResponse(
    res,
    response,
    "Marketing link created successfully",
    200,
  );
};

/* Get a marketing link By Id Controller */
const getMarketingLinkById = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  const response = await MarketingLinkService.getMarketingLinkById(
    req.params.id,
    req.user,
  );

  sendSuccessResponse(
    res,
    response,
    "Marketing link retrieved successfully",
    200,
  );
};

/* Update a marketing link Controller */
const updateMarketingLinkById = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  const data = zodSafeParse(req.body, marketingLinkSchema);
  const response = await MarketingLinkService.updateMarketingLinkById(
    data,
    req.user,
    req.params.id,
  );

  sendSuccessResponse(
    res,
    response,
    "Marketing link updated successfully",
    200,
  );
};

/* Delete a marketing link Controller */
const deleteMarketingLinkById = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  const response = await MarketingLinkService.deleteMarketingLinkById(
    req.params.id,
    req.user,
  );

  sendSuccessResponse(
    res,
    response,
    "Marketing link deleted successfully",
    200,
  );
};

/* Get a marketing link report by Id Controller */
const getMarketingLinkReports = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }
  const reqQuery = zodSafeParse(
    req.query,
    z.object({
      page: z.coerce.number().min(1).max(100).optional(),
      search: z.string().optional(),
      pageSize: z.coerce.number().min(1).max(100).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      startDate: z.coerce.date().optional(),
      endDate: z.coerce.date().optional(),
      sortBy: z.string().optional(),
      sortOrder: z.enum(["asc", "desc"]).optional(),
    }),
  );

  const response = await MarketingLinkService.getMarketingLinkReports(
    req.user,
    reqQuery,
  );

  sendSuccessResponse(
    res,
    response,
    "Marketing link report retrieved successfully",
    200,
  );
};

/* create Application by market link */
const createApplicationByCode = async (req: Request, res: Response) => {
  const data = zodSafeParse(req.body, applicationSchema);

  const response = await MarketingLinkService.createApplicationByCode(
    data,
    req.params.id,
  );

  sendSuccessResponse(res, response, "Application created successfully", 200);
};

/* Export all marketing link controllers */
export const MarketingLinkController = {
  createMarketingLink,
  getMarketingLinks,
  getMarketingLinkById,
  updateMarketingLinkById,
  deleteMarketingLinkById,
  getMarketingLinkReports,

  // createApplication by market link
  createApplicationByCode,
};
