import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import { JsonValue } from "@prisma/client/runtime/library";

export const authorize = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
  });

  if (!user) throw new AppError("User not found", "UNAUTHORIZED", 401);

  if (req.user?.userPortalCategoryId) {
    const userPortalCategory = await prisma.userPortalCategory.findUnique({
      where: { id: req.user.userPortalCategoryId },
    });

    if (!userPortalCategory)
      throw new AppError("User portal category not found", "FORBIDDEN", 403);
  }

  // Normalize URL
  const cleanUrl = req.originalUrl.split("?")[0];
  const segments = cleanUrl.split("/").filter(Boolean);
  const moduleName = segments[0]; // assumes URL starts with module name
  let permission = req.method;
  if (req.method === "PUT" || req.method === "PATCH") permission = "POST";

  // Get all permission records for user
  const userPortalCategoryModules =
    await prisma.userPortalCategoryModule.findMany({
      where: { userId: req.user?.userId },
      include: { module: { select: { name: true } } },
    });

  // console.log("User Portal Category Modules:", userPortalCategoryModules);
  // Filter for the current module
  const currentModuleRecords = userPortalCategoryModules.filter(
    (upcm) => upcm.module.name === moduleName
  );

  if (currentModuleRecords.length === 0) {
    throw new AppError("No permission found for this module", "FORBIDDEN", 403);
  }

  // Resolve permission priority: TEMPORARY > PERMANENT > ROLE
  let modulePermission: JsonValue = [];

  // 1️⃣ Check TEMPORARY permissions
  const tempAccess = currentModuleRecords.find(
    (r) => r.permissionType === "TEMPORARY" && !r.manualRevocation
  );
  if (tempAccess) {
    const { permissionStartDate, permissionEndDate } = tempAccess;
    if (!permissionStartDate || !permissionEndDate) {
      throw new AppError("Invalid temporary permission", "FORBIDDEN", 403);
    }

    const now = new Date();
    if (
      now >= new Date(permissionStartDate) &&
      now <= new Date(permissionEndDate)
    ) {
      modulePermission = tempAccess.modulePermission;
    }
  }

  if (
    !modulePermission ||
    (Array.isArray(modulePermission) && modulePermission.length === 0)
  ) {
    const permAccess = currentModuleRecords.find(
      (r) => r.permissionType === "PERMANENT"
    );
    if (permAccess) modulePermission = permAccess.modulePermission;
  }

  if (
    !modulePermission ||
    (Array.isArray(modulePermission) && modulePermission.length === 0)
  ) {
    const roleAccess = currentModuleRecords.find(
      (r) => r.permissionType === "ROLE"
    );
    if (roleAccess) modulePermission = roleAccess.modulePermission;
  }

  if (
    !modulePermission ||
    !Array.isArray(modulePermission) ||
    !modulePermission.includes(permission)
  ) {
    // throw new AppError("No permission for this action", "FORBIDDEN", 403);
    throw new AppError(
      "User does not have permission for this action",
      "FORBIDDEN",
      403
    );
  }

  next();
};
