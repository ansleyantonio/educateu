import { Response } from "express";
import { nonEmptyString, RequestWithUser } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  createRoleReqBodySchema,
  filterRolesReqBodySchema,
  getRolesReqQuerySchema,
  updateRoleReqBodySchema,
} from "./types";
import { RoleService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import z from "zod";
import prisma from "../../prismaClient";
import { getUserIdsByRoleId } from "./users";

const getRoles = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getRolesReqQuerySchema);

  const { rolesWithUserCount, paginationData } =
    await RoleService.getRoles(reqQuery);

  sendSuccessResponse(
    res,
    { roles: rolesWithUserCount },
    "Roles retrieved successfully",
    undefined,
    paginationData,
  );
};

const filterRoles = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, filterRolesReqBodySchema);

  const { roles, paginationData } = await RoleService.filterRoles(reqBody);

  sendSuccessResponse(
    res,
    { roles },
    "Roles retrieved successfully",
    undefined,
    paginationData,
  );
};

const getRolesPortalByUserId = async (req: RequestWithUser, res: Response) => {
  const userId = zodSafeParse(
    req.params,
    z.object({ userId: z.string() }),
  ).userId;

  const roles = await RoleService.getRolesPortalByUserId(userId);

  sendSuccessResponse(res, roles, "Data retrieved successfully");
};
const createRole = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, createRoleReqBodySchema);

  await RoleService.createRole(reqBody);

  if (req.user) {
    await prisma.auditLog.create({
      data: {
        action: `User create role ${reqBody.roleName}`,
        userId: req.user?.userId,
      },
    });
  }

  sendSuccessResponse(res, undefined, "Role created successfully");
};

const updateRole = async (req: RequestWithUser, res: Response) => {
  const roleId = zodSafeParse(
    req.params,
    z.object({ roleId: z.string().uuid() }),
  ).roleId;
  const oldRole = await prisma.role.findUnique({
    where: {
      id: roleId,
    },
  });
  if (!oldRole) {
    return sendSuccessResponse(res, undefined, "Role not found", 404);
  }
  const reqBody = zodSafeParse(req.body, updateRoleReqBodySchema);

  await RoleService.updateRole(roleId, reqBody);

  if (req.user) {
    await prisma.auditLog.create({
      data: {
        action: `User update role ${oldRole?.name} to ${reqBody.roleName}`,
        userId: req.user?.userId,
      },
    });
  }
  setImmediate(() => {
    getUserIdsByRoleId(roleId);
  });
  sendSuccessResponse(res, undefined, "Role updated successfully");
};

const getRoleIncludingPermissions = async (
  req: RequestWithUser,
  res: Response,
) => {
  const reqBody = zodSafeParse(
    req.body,
    z.object({
      roleId: z.string().uuid(),
      categoryId: z.string().uuid(),
    }),
  );

  const role = await RoleService.getRoleIncludingPermissions({
    roleId: reqBody.roleId,
    categoryId: reqBody.categoryId,
  });

  sendSuccessResponse(res, { modules: role }, "Role retrieved successfully");
};

const updateRoleModules = async (req: RequestWithUser, res: Response) => {
  console.log("Updating role modules with request body:", req.body); // Debug log
  const reqBody = zodSafeParse(
    req.body,
    z.object({
      roleId: z.string(),
      modules: z.array(
        z.object({
          moduleId: z.string().uuid(),
          modulePermission: z.array(z.string()),
        }),
      ),
    }),
  );

  const result = await RoleService.updateRoleModules(
    reqBody.roleId,
    reqBody.modules,
  );

  sendSuccessResponse(res, result, "Role modules updated successfully");
};

const archiveRole = async (req: RequestWithUser, res: Response) => {
  const roleId = zodSafeParse(
    req.params,
    z.object({ roleId: z.string().uuid() }),
  ).roleId;

  const reqBody = zodSafeParse(
    req.body,
    z.object({ status: z.enum(["ARCHIVED", "ACTIVE"]) }),
  );

  const result = await RoleService.archiveRole(roleId, reqBody.status);

  sendSuccessResponse(res, result, "Role archived successfully");
};

export const RoleController = {
  getRoles,
  archiveRole,
  createRole,
  updateRole,
  getRolesPortalByUserId,
  getRoleIncludingPermissions,
  filterRoles,
  updateRoleModules,
};
