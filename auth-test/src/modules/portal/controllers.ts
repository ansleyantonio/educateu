import { RequestWithUser } from "../../types";
import { Response } from "express";
import { PortalService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { portalCategoryModuleSchema, portalSchema } from "./schema";

const getPortals = async (req: RequestWithUser, res: Response) => {
  const portals = await PortalService.getPortals();

  sendSuccessResponse(res, { categories: portals });
};
const createPortal = async (req: RequestWithUser, res: Response) => {
  const data = zodSafeParse(req.body, portalSchema);
  const portal = await PortalService.createPortal(data);

  sendSuccessResponse(res, portal, "Portal created successfully", 201);
};

export const assignPortalModules = async (
  req: RequestWithUser,
  res: Response
) => {
  const parsed = zodSafeParse(req.body, portalCategoryModuleSchema);

  const portal = await PortalService.assignModulesToPortal(parsed);

  sendSuccessResponse(res, portal, "Modules assigned successfully");
};

export const PortalController = {
  getPortals,
  createPortal,
  assignPortalModules,
};
