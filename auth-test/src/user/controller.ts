import axios, { create } from "axios";
import { Request, RequestHandler, Response } from "express";
import * as XLSX from "xlsx";
import { z } from "zod";
import userDetails from "../../userInfo";
import createAuditLog from "../auditlog";
import { sendUpdatePasswordEmail } from "../modules/communication/mail/mailer";
import prisma from "../prisma/prisma.service";
import { RequestWithUser } from "../types";
import generateUserAccountNO from "../utils/generateUserAccountNO";
import { sendSuccessResponse } from "../utils/responseUtils";
import { zodSafeParse } from "../utils/zodUtils";
import {
  AuditLogFilterSchema,
  FilterTempUserSchema,
  registerSchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./schema";
import AuthService from "./service";
import { assignRoleReqBodySchema } from "./types";
import { AppError } from "../utils/AppError";
type GeoIPResult = {
  country?: string;
  region?: string;
  city?: string;
  ll?: [number, number];
} | null;

const userPortalCategorySchema = z.object({
  userId: z.string(),
  portalCategoryId: z.array(z.string()), // Not enforcing UUID format
  categoryId: z.string().optional(),
});

class AuthController {
  static register: RequestHandler = async (req: RequestWithUser, res) => {
    try {
      // Validate the request body
      const validatedData = registerSchema.parse(req.body);

      const {
        email,
        password,
        username,
        firstName,
        lastName,
        address,
        mobile,
        portalCategoryId,
        roleId,
        roleName,
      } = validatedData;
      const user = await AuthService.register(
        email,
        password,
        firstName,
        lastName,
        username,
        address || null,
        mobile || null,
        portalCategoryId || null,
        roleId || null,
        roleName || null,
      );

      // update user account no
      const userAccountNo = generateUserAccountNO(
        user.user.id,
        user.user.createdAt,
      );
      await prisma.user.update({
        where: {
          id: user.user.id,
        },
        data: {
          userAccountNo,
        },
      });

      if (req.user) {
        await prisma.auditLog.create({
          data: {
            action: ` created new user ${username}`,
            userId: req.user?.userId,
            targetUserId: user.user.id, // Assuming user.id is the ID of the newly created user
            actionType: "user_creation",
          },
        });
      }
      setImmediate(() =>
        axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/registration`, {
          email: validatedData?.email || "",
          username: validatedData?.username || "",
          firstName: validatedData?.firstName || "",
          password: validatedData?.password || "",
          loginUrl:
            process.env.ADMIN_LOGIN_URL || "http://localhost:3000/admin/login",
        }),
      );
      res.status(201).json({
        status: "success",
        message: "User registered successfully",
        user,
      });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static deleteUser: RequestHandler = async (req, res) => {
    const userId = req.params.userId; // Access userId directly from the URL parameter
    try {
      await AuthService.deleteUser(userId);
      res.json({ message: "User deleted successfully" });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };
  static refreshToken: RequestHandler = async (req, res) => {
    const { refreshToken } = req.body;
    try {
      const { newAccessToken } =
        await AuthService.refreshAccessToken(refreshToken);
      res.json({ newAccessToken });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static getAllUsers: RequestHandler = async (req, res) => {
    try {
      let permissionType = (req.query.permissionType as string) || undefined;
      const page = parseInt(req.query.page as string, 10) || 1;
      const search = (req.query.search as string) || "";
      const pageLimit = parseInt(req.query.pageSize as string) || 10;
      const portalCategoryName =
        (req.query.portalCategoryName as string) || undefined;
      const roleNames = (req.query.roleName as string) || undefined;
      let modules: { moduleName: string; permission: string[] }[] = [];

      if (req.query.modules) {
        try {
          modules = JSON.parse(req.query.modules as string);
        } catch (err) {
          res.status(400).json({ message: "Invalid modules JSON" });
        }
      }

      const users = await AuthService.getAllUsers(
        page,
        search,
        portalCategoryName,
        modules,
        roleNames,
        pageLimit,
      );

      if (permissionType) {
        permissionType = permissionType.toUpperCase();
        const tempUsers = users.data.filter((user) => {
          for (const permission of user.permissions) {
            for (const module of permission.modules) {
              if (module.permissionType === permissionType) {
                return true;
              }
            }
          }
        });

        const tempModulePermissions = tempUsers.map((user) => {
          const modules = [];
          for (const permission of user.permissions) {
            for (const module of permission.modules) {
              if (module.permissionType === permissionType) {
                modules.push(module);
              }
            }
            permission.modules = modules;
          }
          return user;
        });

        users.data = tempModulePermissions;
      }

      res.json(users);
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };
  // static getAllUsers: RequestHandler = async (req, res) => {
  //   try {
  //     const page = parseInt(req.query.page as string, 10) || 1;
  //     const search = (req.query.search as string) || "";
  //     const portalCategoryName =
  //       (req.query.portalCategoryName as string) || undefined;

  //     const users = await AuthService.getAllUsers(
  //       page,
  //       search,
  //       portalCategoryName
  //     );

  //     res.json(users);
  //   } catch (error: unknown) {
  //     if (error instanceof Error) {
  //       res.status(400).json({ message: error.message });
  //     } else {
  //       res.status(400).json({ message: "An unexpected error occurred" });
  //     }
  //   }
  // };

  static updateUser: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = req.params.userId; // Get the userId from the URL params
    try {
      // Validate the request body, making sure the data matches the expected schema
      const validatedData = updateUserSchema.partial().parse(req.body);

      // Call the service to update the user
      const updatedUser = await AuthService.updateUser(userId, validatedData);
      let actionType = "user_update";
      let action = `Updated the profile of ${(await userDetails(userId)).username}`;

      if ("userStatus" in validatedData) {
        if (validatedData.userStatus === "DEACTIVATED") {
          actionType = "user_deactivation";
          action = `Deactivated the profile of ${(await userDetails(userId)).username}`;
        } else if (validatedData.userStatus === "ACTIVE") {
          actionType = "user_activation";
          action = `Activated the profile of ${(await userDetails(userId)).username}`;
        }
      }

      await createAuditLog({
        userId: req.user?.userId ?? "",
        action,
        targetUserId: userId,
        actionType,
      });
      setImmediate(() =>
        axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
          userId: userId,
          type: "profile",
        }),
      );
      res.json({ message: "User updated successfully", updatedUser });
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static async updateUserStatus(req: RequestWithUser, res: Response) {
    const userId = req.params.userId;
    // throw new AppError("userId not found", "NOT_FOUND", 404);

    const validatedData = zodSafeParse(req.body, updateUserStatusSchema);
    const updateUser = await prisma.user.update({
      where: { id: userId },
      data: { userStatus: validatedData.userStatus },
    });
    createAuditLog({
      userId: req.user?.userId ?? "",
      action: `User status updated for user ${(await userDetails(userId)).username}`,
      targetUserId: userId,
      actionType: "user_status_update",
    });
    setImmediate(() =>
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
        userId: userId,
        type: "logout",
      }),
    );
    sendSuccessResponse(
      res,
      { userStatus: updateUser.userStatus },
      "User status updated successfully",
    );
  }

  static async assignRole(req: RequestWithUser, res: Response) {
    const reqBody = zodSafeParse(req.body, assignRoleReqBodySchema);

    // if (req.user) {
    //   await prisma.auditLog.create({
    //     data: {
    //       action: "User assigned role",
    //       userId: req.user?.userId,
    //     },
    //   });

    // }

    await AuthService.assignRole(reqBody);

    await createAuditLog({
      userId: req.user?.userId ?? "",
      action: ` assigned the user role:${(await userDetails(reqBody.userId)).username}  role changed from ${(await userDetails(reqBody.userId)).roleNames} to  ${reqBody.admin.roleName} `,
      targetUserId: reqBody.userId,
      actionType: "role_assign",
    });

    sendSuccessResponse(res, undefined, "User role assigned successfully");
  }

  static assignPortal: RequestHandler = async (
    req: RequestWithUser,
    res: Response,
  ): Promise<void> => {
    try {
      // Validate request body
      const validatedData = userPortalCategorySchema.parse(req.body);

      // Ensure portalCategoryId is an array
      if (!Array.isArray(validatedData.portalCategoryId)) {
        res.status(400).json({ message: "portalCategoryId must be an array" });
        return;
      }
      await prisma.userPortalCategory.updateMany({
        where: {
          userId: validatedData.userId,
        },
        data: {
          status: "INACTIVE",
        },
      });
      for (const portalCategoryId of validatedData.portalCategoryId) {
        const portalCategory = await prisma.userPortalCategory.findFirst({
          where: {
            portalCategoryId: portalCategoryId,
            userId: validatedData.userId,
          },
        });
        if (!portalCategory) {
          // console.log("portalCategoryId", portalCategoryId);
          await prisma.userPortalCategory.create({
            data: {
              userId: validatedData.userId,
              portalCategoryId,
            },
          });
        } else {
          await prisma.userPortalCategory.updateMany({
            where: {
              portalCategoryId: portalCategoryId,
              userId: validatedData.userId,
            },
            data: {
              status: "ACTIVE",
            },
          });
        }
      }
      // Delete all existing UserPortalCategoryRole entries for the user
      // await prisma.userPortalCategoryRole.deleteMany({
      //   where: {
      //     userPortalCategory: {
      //       userId: validatedData.userId,
      //     },
      //   },
      // });

      // // Delete all existing UserPortalCategory entries for the user
      // await prisma.userPortalCategory.deleteMany({
      //   where: {
      //     userId: validatedData.userId,
      //   },
      // });

      // Map through portalCategoryIds and create new entries
      const userPortalCategories = await Promise.all(
        validatedData.portalCategoryId.map((portalCategoryId: string) =>
          AuthService.createUserPortalCategory({
            userId: validatedData.userId,
            portalCategoryId,
          }),
        ),
      );

      // Log the action if the user is authenticated
      if (req.user) {
        await prisma.auditLog.create({
          data: {
            action: `Assigned portal categories to user ${(await userDetails(validatedData.userId)).username}`,
            userId: req.user?.userId,
            targetUserId: validatedData.userId,
          },
        });
      }

      // Respond with success message and the created userPortalCategories
      res.status(201).json({
        status: "success",
        message: "UserPortalCategories created successfully",
        userPortalCategories,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
        return;
      }
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "An unexpected error occurred" });
    }
  };

  static getUser: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await AuthService.getUser(userId);
      res.status(200).json({
        status: "success",
        message: "User retrieved successfully",
        user,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  static getUserRoleData: RequestHandler = async (req, res) => {
    const { userId, portalCategoryName } = req.body;

    if (!userId || !portalCategoryName) {
      res
        .status(400)
        .json({ message: "userId and portalCategoryName are required" });
      return;
    }

    try {
      const roleData = await AuthService.getUserRoleData(
        userId,
        portalCategoryName,
      );
      res.status(200).json({
        status: "success",
        message: "User role data retrieved successfully ",
        roleData: roleData || {}, // Ensure roleData is an array, default to empty array if null/undefined
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static getUserPortals: RequestHandler = async (req, res) => {
    try {
      const { userId } = req.params;
      const allPortal = await prisma.portalCategory.findMany();
      const userPortals = await AuthService.getUserPortals(userId);
      res.status(200).json({
        status: "success",
        message: "User portals retrieved successfully",
        userPortals,
        allPortal,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  };

  // static checkUser: RequestHandler = async (req, res) => {
  //   try {
  //     const userId = req.query.userid as string | undefined; // Get the userId from query params
  //     const username = req.query.username as string | undefined;
  //     const email = req.query.email as string | undefined;
  //     const mobile = req.query.mobile as string | undefined;

  //     if (!username && !email && !mobile) {
  //       res.status(400).json({
  //         message: "Please provide username, email, or mobile to check.",
  //       });
  //       return;
  //     }

  //     // Find the current user to exclude from the check
  //     const currentUser = userId
  //       ? await prisma.user.findUnique({
  //           where: { id: userId },
  //         })
  //       : null;

  //     // Check if the username, email, or mobile already exists, excluding the current user
  //     const existingUser = await prisma.user.findFirst({
  //       where: {
  //         AND: [
  //           {
  //             OR: [
  //               username ? { username } : undefined,
  //               email ? { email } : undefined,
  //               mobile ? { mobile } : undefined,
  //             ].filter(Boolean) as any, // Filters out `undefined` values
  //           },
  //           {
  //             NOT: {
  //               id: userId, // Exclude the current user
  //             },
  //           },
  //         ],
  //       },
  //     });

  //     if (existingUser) {
  //       // Dynamically set the message based on the field that exists
  //       const field = username ? "username" : email ? "email" : "mobile";
  //       res.status(200).json({
  //         exists: true,
  //         message: `${field} already exists`,
  //       });
  //       return;
  //     }

  //     const field = username ? "username" : email ? "email" : "mobile";
  //     res.status(200).json({ exists: false, message: `${field} is available` });
  //     return;
  //   } catch (error) {
  //     console.error("Error checking user:", error);
  //     res.status(500).json({ message: "Internal server error" });
  //     return;
  //   }
  // };

  static checkUser: RequestHandler = async (req, res) => {
    try {
      const userId = req.query.userid as string | undefined;
      const username = req.query.username as string | undefined;
      const email = req.query.email as string | undefined;
      const portal = req.query.portal as string | undefined;

      if (!username && !email) {
        res.status(400).json({
          message: "Please provide username or email to check.",
        });
        return;
      }

      // Determine the fields to query based on the portal
      let usernameField: keyof typeof prisma.user.fields | undefined;
      let emailField: keyof typeof prisma.user.fields | undefined;

      if (portal === "faculty") {
        usernameField = "facultyUser";
        emailField = "facultyEmail";
      } else if (portal === "agent") {
        usernameField = "agentUser";
        emailField = "agentEmail";
      } else {
        // Default to admin or general user
        usernameField = "username";
        emailField = "email";
      }

      // Build the OR condition for username/email, skipping undefined
      const orConditions = [
        username
          ? { [usernameField]: { equals: username, mode: "insensitive" } }
          : undefined,
        email
          ? { [emailField]: { equals: email, mode: "insensitive" } }
          : undefined,
      ].filter(Boolean) as any;

      // Perform the query, excluding the current user if provided
      const existingUser = await prisma.user.findFirst({
        where: {
          AND: [
            {
              OR: orConditions,
            },
            {
              NOT: {
                id: userId,
              },
            },
          ],
        },
      });

      if (existingUser) {
        const field = username ? "username" : "email";
        res.status(200).json({
          exists: true,
          message: `${field} already exists`,
        });
        return;
      }

      const field = username ? "username" : "email";
      res.status(200).json({ exists: false, message: `${field} is available` });
    } catch (error) {
      console.error("Error checking user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  static async getAuditLogs(req: Request, res: Response) {
    try {
      const {
        limit = 10,
        search = "",
        startDate,
        endDate,
        actionTypes = [],
      } = req.body;
      const page = parseInt(req.query.page as string, 10) || 1;
      const auditLogs = await AuthService.getAllAuditLogs(
        page,
        limit,
        search,
        startDate,
        endDate,
        actionTypes,
      );

      res.json(auditLogs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch audit logs",
        error: (error as Error).message,
      });
    }
  }
  // static async getAuditLogs(req: Request, res: Response) {
  //   try {
  //     const page = parseInt(req.query.page as string, 10) || 1;
  //     const limit = parseInt(req.query.limit as string, 10) || 10;
  //     const search = (req.query.name as string) || "";
  //     const startDate = req.query.startDate as string;
  //     const endDate = req.query.endDate as string;
  //     const actionType = req.query.actionType as string; // <- New

  //     const auditLogs = await AuthService.getAllAuditLogs(
  //       page,
  //       limit,
  //       search,
  //       startDate,
  //       endDate,
  //       actionType
  //     );
  //     res.json(auditLogs);
  //   } catch (error) {
  //     res.status(500).json({ message: "Failed to fetch audit logs" });
  //   }
  // }

  static async getUserAuditLogs(req: Request, res: Response) {
    try {
      const userId = req.params.userId; // Get userId from URL params
      const {
        limit = 10,
        name: search = "",
        startDate,
        endDate,
        actionTypes = [],
      } = req.body;
      const page = parseInt(req.query.page as string, 10) || 1;

      // Fetch audit logs for the specific user
      const auditLogs = await AuthService.getUserAuditLogs(
        userId, // Pass userId to the service
        page,
        limit,
        search,
        startDate,
        endDate,
        actionTypes,
      );

      res.json({
        success: "success",
        message: "Audit logs fetched by user ID successfully",
        auditLogs,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  }

  static async forceLogoutUser(req: RequestWithUser, res: Response) {
    const userId = req.params.userId;

    await prisma.browsersAndDevices.deleteMany({
      where: { userId: userId },
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isForceLogout: true },
    });

    setImmediate(() =>
      axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/server-info`, {
        userId: userId,
        type: "session",
      }),
    );
    createAuditLog({
      userId: req.user?.userId ?? "",
      action: `User forced logout for user ${(await userDetails(userId)).username}`,
      actionType: "UPDATE",
    });
    res.status(200).json({
      status: "success",
      message: "User forced logout and devices cleared successfully",
      user: updatedUser,
    });
  }

  static updatePassword: RequestHandler = async (req: RequestWithUser, res) => {
    const userId = req.params.userId; // Get the userId from the URL params
    const { newPassword } = req.body; // Extract the new password from the request body

    if (!newPassword) {
      res.status(400).json({ message: "New password is required" });
      return;
    }

    try {
      // Hash the new password
      const hashedPassword = await AuthService.hashPassword(newPassword);

      // Update the user's password in the database
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword,
          passwordChanged: false,
        },
      });

      await createAuditLog({
        userId: req.user?.userId ?? "",
        action: `Password updated for user ${(await userDetails(userId)).username}`,
        targetUserId: updatedUser.id,
        actionType: "password_reset",
      });
      await sendUpdatePasswordEmail(
        {
          email: updatedUser.email || "",
          username: updatedUser.username || undefined,
          firstName: updatedUser.firstName,
          password: newPassword,
        },
        process.env.ADMIN_LOGIN_URL || "https://your-login-page.com",
      );
      // Respond with success message
      res.status(200).json({
        status: "success",
        message: "Password updated successfully",
        user: updatedUser,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static async exportAuditLogsToExcel(req: RequestWithUser, res: Response) {
    try {
      const search =
        (req.query.name as string) || (req.query.search as string) || "";
      const filter = (req.query.filter as string) || "all";
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const type = req.query.type as string | undefined;

      const parsed = AuditLogFilterSchema.safeParse({
        filter,
        startDate,
        endDate,
        type,
      });

      if (!parsed.success) {
        res.status(400).json({ message: "Invalid filter data" });
        return;
      }

      const filterDto = parsed.data;

      let whereClause: any = {};

      if (search) {
        whereClause.OR = [
          { action: { contains: search, mode: "insensitive" } },
          {
            user: {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
              ],
            },
          },
          { moduleName: { contains: search, mode: "insensitive" } },
          { actionType: { contains: search, mode: "insensitive" } },
          { courseId: { contains: search, mode: "insensitive" } },
          { moduleId: { contains: search, mode: "insensitive" } },
          { otherId: { contains: search, mode: "insensitive" } },
        ];
      }

      if (filterDto.filter === "last30days") {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        whereClause.createdAt = { gte: thirtyDaysAgo };
      } else if (
        filterDto.filter === "dateRange" &&
        filterDto.startDate &&
        filterDto.endDate
      ) {
        const start = new Date(filterDto.startDate);
        const end = new Date(filterDto.endDate);

        end.setHours(23, 59, 59, 999);

        whereClause.createdAt = {
          gte: start,
          lte: end,
        };
      }

      const logs = await prisma.auditLog.findMany({
        where: whereClause,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      });

      const dataToExport = logs.map((log) => ({
        ID: log.id,
        Action: log.action,
        User: log.user
          ? `${log.user.firstName} ${log.user.lastName}`
          : "Unknown",
        "Created At": log.createdAt.toISOString(),
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Audit Logs");

      const buffer = XLSX.write(workbook, {
        type: "buffer",
        bookType: "xlsx",
      });
      createAuditLog({
        userId: req.user?.userId ?? "",
        action: `Exported audit logs`,
      });

      res.setHeader(
        "Content-Disposition",
        "attachment; filename=audit_logs.xlsx",
      );
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.send(buffer);
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ message: "Failed to export audit logs" });
    }
  }

  static async filterUser(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        moduleFilters = [],
        roleFilters = [],
      } = req.body;

      const result = await AuthService.filterUser(
        Number(page),
        Number(limit),
        moduleFilters,
        roleFilters,
      );

      res.status(200).json({
        status: "success",
        message: "Users filtered successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }

  static bulkUser = async (req: RequestWithUser, res: Response) => {
    const users = [
      {
        email: "john@example.com",
        password: "123456",
        firstName: "John",
        lastName: "Doe",
        username: "johndoe",
        // address: "123 Main St",
        mobile: "1234567890",
        roleName: "admin",
      },
    ];
    const csvStream = await AuthService.generateCSV(users);
    res.setHeader("Content-Disposition", "attachment; filename=file.csv");
    res.setHeader("Content-Type", "text/csv");
    csvStream.pipe(res);
  };

  static userProfile: RequestHandler = async (req: RequestWithUser, res) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }

      const userProfile = await AuthService.userProfile(userId);

      // Respond with the user profile data
      res.status(200).json({
        status: "success",
        message: "User profile retrieved successfully",
        data: userProfile,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "An unexpected error occurred" });
      }
    }
  };

  static async getAllTempUsers(req: Request, res: Response): Promise<void> {
    try {
      // Handle case where body is empty/undefined
      const body = req.body || {};

      const {
        page = 1,
        limit = 10,
        moduleFilters = [],
        roleFilters = [],
        startDate,
        endDate,
        manualRevocation,
        search, // Add search
      } = body;

      // Prepare date filters if any
      const dateFilters = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        manualRevocation:
          manualRevocation !== undefined ? manualRevocation : undefined,
      };

      const result = await AuthService.filterTempUser(
        Number(page),
        Number(limit),
        moduleFilters,
        roleFilters,
        dateFilters,
        search, // Pass search
      );

      res.status(200).json({
        status: "success",
        message: "Users filtered successfully",
        data: result,
      });
    } catch (error) {
      res.status(500).json({ message: (error as Error).message });
    }
  }
}

export default AuthController;

export const tempAllUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const parsed = zodSafeParse(req.body, FilterTempUserSchema);
  const userData = await AuthService.filterTempUserData(parsed);

  sendSuccessResponse(res, userData);
};

export const AuthTempController = {
  tempAllUsers,
};
