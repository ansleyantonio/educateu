import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import z from "zod";
import { UserService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";

const getUserAssignableRoles = async (req: RequestWithUser, res: Response) => {
  const params = zodSafeParse(
    req.params,
    z.object({ userId: z.string().uuid() }),
  );

  const userAssignableRoles = await UserService.getUserAssignableRoles(
    params.userId,
  );

  sendSuccessResponse(res, { allRoleList: userAssignableRoles });
};

const getUserAssignedRoles = async (req: RequestWithUser, res: Response) => {
  const params = zodSafeParse(
    req.params,
    z.object({ userId: z.string().uuid() }),
  );

  const userAssignedRoles = await UserService.getUserAssignedRoles(
    params.userId,
  );

  sendSuccessResponse(res, { assignedRoleData: userAssignedRoles });
};

export const UserController = {
  getUserAssignableRoles,
  getUserAssignedRoles,
};
