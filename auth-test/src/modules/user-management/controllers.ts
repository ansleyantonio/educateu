import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import z from "zod";
import { UserManagementService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";

/**
 * Get users by module name (single module)
 * GET /user-management/module/:moduleName/users
 */
const getUsersByModuleName = async (req: RequestWithUser, res: Response) => {
  const params = zodSafeParse(
    req.params,
    z.object({ moduleName: z.string() }),
  );

  const result = await UserManagementService.getUsersByModuleName(params.moduleName);

  sendSuccessResponse(res, result);
};

/**
 * Get users by multiple module names
 * GET /user-management/modules/users?modules=student,role,application
 */
const getUsersByMultipleModules = async (req: RequestWithUser, res: Response) => {
  const query = zodSafeParse(
    req.query,
    z.object({
      modules: z.string(), // comma-separated module names
    }),
  );

  // Split comma-separated string into array
  const moduleNames = query.modules.split(",").map((m: string) => m.trim()).filter((m: string) => m);

  if (moduleNames.length === 0) {
    throw new Error("Please provide at least one module name");
  }

  const result = await UserManagementService.getUsersByMultipleModules(moduleNames);

  sendSuccessResponse(res, result);
};

export const UserManagementController = {
  getUsersByModuleName,
  getUsersByMultipleModules,
};
