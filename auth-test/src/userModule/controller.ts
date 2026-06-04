import { Request, Response } from "express";
import { UserModuleService } from "./service";
import { PermissionType } from "@prisma/client";
import { stat } from "fs";
import prisma from "../prismaClient";
import AuthService from "../auth/service";
import { RequestWithUser } from "../types";
import { AppError } from "../utils/AppError";
import fs from "fs";
import { parse } from "fast-csv";
import UserAuthService from "../user/service";
import { Readable } from "stream";
import {
  CreateBulkUserSchema,
  registerSchema,
  UserPortalSchema,
} from "./schema";
import createAuditLog from "../auditlog";
import bcrypt from "bcryptjs";
import axios from "axios";
import { zodSafeParse } from "../utils/zodUtils";

const normalizeRoleName = (name: string): string => {
  return name.trim().toLowerCase().replace(/\s+/g, "-"); // Replace spaces with hyphen
};
function extractRoleData(roleData: any): RoleData {
  if (!roleData) return {};

  // If data is wrapped in 'set', use that
  if (roleData.set && typeof roleData.set === "object") {
    return roleData.set;
  }

  // Otherwise use the direct data
  return roleData;
}
interface RoleData {
  internalReference?: string;
  companyName?: string;
  aggrementExpiryDate?: string;
  potentialPayment?: string;
  commitionRate?: string;
  note?: string;
  endDate?: string;
  agentType?: string;
  startDate?: string;
  agreementStatus?: boolean;
  commissionTemplate?: string;
  reportingTo?: string;
  userStatus?: string;
  agreementTemplateId?: string; // Added this property
  commissionGroupId?: string; // Added this property
  set?: { [key: string]: any };
}
const userModuleService = new UserModuleService();
// enum PermissionType {
//   ROLE = "ROLE",
//   PERMANENT = "PERMANENT",
//   TEMPORARY = "TEMPORARY",
// }

