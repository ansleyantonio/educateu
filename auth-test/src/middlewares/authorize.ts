import { Response, NextFunction } from "express";
import { RequestWithUser } from "../types";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
// import { Prisma } from "@prisma/client/extension";
import { Prisma } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/library";

export const authorize = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user?.userId,
    },
  });

  if (!user) {
    throw new AppError("User not found", "UNAUTHORIZED", 401);
  }

  if (req.user?.userPortalCategoryId) {
    const userPortalCategory = await prisma.userPortalCategory.findUnique({
      where: {
        id: req.user.userPortalCategoryId,
      },
    });

    if (!userPortalCategory) {
      throw new AppError("User portal category not found", "FORBIDDEN", 403);
    }
  }

  const cleanUrl = req.originalUrl.split("?")[0]; // Remove query string
  const segments = cleanUrl.split("/").filter(Boolean);
  const moduleName = segments[0];
  let permission = req.method;
  if (req.method === "PUT" || req.method === "PATCH") {
    permission = "POST";
  }

  // type UserPortalCategoryModule = Prisma.UserPortalCategoryModuleGetPayload<{}>;
  //
  // let userPortalCategoryModule: UserPortalCategoryModule | undefined;

  const userPortalCategoryModules =
    await prisma.userPortalCategoryModule.findMany({
      where: {
        AND: [
          {
            userId: req.user?.userId,
          },
          {
            module: {
              name: moduleName,
            },
          },
        ],
      },
    });

  if (userPortalCategoryModules.length === 0) {
    throw new AppError("User has no portal category module", "FORBIDDEN", 403);
  }

  const tempAccess = userPortalCategoryModules.find(
    (upcm) => upcm.permissionType === "TEMPORARY",
  );

  const permAccess = userPortalCategoryModules.find(
    (upcm) => upcm.permissionType === "PERMANENT",
  );

  const roleAccess = userPortalCategoryModules.find(
    (upcm) => upcm.permissionType === "ROLE",
  );

  let modulePermission: JsonValue = [];

  if (tempAccess && !tempAccess.manualRevocation) {
    if (!tempAccess.permissionStartDate || !tempAccess.permissionEndDate) {
      throw new AppError(
        "Either permission start date or end date is missing",
        "FORBIDDEN",
        403,
      );
    }

    const currentDate = new Date();
    const startDate = new Date(tempAccess.permissionStartDate);
    const endDate = new Date(tempAccess.permissionEndDate);

    if (currentDate < startDate || currentDate > endDate) {
      throw new AppError("Permission expired", "FORBIDDEN", 403);
    }

    modulePermission = tempAccess.modulePermission;
  } else if (permAccess) {
    modulePermission = permAccess.modulePermission;
  } else if (roleAccess) {
    modulePermission = roleAccess.modulePermission;
  }

  if (
    modulePermission &&
    Array.isArray(modulePermission) &&
    modulePermission.length > 0
  ) {
    if (!modulePermission.includes(permission)) {
      throw new AppError("User does not have permission", "FORBIDDEN", 403);
    }
  }

  // for (const userPortalCategoryModule of userPortalCategoryModules) {
  //   if (userPortalCategoryModule.permissionType === "TEMPORARY") {
  //     if (
  //       !userPortalCategoryModule.permissionStartDate ||
  //       !userPortalCategoryModule.permissionEndDate
  //     ) {
  //       throw new AppError("User not authorized", "UNAUTHORIZED", 401);
  //     }
  //
  //     const currentDate = new Date();
  //     const startDate = new Date(userPortalCategoryModule.permissionStartDate);
  //     const endDate = new Date(userPortalCategoryModule.permissionEndDate);
  //
  //     if (currentDate < startDate || currentDate > endDate) {
  //       throw new AppError("User not authorized", "UNAUTHORIZED", 401);
  //     }
  //   }
  //
  //   if (
  //     userPortalCategoryModule.modulePermission &&
  //     Array.isArray(userPortalCategoryModule.modulePermission) &&
  //     userPortalCategoryModule.modulePermission.length > 0
  //   ) {
  //     if (!userPortalCategoryModule.modulePermission.includes(permission)) {
  //       throw new AppError("User not authorized", "UNAUTHORIZED", 401);
  //     }
  //   }
  // }

  next();
};