const permissionPriority = {
  TEMPORARY: 1,
  PERMANENT: 2,
  ROLE: 3,
};
export class UserModuleController {
  // Create a new user module
  async createUserModules(req: RequestWithUser, res: Response) {
    const { userId, portalCategories } = zodSafeParse(
      req.body,
      UserPortalSchema,
    );

    // Validate required fields
    if (!userId || !portalCategories) {
      throw new AppError(
        "userId and portalCategories are required",
        "Bad Request",
        400,
      );
    }

    // Call the service method
    const userModules = await userModuleService.createUserModules({
      userId,
      portalCategories,
    });
    setImmediate(() => {
      userId.forEach((id: string) => {
        axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
          userId: id,
          type: "module",
        });
      });
    });
    if (req.user) {
      const targetUsers = await prisma.user.findMany({
        where: { id: { in: userId } },
        select: { id: true, username: true },
      });

      // Collect all module IDs
      const allModuleIds = portalCategories.flatMap(
        (cat: { modules: { moduleId: string }[] }) =>
          cat.modules.map((mod) => mod.moduleId),
      );
      const uniqueModuleIds = [...new Set(allModuleIds)];

      // Fetch module names
      const modules = await prisma.module.findMany({
        where: { id: { in: uniqueModuleIds as string[] } },
        select: { id: true, name: true },
      });
      const moduleMap = Object.fromEntries(modules.map((m) => [m.id, m.name]));

      // Map permissions to human-readable names
      const mapPermissions = (permissions: string[]): string[] => {
        const permissionMap: Record<string, string> = {
          GET: "Read",
          POST: "Write",
          DELETE: "Delete",
          PUT: "Update",
          PATCH: "Update",
        };
        return permissions
          .map((p) => permissionMap[p.toUpperCase()] || p)
          .filter(Boolean);
      };

      // Construct audit logs per user
      const auditLogs = targetUsers.flatMap((targetUser) => {
        const logsForUser: {
          action: string;
          userId: string;
          targetUserId: string;
          actionType: string;
        }[] = [];

        portalCategories.forEach(
          (category: {
            permissionType?: string;
            modules: { moduleId: string; modulePermission: string[] }[];
          }) => {
            const permissionType = category.permissionType || "PERMANENT";
            const moduleSummaries: string[] = [];

            category.modules.forEach((module) => {
              if (
                !module.modulePermission ||
                module.modulePermission.length === 0
              )
                return;

              const name = moduleMap[module.moduleId] || "Unknown Module";
              const permissions = mapPermissions(module.modulePermission);
              if (permissions.length > 0) {
                moduleSummaries.push(`${name}: ${permissions.join(", ")}`);
              }
            });

            if (moduleSummaries.length > 0) {
              logsForUser.push({
                action: `Assigned ${permissionType} modules to ${targetUser.username}: [${moduleSummaries.join(", ")}]`,
                userId: req.user!.userId,
                targetUserId: targetUser.id,
                actionType: "module_permission",
              });
            }
          },
        );

        return logsForUser;
      });

      if (auditLogs.length > 0) {
        await prisma.auditLog.createMany({
          data: auditLogs,
        });
      }
    }

    // Respond with success
    res.status(201).json({
      status: "success",
      message: "User modules processed successfully",
      data: { userModules },
    });
  }

  async getModules(req: Request, res: Response) {
    try {
      const { userportal } = req.query; // Extract userportal from query params

      const modules = await userModuleService.getModules(userportal as string);

      res.status(200).json({
        status: "success",
        message: "Modules retrieved successfully",
        portalCategory: userportal || "All",
        modules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getAllModules(req: Request, res: Response) {
    try {
      const modules = await userModuleService.getAllModules();

      res.status(200).json({
        status: "success",
        message: "All modules retrieved successfully",
        count: modules.length,
        modules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
  async createModule(req: RequestWithUser, res: Response) {
    try {
      // Destructure the request body
      const { moduleName, groupName, modulePermission, roleName } = req.body;

      // Validate required fields
      if (!moduleName) {
        return res.status(400).json({
          status: "error",
          message: "Module name is required",
        });
      }

      // Call the service method to create the user module
      const module = await userModuleService.createModule({
        moduleName,
        groupName,
        modulePermission,
        roleName,
      });
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            action: `Created module: ${moduleName} with groupName: ${groupName || "N/A"}`,
            userId: req.user?.userId,
            targetUserId: req.user?.userId,
            actionType: "module_creation",
          },
        });
      }
      // Respond with the created user module
      res.status(201).json({
        status: "success",
        message: "Module created successfully",
        module,
      });
    } catch (error) {
      // Handle any errors that occur
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  }

  async createModulesBulk(req: RequestWithUser, res: Response) {
    try {
      // Destructure the request body
      const { modules } = req.body;

      // Validate required fields
      if (!modules || !Array.isArray(modules)) {
        return res.status(400).json({
          status: "error",
          message: "Modules array is required",
        });
      }

      // Validate each module has moduleName
      const invalidModules = modules.filter((m: any) => !m || !m.moduleName);
      if (invalidModules.length > 0) {
        return res.status(400).json({
          status: "error",
          message: "All modules must have a 'moduleName' property",
        });
      }

      // Call the service method to create modules in bulk
      const result = await userModuleService.createModulesBulk(modules);

      if (req.user && result.created.length > 0) {
        const auditLogs = result.created.map((module: any) => ({
          action: `Created module: ${module.name} with groupName: ${module.groupName || "N/A"}`,
          userId: req.user!.userId,
          targetUserId: req.user!.userId,
          actionType: "module_creation",
        }));

        await prisma.auditLog.createMany({
          data: auditLogs,
        });
      }

      // Respond with the created modules
      res.status(201).json({
        status: "success",
        message: `${result.created.length} module(s) created successfully`,
        created: result.created,
        errors: result.errors,
      });
    } catch (error) {
      // Handle any errors that occur
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: (error as Error).message });
      }
    }
  }

  async getModulesNotAssignedToPortal(req: Request, res: Response) {
    try {
      const modules = await userModuleService.getModulesNotAssignedToPortal();

      res.status(200).json({
        status: "success",
        message: "Unassigned modules retrieved successfully",
        count: modules.length,
        modules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getModulesGroupedByPortal(req: Request, res: Response) {
    try {
      const groupedModules =
        await userModuleService.getModulesGroupedByPortal();

      res.status(200).json({
        status: "success",
        message: "Modules grouped by portal retrieved successfully",
        totalPortals: groupedModules.length,
        totalModules: groupedModules.reduce((sum, p) => sum + p.moduleCount, 0),
        portals: groupedModules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  async getUserModulesByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params; // Extract userId from request params
      const { userportal } = req.query; // Extract userportal from query params

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }
      const portalCategory = await prisma.portalCategory.findFirst({
        where: {
          name: userportal as string, // Ensure type consistency
        },
      });

      // Extract portalCategory ID
      const portalCategoryId = portalCategory?.id;
      console.log(portalCategoryId);
      // Pass userportal as a string (or undefined if not provided)
      const userModules = await userModuleService.getUserModulesByUserId(
        userId,
        userportal as string | undefined,
      );

      res.status(200).json({
        status: "success",
        message: "User modules retrieved successfully",
        portalCategoryId, // Include portal category ID in response

        userModules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  // async getUserModulesByUserWise(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;

  //     if (!userId) {
  //       return res.status(400).json({
  //         status: "error",
  //         message: "User ID is required",
  //       });
  //     }

  //     const today = new Date();

  //     // Fetch user details
  //     const user = await prisma.user.findUnique({
  //       where: { id: userId },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         mobile: true,
  //         username: true,
  //         userStatus: true,
  //         userRoles: {
  //           take: 1,
  //           select: {
  //             role: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 portalCategoryId: true,
  //               },
  //             },
  //           },
  //         },
  //         userPortalCategories: {
  //           select: {
  //             userPortalCategoryRoles: {
  //               select: {
  //                 roleData: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });
  //     const firstRoleData = user?.userPortalCategories?.[0]
  //       ?.userPortalCategoryRoles?.[0]?.roleData as any;

  //     const agentStatus =
  //       firstRoleData?.set?.userStatus ?? firstRoleData?.userStatus;

  //     if (!user) {
  //       return res.status(404).json({
  //         status: "error",
  //         message: "User not found",
  //       });
  //     }

  //     // Fetch user portal categories
  //     const userPortalCategories = await prisma.userPortalCategory.findMany({
  //       where: {
  //         userId,
  //         status: "ACTIVE",
  //       },
  //       select: {
  //         portalCategoryId: true,
  //         portalCategory: {
  //           select: { id: true, name: true },
  //         },
  //         userPortalCategoryRoles: {
  //           take: 1,
  //           select: {
  //             role: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     const portalCategoryIds = userPortalCategories.map(
  //       (cat) => cat.portalCategoryId
  //     );

  //     // Fetch role modules
  //     const roleModules = await prisma.roleModule.findMany({
  //       where: {
  //         roleId: {
  //           in: userPortalCategories.flatMap((category) =>
  //             category.userPortalCategoryRoles.map((role) => role.role.id)
  //           ),
  //         },
  //       },
  //       select: {
  //         role: {
  //           select: {
  //             portalCategory: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //         module: {
  //           select: { id: true, name: true },
  //         },
  //         modulePermission: true,
  //         createdAt: true,
  //       },
  //     });

  //     // Fetch user-specific modules (both permanent and temporary)
  //     const userModules = await prisma.userPortalCategoryModule.findMany({
  //       where: {
  //         userId,
  //         portalCategoryId: { in: portalCategoryIds },
  //         OR: [
  //           { permissionType: "PERMANENT" },
  //           {
  //             permissionType: "TEMPORARY",
  //             permissionStartDate: { lte: today },
  //             permissionEndDate: { gte: today },
  //           },
  //         ],
  //       },
  //       select: {
  //         portalCategory: {
  //           select: { id: true, name: true },
  //         },
  //         module: {
  //           select: { id: true, name: true },
  //         },
  //         modulePermission: true,
  //         permissionType: true,
  //         permissionStartDate: true,
  //         permissionEndDate: true,
  //         manualRevocation: true,
  //       },
  //     });

  //     // Priority function
  //     const getPriority = (type: PermissionType): number => {
  //       switch (type) {
  //         case PermissionType.TEMPORARY:
  //           return 3;
  //         case PermissionType.PERMANENT:
  //           return 2;
  //         case PermissionType.ROLE:
  //           return 1;
  //         default:
  //           return 0;
  //       }
  //     };

  //     // Process all modules with proper priority
  //     const portalWiseModules: Record<
  //       string,
  //       {
  //         portalCategoryId: string;
  //         roleId: string | null;
  //         roleName: string | null;
  //         modules: any[];
  //       }
  //     > = {};

  //     // Initialize portal structure
  //     userPortalCategories.forEach((category) => {
  //       const portalName = category.portalCategory.name;
  //       const role = category.userPortalCategoryRoles[0]?.role;

  //       portalWiseModules[portalName] = {
  //         portalCategoryId: category.portalCategory.id,
  //         roleId: role?.id || null,
  //         roleName: role?.name || null,
  //         modules: [],
  //       };
  //     });

  //     // Process role modules (lowest priority)
  //     roleModules.forEach((rm) => {
  //       const portalName = rm.role.portalCategory.name;
  //       const moduleId = rm.module.id;

  //       if (portalWiseModules[portalName]) {
  //         const existing = portalWiseModules[portalName].modules.find(
  //           (m) => m.moduleId === moduleId
  //         );
  //         if (!existing) {
  //           portalWiseModules[portalName].modules.push({
  //             moduleId,
  //             moduleName: rm.module.name,
  //             modulePermission: rm.modulePermission,
  //             permissionType: PermissionType.ROLE,
  //             permissionStartDate: rm.createdAt,
  //             permissionEndDate: null,
  //             manualRevocation: false,
  //           });
  //         }
  //       }
  //     });

  //     // Process user modules (higher priority)
  //     userModules.forEach((um) => {
  //       const portalName = um.portalCategory.name;
  //       const moduleId = um.module.id;

  //       if (portalWiseModules[portalName]) {
  //         const existingIndex = portalWiseModules[portalName].modules.findIndex(
  //           (m) => m.moduleId === moduleId
  //         );

  //         if (existingIndex === -1) {
  //           // Add new module
  //           portalWiseModules[portalName].modules.push({
  //             moduleId,
  //             moduleName: um.module.name,
  //             modulePermission: um.modulePermission,
  //             permissionType: um.permissionType,
  //             permissionStartDate: um.permissionStartDate,
  //             permissionEndDate: um.permissionEndDate,
  //             manualRevocation: um.manualRevocation,
  //           });
  //         } else {
  //           // Check priority
  //           const current =
  //             portalWiseModules[portalName].modules[existingIndex];
  //           if (
  //             getPriority(um.permissionType) >
  //             getPriority(current.permissionType)
  //           ) {
  //             // Replace with higher priority
  //             portalWiseModules[portalName].modules[existingIndex] = {
  //               moduleId,
  //               moduleName: um.module.name,
  //               modulePermission: um.modulePermission,
  //               permissionType: um.permissionType,
  //               permissionStartDate: um.permissionStartDate,
  //               permissionEndDate: um.permissionEndDate,
  //               manualRevocation: um.manualRevocation,
  //             };
  //           }
  //         }
  //       }
  //     });

  //     // Filter out modules with empty permissions and format response
  //     const responseData = Object.entries(portalWiseModules).map(
  //       ([portalName, details]) => ({
  //         portalName,
  //         portalCategoryId: details.portalCategoryId,
  //         roleId: details.roleId,
  //         roleName: details.roleName,
  //         modules: details.modules
  //           .filter(
  //             (module) =>
  //               module.modulePermission && module.modulePermission.length > 0
  //           )
  //           .map((module) => ({
  //             moduleId: module.moduleId,
  //             moduleName: module.moduleName,
  //             modulePermission: module.modulePermission,
  //             permissionType: module.permissionType,
  //             permissionStartDate: module.permissionStartDate,
  //             permissionEndDate: module.permissionEndDate,
  //             manualRevocation: module.manualRevocation,
  //           })),
  //       })
  //     );

  //     // Get user's primary role
  //     const userPrimaryRole = user.userRoles[0]?.role;
  //     const applicationCreateStatus = await prisma.variable.findUnique({
  //       where: { name: "newapplication" },
  //       select: { value: true },
  //     });

  //     res.status(200).json({
  //       status: "success",
  //       message: "User portal category modules retrieved successfully",
  //       user: {
  //         id: user.id,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         email: user.email,
  //         mobile: user.mobile,
  //         username: user.username,
  //         userStatus: user.userStatus,
  //         activityStatus: agentStatus || null,
  //         roleId: userPrimaryRole?.id || null,
  //         roleName: userPrimaryRole?.name.toLocaleLowerCase() || null,
  //         portalCategoryId: userPrimaryRole?.portalCategoryId || null,
  //         applicationCreateStatus: applicationCreateStatus?.value || null,
  //       },
  //       data: responseData,
  //     });
  //   } catch (error) {
  //     res.status(500).json({
  //       status: "error",
  //       message: (error as Error).message,
  //     });
  //   }
  // }

  // #date:1 july

  // async getUserModulesByUserWise(req: Request, res: Response) {
  //   try {
  //     const { userId } = req.params;

  //     if (!userId) {
  //       return res.status(400).json({
  //         status: "error",
  //         message: "User ID is required",
  //       });
  //     }

  //     // Get today's date for permission validation
  //     const today = new Date();

  //     // Fetch user details with roles
  //     const user = await prisma.user.findUnique({
  //       where: { id: userId },
  //       select: {
  //         id: true,
  //         firstName: true,
  //         lastName: true,
  //         email: true,
  //         mobile: true,
  //         username: true,
  //         userStatus: true,
  //         userRoles: {
  //           take: 1, // Only take the first role
  //           select: {
  //             role: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //                 portalCategoryId: true,
  //               },
  //             },
  //           },
  //         },
  //         userPortalCategories: {
  //           select: {
  //             userPortalCategoryRoles: {
  //               take: 1,
  //               select: {
  //                 roleData: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!user) {
  //       return res.status(404).json({
  //         status: "error",
  //         message: "User not found",
  //       });
  //     }

  //     // Step 1: Fetch UserPortalCategory for the given userId
  //     const userPortalCategories = await prisma.userPortalCategory.findMany({
  //       where: {
  //         userId,
  //         status: "ACTIVE",
  //       },
  //       select: {
  //         portalCategoryId: true,
  //         portalCategory: {
  //           select: { id: true, name: true },
  //         },
  //         userPortalCategoryRoles: {
  //           take: 1, // Only take the first role
  //           select: {
  //             role: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //           },
  //         },
  //       },
  //     });

  //     // Step 2: Fetch UserPortalCategoryModules for the UserPortalCategory
  //     const userPortalCategoryModules =
  //       await prisma.userPortalCategoryModule.findMany({
  //         where: {
  //           userId,
  //           portalCategoryId: {
  //             in: userPortalCategories.map(
  //               (category) => category.portalCategoryId
  //             ),
  //           },
  //         },
  //         select: {
  //           portalCategory: {
  //             select: { id: true, name: true },
  //           },
  //           module: {
  //             select: { id: true, name: true, groupName: true }, // Include groupName
  //           },
  //           modulePermission: true,
  //           permissionType: true,
  //           permissionStartDate: true,
  //           permissionEndDate: true,
  //           manualRevocation: true,
  //         },
  //       });

  //     // Step 3: Filter modules where permissions are expired or empty
  //     const filteredUserModules = userPortalCategoryModules.filter((entry) => {
  //       if (
  //         Array.isArray(entry.modulePermission) &&
  //         entry.modulePermission.length === 0
  //       ) {
  //         return false;
  //       }

  //       if (entry.manualRevocation) {
  //         return true;
  //       }

  //       if (
  //         entry.permissionType === PermissionType.TEMPORARY &&
  //         entry.permissionEndDate
  //       ) {
  //         if (new Date(entry.permissionEndDate) <= today) {
  //           return false;
  //         }
  //       }

  //       return true;
  //     });

  //     // Step 4: Prioritize modules based on permissionType
  //     const prioritizedModules = filteredUserModules.reduce(
  //       (acc, entry) => {
  //         const { portalCategory, module } = entry;
  //         const moduleKey = `${portalCategory.id}-${module.id}`;

  //         if (!acc[moduleKey]) {
  //           acc[moduleKey] = entry;
  //         } else {
  //           const existingPriority =
  //             permissionPriority[acc[moduleKey].permissionType];
  //           const newPriority = permissionPriority[entry.permissionType];

  //           if (newPriority < existingPriority) {
  //             acc[moduleKey] = entry;
  //           }
  //         }

  //         return acc;
  //       },
  //       {} as Record<string, (typeof filteredUserModules)[number]>
  //     );

  //     // Convert the prioritized modules back to an array
  //     const finalModules = Object.values(prioritizedModules);

  //     // Step 5: Initialize all assigned portal categories with role info
  //     const portalWiseModules = userPortalCategories.reduce(
  //       (acc, category) => {
  //         const role = category.userPortalCategoryRoles[0]?.role;

  //         acc[category.portalCategory.name] = {
  //           portalCategoryId: category.portalCategoryId,
  //           roleId: role?.id || null,
  //           roleName: role?.name || null,
  //           modules: [],
  //         };
  //         return acc;
  //       },
  //       {} as Record<
  //         string,
  //         {
  //           portalCategoryId: string;
  //           roleId: string | null;
  //           roleName: string | null;
  //           modules: any[];
  //         }
  //       >
  //     );

  //     // Populate modules where applicable
  //     finalModules.forEach((entry) => {
  //       const { portalCategory, module, ...permissions } = entry;

  //       if (!portalWiseModules[portalCategory.name]) {
  //         portalWiseModules[portalCategory.name] = {
  //           portalCategoryId: portalCategory.id,
  //           roleId: null,
  //           roleName: null,
  //           modules: [],
  //         };
  //       }

  //       portalWiseModules[portalCategory.name].modules.push({
  //         moduleId: module.id,
  //         moduleName: module.name,
  //         moduleGroup: module.groupName, // Assuming moduleGroup is the same as moduleName
  //         ...permissions,
  //       });
  //     });

  //     // Get user's primary role (first role)
  //     const userPrimaryRole = user.userRoles[0]?.role;
  //     const applicationCreateStatus = await prisma.variable.findUnique({
  //       where: { name: "newapplication" },
  //       select: { value: true },
  //     });
  //     const rawRoleData =
  //       user.userPortalCategories[0]?.userPortalCategoryRoles[0]?.roleData;
  //     const roleData = extractRoleData(rawRoleData);
  //     console.log(roleData);
  //     // Step 6: Return the response with flattened role structure
  //     res.status(200).json({
  //       status: "success",
  //       message: "User portal category modules retrieved successfully",
  //       user: {
  //         id: user.id,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         email: user.email,
  //         mobile: user.mobile,
  //         username: user.username,
  //         userStatus: user.userStatus,
  //         roleId: userPrimaryRole?.id || null,
  //         roleName: userPrimaryRole?.name || null,
  //         portalCategoryId: userPrimaryRole?.portalCategoryId || null,
  //         applicationCreateStatus: applicationCreateStatus?.value || null,
  //         activityStatus: roleData.userStatus || null,
  //       },
  //       data: Object.entries(portalWiseModules).map(
  //         ([portalName, details]) => ({
  //           portalName,
  //           portalCategoryId: details.portalCategoryId,
  //           roleId: details.roleId,
  //           roleName: details.roleName,
  //           modules: details.modules,
  //         })
  //       ),
  //     });
  //   } catch (error) {
  //     res.status(500).json({ message: (error as Error).message });
  //   }
  // }

  // july 9

  async getUserModulesByUserWise(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }

      const today = new Date();

      // Fetch user details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          mobile: true,
          username: true,
          userStatus: true,
          userRoles: {
            take: 1,
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                  portalCategoryId: true,
                },
              },
            },
          },
          userPortalCategories: {
            select: {
              userPortalCategoryRoles: {
                select: {
                  roleData: true,
                },
              },
            },
          },
        },
      });
      const firstRoleData = user?.userPortalCategories?.[0]
        ?.userPortalCategoryRoles?.[0]?.roleData as any;

      const agentStatus =
        firstRoleData?.set?.userStatus ?? firstRoleData?.userStatus;
      const coursePermissions =
        firstRoleData?.set?.coursePermissions ??
        firstRoleData?.coursePermissions;
      const courseModule =
        firstRoleData?.set?.courseModule ?? firstRoleData?.courseModule;
      const assessmentPermissions =
        firstRoleData?.set?.assessmentPermissions ??
        firstRoleData?.assessmentPermissions;
      const studentMessagingAccess =
        firstRoleData?.set?.studentMessagingAccess ??
        firstRoleData?.studentMessagingAccess;

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "User not found",
        });
      }

      // Fetch user portal categories
      const userPortalCategories = await prisma.userPortalCategory.findMany({
        where: {
          userId,
          status: "ACTIVE",
        },
        select: {
          portalCategoryId: true,
          portalCategory: {
            select: { id: true, name: true },
          },
          userPortalCategoryRoles: {
            take: 1,
            select: {
              role: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      const portalCategoryIds = userPortalCategories.map(
        (cat) => cat.portalCategoryId,
      );

      // Fetch role modules
      const roleModules = await prisma.roleModule.findMany({
        where: {
          roleId: {
            in: userPortalCategories.flatMap((category) =>
              category.userPortalCategoryRoles.map((role) => role.role.id),
            ),
          },
        },
        select: {
          role: {
            select: {
              portalCategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          module: {
            select: { id: true, name: true, groupName: true },
          },
          modulePermission: true,
          createdAt: true,
        },
      });

      // Fetch user-specific modules (both permanent and temporary)
      // const userModules = await prisma.userPortalCategoryModule.findMany({
      //   where: {
      //     userId,
      //     portalCategoryId: { in: portalCategoryIds },
      //     OR: [
      //       { permissionType: "PERMANENT" },
      //       {
      //         permissionType: "TEMPORARY",
      //         permissionStartDate: { lte: today },
      //         permissionEndDate: { gte: today },
      //       },
      //     ],
      //   },
      //   select: {
      //     portalCategory: {
      //       select: { id: true, name: true },
      //     },
      //     module: {
      //       select: { id: true, name: true },
      //     },
      //     modulePermission: true,
      //     permissionType: true,
      //     permissionStartDate: true,
      //     permissionEndDate: true,
      //     manualRevocation: true,
      //   },
      // });
      const userModules = await prisma.userPortalCategoryModule.findMany({
        where: {
          userId,
          portalCategoryId: { in: portalCategoryIds },
          OR: [
            { permissionType: "PERMANENT" },
            {
              permissionType: "TEMPORARY",
              OR: [
                // Either has valid date range
                {
                  permissionStartDate: { lte: today },
                  permissionEndDate: { gte: today },
                },
                // OR has no dates specified (manualRevocation case)
                {
                  permissionStartDate: null,
                  permissionEndDate: null,
                },
              ],
            },
          ],
        },
        select: {
          portalCategory: {
            select: { id: true, name: true },
          },
          module: {
            select: { id: true, name: true, groupName: true },
          },
          modulePermission: true,
          permissionType: true,
          permissionStartDate: true,
          permissionEndDate: true,
          manualRevocation: true,
        },
      });

      const getPriority = (module: any): number => {
        if (
          module.permissionType === PermissionType.TEMPORARY &&
          module.manualRevocation
        ) {
          return 4; // Highest priority
        }
        if (
          module.permissionType === PermissionType.TEMPORARY &&
          !module.manualRevocation
        ) {
          return 3;
        }
        if (module.permissionType === PermissionType.PERMANENT) {
          return 2;
        }
        if (module.permissionType === PermissionType.ROLE) {
          return 1;
        }
        return 0;
      };
      // Process all modules with proper priority
      const portalWiseModules: Record<
        string,
        {
          portalCategoryId: string;
          roleId: string | null;
          roleName: string | null;
          modules: any[];
        }
      > = {};

      // Initialize portal structure
      userPortalCategories.forEach((category) => {
        const portalName = category.portalCategory.name;
        const role = category.userPortalCategoryRoles[0]?.role;

        portalWiseModules[portalName] = {
          portalCategoryId: category.portalCategory.id,
          roleId: role?.id || null,
          roleName: role?.name || null,
          modules: [],
        };
      });

      // Process role modules (lowest priority)
      roleModules.forEach((rm) => {
        const portalName = rm.role.portalCategory.name;
        const moduleId = rm.module.id;

        if (portalWiseModules[portalName]) {
          const existing = portalWiseModules[portalName].modules.find(
            (m) => m.moduleId === moduleId,
          );
          if (!existing) {
            portalWiseModules[portalName].modules.push({
              moduleId,
              moduleName: rm.module.name,
              moduleGroup: rm.module.groupName,
              modulePermission: rm.modulePermission,
              permissionType: PermissionType.ROLE,
              permissionStartDate: rm.createdAt,
              permissionEndDate: null,
              manualRevocation: false,
            });
          }
        }
      });

      userModules.forEach((um) => {
        const portalName = um.portalCategory.name;
        const moduleId = um.module.id;

        if (portalWiseModules[portalName]) {
          const existingIndex = portalWiseModules[portalName].modules.findIndex(
            (m) => m.moduleId === moduleId,
          );

          if (existingIndex === -1) {
            // Add new module
            portalWiseModules[portalName].modules.push({
              moduleId,
              moduleName: um.module.name,
              moduleGroup: um.module.groupName,
              modulePermission: um.modulePermission,
              permissionType: um.permissionType,
              permissionStartDate: um.permissionStartDate,
              permissionEndDate: um.permissionEndDate,
              manualRevocation: um.manualRevocation,
            });
          } else {
            // Check priority using the new comparison logic
            const current =
              portalWiseModules[portalName].modules[existingIndex];
            if (getPriority(um) > getPriority(current)) {
              // Replace with higher priority
              portalWiseModules[portalName].modules[existingIndex] = {
                moduleId,
                moduleName: um.module.name,
                moduleGroup: um.module.groupName,
                modulePermission: um.modulePermission,
                permissionType: um.permissionType,
                permissionStartDate: um.permissionStartDate,
                permissionEndDate: um.permissionEndDate,
                manualRevocation: um.manualRevocation,
              };
            }
          }
        }
      });
      // Filter out modules with empty permissions and format response
      const responseData = Object.entries(portalWiseModules).map(
        ([portalName, details]) => ({
          portalName,
          portalCategoryId: details.portalCategoryId,
          roleId: details.roleId,
          roleName: details.roleName,
          modules: details.modules
            .filter(
              (module) =>
                module.modulePermission && module.modulePermission.length > 0,
            )
            .map((module) => ({
              moduleId: module.moduleId,
              moduleName: module.moduleName,
              moduleGroup: module.moduleGroup,
              modulePermission: module.modulePermission,
              permissionType: module.permissionType,
              permissionStartDate: module.permissionStartDate,
              permissionEndDate: module.permissionEndDate,
              manualRevocation: module.manualRevocation,
            })),
        }),
      );

      // Get user's primary role
      const userPrimaryRole = user.userRoles[0]?.role;
      const applicationCreateStatus = await prisma.variable.findUnique({
        where: { name: "newapplication" },
        select: { value: true },
      });

      res.status(200).json({
        status: "success",
        message: "User portal category modules retrieved successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          username: user.username,
          userStatus: user.userStatus,
          activityStatus: agentStatus || null,
          roleId: userPrimaryRole?.id || null,
          roleName: userPrimaryRole?.name.toLocaleLowerCase() || null,
          portalCategoryId: userPrimaryRole?.portalCategoryId || null,
          applicationCreateStatus: applicationCreateStatus?.value || null,
          coursePermissions: coursePermissions || false,
          courseModule: courseModule ?? null,
          assessmentPermissions: assessmentPermissions ?? false,
          studentMessagingAccess: studentMessagingAccess ?? false,
        },
        data: responseData,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: (error as Error).message,
      });
    }
  }
  async getModulePortalCategory(req: Request, res: Response) {
    const { portalCategoryId } = req.params;

    if (!portalCategoryId) {
      return res.status(400).json({ error: "portalCategoryId is required" });
    }

    try {
      const modules =
        await userModuleService.getModulesByPortalCategoryId(portalCategoryId);
      return res.status(200).json({ success: true, data: modules });
    } catch (error) {
      // Ensure error is properly typed
      if (error instanceof Error) {
        return res.status(500).json({ error: error.message });
      }
      return res.status(500).json({ error: "An unexpected error occurred" });
    }
  }

  async getUserModulesDataByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params; // Extract userId from request params
      const { portalCategory } = req.query; // Extract portalCategory from query params
      let usermodules;

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }

      // Call the service method to get user-wise modules
      if (portalCategory == "undefined") {
        usermodules =
          await userModuleService.getUserModulesDataByUserId(userId);
      } else if (portalCategory) {
        usermodules =
          await userModuleService.getUserModulesDataByPortalCategory(
            portalCategory as string,
          );
      } else {
        usermodules =
          await userModuleService.getUserModulesDataByUserId(userId);
      }

      res.status(200).json({
        status: "success",
        message: "User modules retrieved successfully",
        userModules: usermodules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
  async getUserModulesTemporaryDataByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params; // Extract userId from request params

      if (!userId) {
        return res.status(400).json({
          status: "error",
          message: "User ID is required",
        });
      }

      // Call the service method to get user-wise modules
      const userModules =
        await userModuleService.getUserModulesTemporaryDataByUserId(userId);

      res.status(200).json({
        status: "success",
        message: "User modules retrieved successfully",
        userModules,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static async deleteUserPortalCategoryModule(req: Request, res: Response) {
    try {
      const userPortalCategoryModuleId = req.params.userPortalCategoryModuleId;
      await prisma.userPortalCategoryModule.delete({
        where: {
          id: userPortalCategoryModuleId,
        },
      });
      res.json({ message: "User portal category module deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete user portal category module" });
    }
  }

  async deleteUserPortalCategoryModuleById(req: Request, res: Response) {
    try {
      const { userPortalCategoryModuleId } = req.params;

      if (!userPortalCategoryModuleId) {
        throw new AppError(
          "userPortalCategoryModuleId is required",
          "Bad Request",
          400,
        );
      }

      // Call the service method to delete the record
      await userModuleService.deleteUserPortalCategoryModuleById(
        userPortalCategoryModuleId,
      );

      res.status(200).json({
        status: "success",
        message: "User portal category module deleted successfully",
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  async getUserDetailsWithModules(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const data = await userModuleService.getUserDetailsWithModules(userId);

      if (data.error) {
        return res.status(404).json({ error: data.error });
      }

      res.json({
        status: "success",
        message: "User details retrieved successfully",
        data,
      });
    } catch (error) {
      console.error("Error in getUserWithModules:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  // async validateUserRecord(user: any, index: number) {
  //   const errors: string[] = [];

  //   if (!user.email) {
  //     errors.push("Email is required");
  //   } else {
  //     const existing = await prisma.user.findUnique({
  //       where: { email: user.email },
  //     });
  //     if (existing) errors.push("Email already exists");
  //   }
  //   if (!user.username) {
  //     errors.push("Username is required");
  //   } else {
  //     const existing = await prisma.user.findUnique({
  //       where: { username: user.username },
  //     });
  //     if (existing) errors.push("Username already exists");
  //   }
  //   if (user.mobile) {
  //     const existing = await prisma.user.findUnique({
  //       where: { mobile: user.mobile },
  //     });
  //     if (existing) errors.push("Mobile already exists");
  //   }

  //   if (user.username) {
  //     const existing = await prisma.user.findUnique({
  //       where: { username: user.username },
  //     });
  //     if (existing) errors.push("Username already exists");
  //   }

  //   if (user.roleName) {
  //     const portalCategory = await prisma.portalCategory.findFirst({
  //       where: { name: "admin" },
  //     });

  //     if (!portalCategory) {
  //       errors.push("Portal category 'admin' not found");
  //     } else {
  //       const exists = await prisma.role.findUnique({
  //         where: {
  //           name_portalCategoryId: {
  //             // name: user.roleName,
  //             name: user.roleName.toLowerCase(),
  //             portalCategoryId: portalCategory.id,
  //           },
  //         },
  //       });

  //       if (!exists) {
  //         errors.push(
  //           `Role '${user.roleName}' does not exist in 'admin' portal`
  //         );
  //       }
  //     }
  //   }

  //   return { index, errors };
  // }

  // async validateAndInsertCSVUsers(file: Express.Multer.File, user: any) {
  //   const users: any[] = [];
  //   const stream = Readable.from(file.buffer.toString());

  //   await new Promise<void>((resolve, reject) => {
  //     stream
  //       .pipe(parse({ headers: true }))
  //       .on("data", (row) => users.push(row))
  //       .on("end", resolve)
  //       .on("error", reject);
  //   });

  //   const validationResults = await Promise.all(
  //     users.map((user, idx) => this.validateUserRecord(user, idx))
  //   );

  //   const hasErrors = validationResults.some((res) => res.errors.length > 0);
  //   createAuditLog({
  //     action: ` try to insert ${users.length} users but failed `,
  //     userId: user.userId,
  //     actionType: "user_creation",
  //   });

  //   if (hasErrors) {
  //     return {
  //       success: false,
  //       message: "Validation failed",
  //       errors: validationResults.filter((r) => r.errors.length > 0),
  //     };
  //   }

  //   const insertedUsers = [];

  //   for (const user of users) {
  //     const parsed = registerSchema.safeParse(user);
  //     if (!parsed.success) {
  //       return {
  //         success: false,
  //         message: "Validation failed",
  //         errors: [
  //           {
  //             index: users.indexOf(user),
  //             errors: parsed.error.flatten().fieldErrors,
  //           },
  //         ],
  //       };
  //     }

  //     const created = await this.createBulkUsers(parsed.data);
  //     insertedUsers.push(created.user.email);
  //   }
  //   createAuditLog({
  //     action: ` inserted  ${insertedUsers.length} users successfully`,
  //     userId: user.userId,
  //     actionType: "user_creation",
  //   });
  //   return {
  //     success: true,
  //     message: "All users inserted successfully.",
  //     count: insertedUsers.length,
  //     users: insertedUsers,
  //   };
  // }

  // async createBulkUsers(user: CreateBulkUserSchema) {
  //   const createdUser = await prisma.user.create({
  //     data: {
  //       email: user.email,
  //       password: await bcrypt.hash(user.password, 10),
  //       firstName: user.firstName,
  //       lastName: user.lastName,
  //       username: user.username || null,
  //       mobile: user.mobile || null,
  //     },
  //   });

  //   const portalCategory = await prisma.portalCategory.findFirst({
  //     where: { name: "admin" }, // Or dynamic if needed
  //   });

  //   if (!portalCategory) {
  //     throw new Error("Portal category 'admin' not found");
  //   }

  //   // Link user to portal
  //   const userPortal = await prisma.userPortalCategory.create({
  //     data: {
  //       userId: createdUser.id,
  //       portalCategoryId: portalCategory.id,
  //     },
  //   });

  //   // Assign role if provided
  //   if (user.roleName) {
  //     // const role = await prisma.role.findFirst({
  //     //   where: {
  //     //     name: user.roleName.toLowerCase(),
  //     //     portalCategoryId: portalCategory.id,
  //     //   },
  //     // });
  //     const role = await prisma.role.findFirst({
  //       where: {
  //         name: normalizeRoleName(user.roleName),
  //         portalCategoryId: portalCategory.id,
  //       },
  //     });

  //     if (role) {
  //       await prisma.userPortalCategoryRole.create({
  //         data: {
  //           userPortalCategoryId: userPortal.id,
  //           roleId: role.id,
  //         },
  //       });
  //     } else {
  //       throw new Error(
  //         `Role '${user.roleName}' not found in portal '${portalCategory.name}'`
  //       );
  //     }
  //   }

  //   return { user: createdUser };
  // }

  async validateUserRecord(user: any, index: number) {
    const errors: string[] = [];

    if (!user.email) {
      errors.push("Email is required");
    } else {
      const existing = await prisma.user.findUnique({
        where: { email: user.email },
      });
      if (existing) errors.push("Email already exists");
    }

    if (!user.username) {
      errors.push("Username is required");
    } else {
      const existing = await prisma.user.findUnique({
        where: { username: user.username },
      });
      if (existing) errors.push("Username already exists");
    }

    // if (user.mobile) {
    //   const existing = await prisma.user.findUnique({
    //     where: { mobile: user.mobile },
    //   });
    //   if (existing) errors.push("Mobile already exists");
    // }

    if (user.roleName) {
      const portalCategory = await prisma.portalCategory.findFirst({
        where: { name: "admin" },
      });

      if (!portalCategory) {
        errors.push("Portal category 'admin' not found");
      } else {
        const exists = await prisma.role.findUnique({
          where: {
            name_portalCategoryId: {
              name: user.roleName.toLowerCase(),
              portalCategoryId: portalCategory.id,
            },
          },
        });

        if (!exists) {
          errors.push(
            `Role '${user.roleName}' does not exist in 'admin' portal`,
          );
        }
      }
    }

    return { index, errors };
  }
  async validateAndInsertCSVUsers(file: Express.Multer.File, user: any) {
    const users: any[] = [];
    const stream = Readable.from(file.buffer.toString());

    await new Promise<void>((resolve, reject) => {
      stream
        .pipe(parse({ headers: true }))
        .on("data", (row) => users.push(row))
        .on("end", resolve)
        .on("error", reject);
    });

    const parsedUsers: any[] = [];
    const allErrors: any[] = [];

    const seenEmails = new Set();
    const seenMobiles = new Set();
    const seenUsernames = new Set();

    for (let i = 0; i < users.length; i++) {
      const record = users[i];
      const validation = await this.validateUserRecord(record, i);

      // Check in-memory duplicates
      if (record.email && seenEmails.has(record.email)) {
        validation.errors.push("Duplicate email in CSV");
      } else {
        seenEmails.add(record.email);
      }

      if (record.mobile && seenMobiles.has(record.mobile)) {
        validation.errors.push("Duplicate mobile in CSV");
      } else if (record.mobile) {
        seenMobiles.add(record.mobile);
      }

      if (record.username && seenUsernames.has(record.username)) {
        validation.errors.push("Duplicate username in CSV");
      } else {
        seenUsernames.add(record.username);
      }

      // Continue with DB + Zod validation
      if (validation.errors.length > 0) {
        allErrors.push(validation);
        continue;
      }

      const parsed = registerSchema.safeParse(record);
      if (!parsed.success) {
        allErrors.push({
          index: i,
          errors: parsed.error.flatten().fieldErrors,
        });
        continue;
      }

      parsedUsers.push(parsed.data);
    }

    if (allErrors.length > 0) {
      await createAuditLog({
        action: `Try to insert ${users.length} users but failed`,
        userId: user.userId,
        actionType: "user_creation",
      });
      return {
        success: false,
        message: "Validation failed",
        errors: allErrors,
      };
    }

    const insertedUsers = [];

    for (const parsed of parsedUsers) {
      const created = await this.createBulkUsers(parsed);
      insertedUsers.push(created.user.email);
    }

    await createAuditLog({
      action: `Inserted ${insertedUsers.length} users successfully`,
      userId: user.userId,
      actionType: "user_creation",
    });

    return {
      success: true,
      message: "All users inserted successfully.",
      count: insertedUsers.length,
      users: insertedUsers,
    };
  }

  async createBulkUsers(user: CreateBulkUserSchema) {
    // const hashedPassword = await bcrypt.hash(user.password, 10);

    const createdUser = await prisma.user.create({
      data: {
        email: user.email,
        password: await bcrypt.hash(user.password, 10),
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username || null,
        mobile: user.mobile || null,
      },
    });

    const portalCategory = await prisma.portalCategory.findFirst({
      where: { name: "admin" },
    });

    if (!portalCategory) {
      throw new Error("Portal category 'admin' not found");
    }

    const userPortal = await prisma.userPortalCategory.create({
      data: {
        userId: createdUser.id,
        portalCategoryId: portalCategory.id,
      },
    });

    if (user.roleName) {
      const role = await prisma.role.findFirst({
        where: {
          name: normalizeRoleName(user.roleName),
          portalCategoryId: portalCategory.id,
        },
      });

      if (role) {
        await prisma.userPortalCategoryRole.create({
          data: {
            userPortalCategoryId: userPortal.id,
            roleId: role.id,
          },
        });
      } else {
        throw new Error(
          `Role '${user.roleName}' not found in portal '${portalCategory.name}'`,
        );
      }
    }

    return { user: createdUser };
  }
}
