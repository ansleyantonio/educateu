import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
const { Readable } = require("stream");

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultAccessTokenSecret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "defaultRefreshTokenSecret";
const ACCESS_TOKEN_EXPIRATION = process.env.ACCESS_TOKEN_EXPIRATION || "1h";
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || "7d";

import { z } from "zod";
import prisma from "../prisma/prisma.service";
import { nonEmptyString } from "../types";
import { AppError } from "../utils/AppError";
import { zodSafeParse } from "../utils/zodUtils";
import { FilterTempUserSchema } from "./schema";
import { AssignRoleReqBody } from "./types";
const userPortalCategorySchema = z.object({
  userId: z.string(),
  portalCategoryId: z.string(),
  categoryId: z.string().optional(),
});

class AuthService {
  static async getUser(userId: string) {
    const today = new Date();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userPortalCategoryModules: {
          where: {
            OR: [
              { permissionType: "PERMANENT" },
              {
                permissionType: "TEMPORARY",
                permissionEndDate: { gte: today },
              },
            ],
          },
          include: {
            portalCategory: true,
            module: true,
          },
        },
      },
    });

    return user;
  }
  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username?: string | null,
    address?: string | null,
    mobile?: string | null,
    portalCategoryId?: string | null,
    roleId?: string | null,
    roleName?: string | null,
  ) {
    // Check if the email is already used by another user
    const existingUserByEmail = await prisma.user.findFirst({
      where: {
        email: { equals: email, mode: "insensitive" },
      },
    });
    if (existingUserByEmail) {
      throw new Error("Email is already registered by another user");
    }

    // Check if the mobile number is already in use by another user
    const existingUserByMobile = await prisma.user.findFirst({
      where: {
        mobile: { equals: mobile, mode: "insensitive" },
      },
    });
    // if (existingUserByMobile) {
    //   throw new Error('Mobile number is already registered by another user');
    // }

    // Check if the username is already in use by another user
    if (username) {
      const existingUserByUsername = await prisma.user.findFirst({
        where: {
          username: { equals: username, mode: "insensitive" },
        },
      });
      if (existingUserByUsername) {
        throw new Error("Username is already registered by another user");
      }
    }

    // If portalCategoryId is provided, validate it
    if (portalCategoryId) {
      const portalCategoryExists = await prisma.portalCategory.findUnique({
        where: {
          id: portalCategoryId,
        },
      });

      if (!portalCategoryExists) {
        throw new Error(
          "Invalid portalCategoryId: Portal category does not exist",
        );
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        username: username || null,
        address: address || null,
        mobile,
      },
    });

    const adminPortalCategories = await prisma.portalCategory.findMany({
      where: {
        name: "admin",
      },
    });

    if (adminPortalCategories) {
      for (const adminPortalCategory of adminPortalCategories) {
        await prisma.userPortalCategory.create({
          data: {
            userId: user.id,
            portalCategoryId: adminPortalCategory.id,
          },
        });
      }
    }
    // this.assignRole({
    //   userId: user.id,
    //   admin: {
    //     roleId: roleId ?? "",
    //     roleName: roleName ?? "",
    //   },
    // });
    if (roleId && roleName) {
      this.assignRole({
        userId: user.id,
        admin: {
          roleId,
          roleName,
        },
      });
    }

    return { user };
  }

  static async login(username: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: username, mode: "insensitive" } },
          { mobile: { equals: username, mode: "insensitive" } },
          { username: { equals: username, mode: "insensitive" } },
        ],
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("Username and password combination is incorrect");
    }
    if (user.userStatus !== "ACTIVE") {
      throw new Error("User account is not active");
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new Error("Password is incorrect");
    }

    const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });

    const refreshToken = jwt.sign({ userId: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    // Extract roles (roleId and name)
    const roles = user.userRoles.map((userRole) => ({
      roleId: userRole.role.id,
      roleName: userRole.role.name,
    }));

    // return { user, roles, accessToken, refreshToken };
    const { password: _password, ...userWithoutPassword } = user;

    return { user, roles, accessToken, refreshToken };
  }

  static verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET,
      ) as JwtPayload;
      const userId = decoded.userId;

      const newAccessToken = jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRATION,
      });

      return { newAccessToken };
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }
  static async getAllUsers(
    page = 1,
    search = "",
    portalCategoryName?: string,
    modules: { moduleName: string; permission: string[] }[] = [],
    roleNames?: string,
    pageLimit?: number,
  ) {
    try {
      const pageSize = pageLimit || 10;
      const skip = (page - 1) * pageSize;
      const today = new Date();

      // Base filters
      const where: any = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { mobile: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { userAccountNo: { contains: search, mode: "insensitive" } },
        ],
        // userStatus: "ACTIVE",
        NOT: {
          userPortalCategories: {
            some: {
              portalCategory: {
                OR: [{ name: "agent" }, { name: "faculty" }],
              },
            },
          },
        },
      };

      if (portalCategoryName) {
        where.userPortalCategories = {
          some: {
            portalCategory: {
              name: portalCategoryName,
            },
            status: "ACTIVE",
          },
        };
      }
      if (roleNames && roleNames.length > 0) {
        where.userPortalCategories = {
          ...where.userPortalCategories,
          some: {
            ...where.userPortalCategories?.some,
            userPortalCategoryRoles: {
              some: {
                role: {
                  name: roleNames,
                },
              },
            },
          },
        };
      }

      // Add modules permission filter if provided
      if (modules.length > 0) {
        where.AND = modules.map((module) => {
          const moduleCondition = {
            userPortalCategoryModules: {
              some: {
                AND: [
                  {
                    module: {
                      name: module.moduleName,
                    },
                  },
                  {
                    OR: [
                      { permissionType: "PERMANENT" },
                      { permissionType: "ROLE" },
                      {
                        permissionType: "TEMPORARY",
                        AND: [
                          { permissionStartDate: { lte: today } },
                          { permissionEndDate: { gte: today } },
                          { manualRevocation: false },
                        ],
                      },
                    ],
                  },
                  ...module.permission.map((perm) => ({
                    modulePermission: {
                      path: ["$"],
                      array_contains: perm,
                    },
                  })),
                ],
              },
            },
          };

          return moduleCondition;
        });
      }

      // Fetch users with all required fields
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          mobile: true,
          username: true,
          firstName: true,
          lastName: true,
          address: true,
          userStatus: true,
          mfaEnabled: true,
          userAccountNo: true,
          userPortalCategories: {
            where: { status: "ACTIVE" },
            select: {
              portalCategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
              userPortalCategoryRoles: {
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
          },
          userPortalCategoryModules: {
            where: {
              OR: [
                { permissionType: "PERMANENT" },
                { permissionType: "ROLE" },
                {
                  permissionType: "TEMPORARY",
                  AND: [
                    { permissionStartDate: { lte: today } },
                    { permissionEndDate: { gte: today } },
                    { manualRevocation: false },
                  ],
                },
              ],
            },
            select: {
              id: true,
              portalCategory: {
                select: {
                  id: true,
                  name: true,
                },
              },
              module: {
                select: {
                  id: true,
                  name: true,
                },
              },
              permissionType: true,
              modulePermission: true,
              permissionStartDate: true,
              permissionEndDate: true,
              manualRevocation: true,
            },
          },
        },
        skip,
        orderBy: {
          createdAt: "desc",
        },
        take: pageSize,
      });

      // Transform the data
      const transformedUsers = users.map((user) => {
        const portalCategories = user.userPortalCategories.map((upc) => ({
          portalCategoryId: upc.portalCategory.id,
          portalCategoryName: upc.portalCategory.name,
          roles: upc.userPortalCategoryRoles.map((role) => ({
            roleId: role.role.id,
            roleName: role.role.name,
          })),
        }));

        const portalCategoryMap = new Map();

        user.userPortalCategoryModules.forEach((upcm) => {
          const portalCategoryId = upcm.portalCategory.id;
          const portalCategoryName = upcm.portalCategory.name;
          const module = {
            userPortalCategoryModuleId: upcm.id,
            moduleId: upcm.module.id,
            moduleName: upcm.module.name,
            permissionType: upcm.permissionType,
            modulePermission: upcm.modulePermission,
            startDate: upcm.permissionStartDate,
            endDate: upcm.permissionEndDate,
            manualRevocation: upcm.manualRevocation,
          };

          if (!portalCategoryMap.has(portalCategoryId)) {
            portalCategoryMap.set(portalCategoryId, {
              portalCategoryId,
              portalCategoryName,
              modules: [],
            });
          }

          portalCategoryMap.get(portalCategoryId).modules.push(module);
        });

        return {
          id: user.id,
          email: user.email,
          mobile: user.mobile,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          address: user.address,
          userStatus: user.userStatus,
          mfaEnabled: user.mfaEnabled,
          userAccountNo: user.userAccountNo,
          portalCategories,
          permissions: Array.from(portalCategoryMap.values()),
        };
      });

      // Get total count for pagination
      const totalUsers = await prisma.user.count({ where });
      return {
        data: transformedUsers,
        totalUsers,
        totalPages: Math.ceil(totalUsers / pageSize),
        currentPage: page,
      };
    } catch (error) {
      throw new Error("Failed to fetch users");
    }
  }

  // static async getAllUsers(page = 1, search = "", portalCategoryName?: string) {
  //   try {
  //     const pageSize = 10;
  //     const skip = (page - 1) * pageSize;

  //     // Build search filters
  //     const filters: any = {
  //       OR: [
  //         { firstName: { contains: search, mode: "insensitive" } },
  //         { lastName: { contains: search, mode: "insensitive" } },
  //         { email: { contains: search, mode: "insensitive" } },
  //         { mobile: { contains: search, mode: "insensitive" } },
  //         { username: { contains: search, mode: "insensitive" } },
  //       ],
  //     };

  //     if (portalCategoryName) {
  //       filters.userPortalCategories = {
  //         some: {
  //           portalCategory: {
  //             name: {
  //               contains: portalCategoryName,
  //               mode: "insensitive",
  //             },
  //           },
  //           status: "ACTIVE",
  //         },
  //       };
  //     }

  //     // Fetch users with permanent roles & temporary permissions
  //     const users = await prisma.user.findMany({
  //       where: filters,
  //       select: {
  //         id: true,
  //         email: true,
  //         mobile: true,
  //         username: true,
  //         firstName: true,
  //         lastName: true,
  //         userStatus: true,
  //         // Permanent portal categories with roles
  //         userPortalCategories: {
  //           where: { status: "ACTIVE" },
  //           select: {
  //             portalCategory: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //             userPortalCategoryRoles: {
  //               select: {
  //                 role: {
  //                   select: {
  //                     id: true,
  //                     name: true,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         // Temporary permissions with portalCategoryId, end date, module permissions & userPortalCategoryModule ID
  //         userPortalCategoryModules: {
  //           where: {
  //             permissionType: "TEMPORARY",
  //           },
  //           select: {
  //             id: true, // userPortalCategoryModule ID
  //             portalCategory: {
  //               select: {
  //                 id: true, // Include portalCategoryId
  //                 name: true,
  //               },
  //             },
  //             module: {
  //               select: {
  //                 id: true,
  //                 name: true,
  //               },
  //             },
  //             permissionStartDate: true,
  //             permissionEndDate: true,
  //             modulePermission: true,
  //             manualRevocation: true,
  //           },
  //         },
  //       },
  //       skip,
  //       orderBy: {
  //         createdAt: "desc",
  //       },
  //       take: pageSize,
  //     });

  //     const transformedUsers = users.map((user) => {
  //       const portalCategories = user.userPortalCategories.map((upc) => ({
  //         portalCategoryId: upc.portalCategory.id,
  //         portalCategoryName: upc.portalCategory.name,
  //         roles: upc.userPortalCategoryRoles.map((role) => ({
  //           roleId: role.role.id,
  //           roleName: role.role.name,
  //         })),
  //       }));

  //       const portalCategoryMap = new Map();

  //       user.userPortalCategoryModules.forEach((upcm) => {
  //         const portalCategoryId = upcm.portalCategory.id;
  //         const portalCategoryName = upcm.portalCategory.name;
  //         const module = {
  //           userPortalCategoryModuleId: upcm.id, // userPortalCategoryModule ID
  //           moduleId: upcm.module.id,
  //           moduleName: upcm.module.name,
  //           startDate: upcm.permissionStartDate, // Added start date
  //           endDate: upcm.permissionEndDate,
  //           modulePermission: upcm.modulePermission,
  //           manualRevocation: upcm.manualRevocation,
  //         };

  //         if (!portalCategoryMap.has(portalCategoryId)) {
  //           portalCategoryMap.set(portalCategoryId, {
  //             portalCategoryId, // Now included!
  //             portalCategoryName,
  //             modules: [],
  //           });
  //         }

  //         portalCategoryMap.get(portalCategoryId).modules.push(module);
  //       });

  //       return {
  //         id: user.id,
  //         email: user.email,
  //         mobile: user.mobile,
  //         username: user.username,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         userStatus: user.userStatus,
  //         portalCategories, // Permanent Portal Categories with Roles
  //         temporaryPermissions: Array.from(portalCategoryMap.values()), // Temporary Permissions with portalCategoryId
  //       };
  //     });

  //     // Get total count for pagination
  //     const totalUsers = await prisma.user.count({
  //       where: filters,
  //     });

  //     return {
  //       data: transformedUsers,
  //       totalUsers,
  //       totalPages: Math.ceil(totalUsers / pageSize),
  //       currentPage: page,
  //     };
  //   } catch (error) {
  //     throw new Error("Failed to fetch users");
  //   }
  // }

  static async updateUser(userId: string, updateData: any) {
    try {
      const { userRoles, password, email, username, mobile, ...userData } =
        updateData;

      if (email) {
        const existingUserByEmail = await prisma.user.findFirst({
          where: {
            email,
            id: { not: userId },
          },
        });
        if (existingUserByEmail) {
          throw new Error("Email is already registered by another user");
        }
      }

      if (username) {
        const existingUserByUsername = await prisma.user.findFirst({
          where: {
            username,
            id: { not: userId },
          },
        });
        if (existingUserByUsername) {
          throw new Error("Username is already registered by another user");
        }
      }

      if (password) {
        userData.password = await bcrypt.hash(password, 10);
      }

      // Allowing mobile to be null or empty string
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          ...userData,
          email,
          username,
          mobile: mobile === "" ? null : mobile, // Convert empty string to null
        },
      });

      if (userRoles) {
        for (const role of userRoles) {
          await prisma.userRole.updateMany({
            where: {
              userId,
              roleId: role.roleId,
            },
            data: {
              roleData: {
                potentialPayment: role.roleData?.potentialPayment || undefined,
                userStatus: role.roleData?.userStatus || undefined,
                companyName: role.roleData?.companyName || undefined,
                aggrementExpiryDate:
                  role.roleData?.aggrementExpiryDate || undefined,
                commitionRate: role.roleData?.commitionRate || undefined,
              },
            },
          });
        }
      }

      return await prisma.user.findUnique({
        where: { id: updatedUser.id },
        include: {
          userRoles: {
            include: { role: true },
          },
        },
      });
    } catch (error) {
      throw new Error("Failed to update user");
    }
  }

  static async deleteUser(userId: string) {
    try {
      // Check if the user exists
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error("User not found");
      }

      // Delete UserRoleApplication first
      await prisma.userRoleApplication.deleteMany({
        where: {
          userRole: {
            userId: userId,
          },
        },
      });

      // Delete UserRole next
      await prisma.userRole.deleteMany({ where: { userId } });

      // Delete AuditLogs
      await prisma.auditLog.deleteMany({ where: { userId } });
      await prisma.browsersAndDevices.deleteMany({ where: { userId } });

      // Finally, delete the user
      await prisma.user.delete({ where: { id: userId } });
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      throw new Error(error instanceof Error ? error.message : "Unknown error");
    }
  }

  static async getUserProfile(userId: string) {
    try {
      // Fetch the user profile details
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          userRoles: true,
        },
      });
      if (!user) {
        throw new Error("User not found");
      }
      const roleData = user.userRoles[0].roleData as any;
      const cleanedRoleData = roleData?.set || roleData || {}; // Extract set if present

      const userData = {
        id: user.id,
        email: user.email,
        mobile: user.mobile,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        passwordChanged: user.passwordChanged,
        address: user.address,
        userStatus: user.userStatus,
        companyName: cleanedRoleData.companyName || null,
        aggrementExpiryDate: cleanedRoleData.aggrementExpiryDate || null,
        commitionRate: cleanedRoleData.commitionRate || null,
        potentialPayment: cleanedRoleData.potentialPayment || null,
        internalReference: cleanedRoleData.internalReference || null,
        // role: user.userRoles[0].role.name,
        // roleData: cleanedRoleData,
      };

      if (!user) {
        throw new Error("User not found");
      }

      return userData;
    } catch (error) {
      throw new Error("Failed to fetch user profile");
    }
  }

  static async getDeviceHistory(userId: string) {
    try {
      // Fetch all device records for the given userId
      const devices = await prisma.browsersAndDevices.findMany({
        where: { userId: userId },
      });

      if (!devices.length) {
        throw new Error("No device history found for this user.");
      }

      return devices;
    } catch (error) {
      throw new Error("Failed to fetch device history");
    }
  }

  static async deleteDeviceHistory(userId: string, id: string) {
    try {
      await prisma.browsersAndDevices.delete({
        where: {
          userId: userId,
          id: id, // Convert id to number
        },
      });
    } catch (error) {
      throw new Error("Failed to delete device history");
    }
  }
  static async getAllAuditLogs(
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate?: string,
    endDate?: string,
    actionTypes?: string[] | string,
  ) {
    const skip = (page - 1) * limit;
    const filters: any = {};

    // Normalize actionTypes to always be an array
    const normalizedActionTypes = Array.isArray(actionTypes)
      ? actionTypes
      : actionTypes
        ? [actionTypes]
        : undefined;

    // Date filtering
    filters.createdAt = {};
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      if (!isNaN(parsedStartDate.getTime())) {
        filters.createdAt.gte = parsedStartDate;
      }
    } else {
      // Default to last 30 days if no startDate is provided
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filters.createdAt.gte = thirtyDaysAgo;
    }

    if (endDate) {
      const parsedEndDate = new Date(endDate);
      if (!isNaN(parsedEndDate.getTime())) {
        parsedEndDate.setHours(23, 59, 59, 999);
        filters.createdAt.lte = parsedEndDate;
      }
    }

    // Action type filtering
    // if (normalizedActionTypes && normalizedActionTypes.length > 0) {
    //   filters.actionType = {
    //     in: normalizedActionTypes,
    //     mode: "insensitive",
    //   };
    // }
    // Action type / moduleName filtering
    if (normalizedActionTypes && normalizedActionTypes.length > 0) {
      filters.OR = [
        {
          actionType: {
            in: normalizedActionTypes,
            mode: "insensitive",
          },
        },
        {
          moduleName: {
            in: normalizedActionTypes,
            mode: "insensitive",
          },
        },
      ];
    }

    // User search filtering
    if (search) {
      filters.user = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    // Fetch audit logs
    const auditLogs = await prisma.auditLog.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            facultyUser: true,
            agentUser: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const processedAuditLogs = auditLogs.map((log) => {
      const { user } = log;

      const fallbackUsername =
        user.username || user.facultyUser || user.agentUser || "";

      // Remove original fallback fields if you don’t want them exposed
      const { facultyUser, agentUser, ...restUser } = user;

      return {
        ...log,
        user: {
          ...restUser,
          username: fallbackUsername, // Replace `username` directly!
        },
      };
    });

    const totalRecords = await prisma.auditLog.count({ where: filters });

    return {
      auditLogs: processedAuditLogs,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
    };
  }

  // static async getAllAuditLogs(
  //   page: number = 1,
  //   limit: number = 10,
  //   search: string = "",
  //   startDate?: string,
  //   endDate?: string,
  //   actionType?: string
  // ) {
  //   const skip = (page - 1) * limit;

  //   const filters: any = {};

  //   // Handle createdAt filtering
  //   if (startDate || endDate) {
  //     filters.createdAt = {};
  //     if (startDate) {
  //       const parsedStartDate = new Date(startDate);
  //       if (!isNaN(parsedStartDate.getTime())) {
  //         filters.createdAt.gte = parsedStartDate;
  //       }
  //     }
  //     if (endDate) {
  //       const parsedEndDate = new Date(endDate);
  //       if (!isNaN(parsedEndDate.getTime())) {
  //         // Include full end of the day
  //         parsedEndDate.setHours(23, 59, 59, 999);
  //         filters.createdAt.lte = parsedEndDate;
  //       }
  //     }
  //   } else {
  //     // Default last 30 days
  //     const now = new Date();
  //     const thirtyDaysAgo = new Date();
  //     thirtyDaysAgo.setDate(now.getDate() - 30);
  //     filters.createdAt = {
  //       gte: thirtyDaysAgo,
  //     };
  //   }

  //   // Case-insensitive actionType filter
  //   if (actionType) {
  //     filters.actionType = {
  //       equals: actionType,
  //       mode: "insensitive",
  //     };
  //   }

  //   // Main where clause
  //   const whereClause: any = { ...filters };

  //   // Optional user search
  //   if (search) {
  //     whereClause.user = {
  //       OR: [
  //         { firstName: { contains: search, mode: "insensitive" } },
  //         { lastName: { contains: search, mode: "insensitive" } },
  //         { username: { contains: search, mode: "insensitive" } },
  //       ],
  //     };
  //   }

  //   const auditLogs = await prisma.auditLog.findMany({
  //     where: whereClause,
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //           username: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     skip,
  //     take: limit,
  //   });

  //   const totalRecords = await prisma.auditLog.count({ where: whereClause });

  //   return {
  //     auditLogs,
  //     totalRecords,
  //     totalPages: Math.ceil(totalRecords / limit),
  //     currentPage: page,
  //   };
  // }

  // static async getAllAuditLogs(
  //   page: number = 1,
  //   limit: number = 10,
  //   search: string = "",
  //   startDate?: string,
  //   endDate?: string,
  //   actionType?: string
  // ) {
  //   const skip = (page - 1) * limit;
  //   const filters: any = {};

  //   // Handle date filtering
  //   if (startDate && endDate) {
  //     filters.createdAt = {
  //       gte: new Date(startDate),
  //       lte: new Date(endDate),
  //     };
  //   } else if (startDate) {
  //     filters.createdAt = {
  //       gte: new Date(startDate),
  //     };
  //   } else if (endDate) {
  //     filters.createdAt = {
  //       lte: new Date(endDate),
  //     };
  //   } else {
  //     // Default to last 30 days if no custom range is provided
  //     const now = new Date();
  //     const thirtyDaysAgo = new Date();
  //     thirtyDaysAgo.setDate(now.getDate() - 30);

  //     filters.createdAt = {
  //       gte: thirtyDaysAgo,
  //     };
  //   }
  //   if (actionType) {
  //     filters.actionType = actionType;
  //   }

  //   // Optional search filter
  //   if (search) {
  //     filters.user = {
  //       OR: [
  //         { firstName: { contains: search, mode: "insensitive" } },
  //         { lastName: { contains: search, mode: "insensitive" } },
  //         { username: { contains: search, mode: "insensitive" } },
  //       ],
  //     };
  //   }

  //   const auditLogs = await prisma.auditLog.findMany({
  //     where: filters,
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //           username: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     skip,
  //     take: limit,
  //   });

  //   const totalRecords = await prisma.auditLog.count({ where: filters });

  //   return {
  //     auditLogs,
  //     totalRecords,
  //     totalPages: Math.ceil(totalRecords / limit),
  //     currentPage: page,
  //   };
  // }

  // static async getAllAuditLogs(
  //   page: number = 1,
  //   limit: number = 10,
  //   search: string = "",
  //   startDate?: string,
  //   endDate?: string
  // ) {
  //   const skip = (page - 1) * limit;

  //   // Building dynamic filters
  //   const filters: any = {};

  //   if (search) {
  //     filters.user = {
  //       OR: [
  //         { firstName: { contains: search, mode: "insensitive" } },
  //         { lastName: { contains: search, mode: "insensitive" } },
  //         { username: { contains: search, mode: "insensitive" } },
  //       ],
  //     };
  //   }

  //   if (startDate && endDate) {
  //     filters.createdAt = {
  //       gte: new Date(startDate),
  //       lte: new Date(endDate),
  //     };
  //   } else if (startDate) {
  //     filters.createdAt = { gte: new Date(startDate) };
  //   } else if (endDate) {
  //     filters.createdAt = { lte: new Date(endDate) };
  //   }

  //   // Fetch audit logs with filters, pagination, and ordering
  //   const auditLogs = await prisma.auditLog.findMany({
  //     where: filters,
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //           username: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     skip,
  //     take: limit,
  //   });

  //   // Get total count for pagination metadata
  //   const totalRecords = await prisma.auditLog.count({ where: filters });

  //   return {
  //     auditLogs,
  //     totalRecords,
  //     totalPages: Math.ceil(totalRecords / limit),
  //     currentPage: page,
  //   };
  // }

  // Create an audit log entry
  static async createAuditLog(userId: string, action: string) {
    return await prisma.auditLog.create({
      data: {
        userId,
        action,
      },
    });
  }

  static async deleteUserAuditLogs(userId: string) {
    try {
      await prisma.auditLog.deleteMany({
        where: { userId },
      });
    } catch (error) {
      throw new Error("Failed to delete user audit logs");
    }
  }
  static async checkDuplicatePortalCategory(
    userId: string,
    portalCategoryId: string,
  ) {
    // Check if the user is already assigned to the specified portal category
    const existingUserPortalCategory =
      await prisma.userPortalCategory.findUnique({
        where: {
          userId_portalCategoryId: {
            userId,
            portalCategoryId,
          },
        },
      });

    return existingUserPortalCategory;
  }

  static async createUserPortalCategory(data: {
    userId: string;
    portalCategoryId: string;
  }) {
    // First, check if the userId exists in the User table
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId }, // Assuming `id` is the primary key for the User table
    });

    if (!userExists) {
      throw new AppError(
        `User with ID ${data.userId} does not exist.`,
        "Not found",
        404,
      );
    }

    // Then, check if the portalCategoryId exists in the PortalCategory table
    const portalCategoryExists = await prisma.portalCategory.findUnique({
      where: { id: data.portalCategoryId }, // Assuming `id` is the primary key for the PortalCategory table
    });

    if (!portalCategoryExists) {
      throw new AppError(
        `Portal category with ID ${data.portalCategoryId} does not exist.`,
        "Not found",
        404,
      );
    }

    // Check if the UserPortalCategory combination already exists
    const existingUserPortalCategory =
      await prisma.userPortalCategory.findUnique({
        where: {
          userId_portalCategoryId: {
            userId: data.userId,
            portalCategoryId: data.portalCategoryId,
          },
        },
      });

    if (existingUserPortalCategory) {
      // If the UserPortalCategory exists, update it
      const updatedUserPortalCategory = await prisma.userPortalCategory.update({
        where: {
          userId_portalCategoryId: {
            userId: data.userId,
            portalCategoryId: data.portalCategoryId,
          },
        },
        data: {
          // Update fields here (if any)
          updatedAt: new Date(), // or any other fields you want to update
        },
      });

      return updatedUserPortalCategory; // Return the updated record
    }

    // If the UserPortalCategory does not exist, create a new one
    const userPortalCategory = await prisma.userPortalCategory.create({
      data,
    });

    return userPortalCategory;
  }

  static async getUserPortals(userId: string) {
    const userPortalCategories = await prisma.userPortalCategory.findMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      include: {
        portalCategory: true,
      },
    });

    return userPortalCategories;
  }

  static async getUserRoleData(userId: string, portalCategoryName: string) {
    try {
      const userPortalCategory = await prisma.userPortalCategory.findFirst({
        where: {
          userId: userId,
          portalCategory: {
            name: portalCategoryName,
          },
        },
        include: {
          userPortalCategoryRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!userPortalCategory) {
        return {}; // Return an empty object if no user portal category is found
      }

      // Assuming there's only one role for the user in the given portal category
      const role = userPortalCategory.userPortalCategoryRoles[0]?.role;

      if (!role) {
        return {}; // Return an empty object if no role is found
      }

      // Return the role data as an object
      return {
        roleId: role.id,
        roleName: role.name,
      };
    } catch (error) {
      throw error;
    }
  }

  static async getUserAuditLogs(
    userId: string,
    page: number = 1,
    limit: number = 10,
    search: string = "",
    startDate?: string,
    endDate?: string,
    actionTypes: string[] = [],
  ) {
    const skip = (page - 1) * limit;

    // Building dynamic filters
    const filters: any = {
      OR: [{ userId }, { targetUserId: userId }],
    };

    // Only add actionType filter if actionTypes array is not empty
    if (actionTypes && actionTypes.length > 0) {
      filters.actionType = {
        in: actionTypes,
        mode: "insensitive", // case-insensitive matching
      };
    } else {
      // Exclude records where actionType is null when no filter is provided
      filters.actionType = {
        not: null,
      };
    }

    if (search) {
      filters.user = {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { username: { contains: search, mode: "insensitive" } },
          { facultyUser: { contains: search, mode: "insensitive" } },
          { agentUser: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    if (startDate && endDate) {
      filters.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (startDate) {
      filters.createdAt = { gte: new Date(startDate) };
    } else if (endDate) {
      filters.createdAt = { lte: new Date(endDate) };
    }

    // Fetch audit logs with filters, pagination, and ordering
    const auditLogs = await prisma.auditLog.findMany({
      where: filters,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            username: true,
            facultyUser: true,
            agentUser: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });
    const processedAuditLogs = auditLogs.map((log) => {
      const { user } = log;

      const fallbackUsername =
        user.username || user.facultyUser || user.agentUser || "";

      // Remove original fallback fields if you don’t want them exposed
      const { facultyUser, agentUser, ...restUser } = user;

      return {
        ...log,
        user: {
          ...restUser,
          username: fallbackUsername, // Replace `username` directly!
        },
      };
    });
    console.log("Processed Audit Logs:", processedAuditLogs);

    // Get total count for pagination metadata
    const totalRecords = await prisma.auditLog.count({ where: filters });

    return {
      auditLogs: processedAuditLogs,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
    };
  }
  // static async getUserAuditLogs(
  //   userId: string,
  //   page: number = 1,
  //   limit: number = 10,
  //   search: string = "",
  //   startDate?: string,
  //   endDate?: string
  // ) {
  //   const skip = (page - 1) * limit;

  //   // Building dynamic filters
  //   const filters: any = {
  //     // userId, // Filter by userId
  //     OR: [{ userId }, { targetUserId: userId }],
  //   };

  //   if (search) {
  //     filters.user = {
  //       OR: [
  //         { firstName: { contains: search, mode: "insensitive" } },
  //         { lastName: { contains: search, mode: "insensitive" } },
  //         { username: { contains: search, mode: "insensitive" } },
  //       ],
  //     };
  //   }

  //   if (startDate && endDate) {
  //     filters.createdAt = {
  //       gte: new Date(startDate),
  //       lte: new Date(endDate),
  //     };
  //   } else if (startDate) {
  //     filters.createdAt = { gte: new Date(startDate) };
  //   } else if (endDate) {
  //     filters.createdAt = { lte: new Date(endDate) };
  //   }

  //   // Fetch audit logs with filters, pagination, and ordering
  //   const auditLogs = await prisma.auditLog.findMany({
  //     where: filters,
  //     include: {
  //       user: {
  //         select: {
  //           id: true,
  //           firstName: true,
  //           lastName: true,
  //           email: true,
  //           username: true,
  //         },
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     skip,
  //     take: limit,
  //   });

  //   // Get total count for pagination metadata
  //   const totalRecords = await prisma.auditLog.count({ where: filters });

  //   return {
  //     auditLogs,
  //     totalRecords,
  //     totalPages: Math.ceil(totalRecords / limit),
  //     currentPage: page,
  //   };
  // }
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 10; // Number of salt rounds for bcrypt
    return await bcrypt.hash(password, saltRounds);
  }

  static async assignRole(reqBody: AssignRoleReqBody) {
    const user = await prisma.user.findUnique({
      where: {
        id: reqBody.userId,
      },
    });

    if (!user) {
      throw new AppError("User not found", "Not found", 404);
    }

    if (!("admin" in reqBody) && !("agent" in reqBody)) {
      throw new AppError(
        "Either admin or agent is required",
        "Bad request",
        400,
      );
    }

    const reqBodyWithoutReqId = JSON.parse(
      JSON.stringify({
        ...reqBody,
        userId: undefined,
      }),
    );

    for (const category of Object.entries(reqBodyWithoutReqId)) {
      const parsedCategory = zodSafeParse(
        category,
        z.tuple([
          nonEmptyString,
          z.object({
            roleId: z.string().uuid(),
            roleName: nonEmptyString,
          }),
        ]),
      );

      // console.log(parsedCategory);

      const portalCategoryId = (
        await prisma.portalCategory.findUnique({
          where: {
            name: category[0],
          },
        })
      )?.id;

      if (!portalCategoryId) {
        throw new AppError("Portal category not found", "Not found", 404);
      }

      const role = await prisma.role.findFirst({
        where: {
          name: parsedCategory[1].roleName,
          portalCategoryId: portalCategoryId,
          status: "ACTIVE",
        },
        select: {
          id: true,
          roleModules: {
            select: {
              modulePermission: true,
              module: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!role) {
        throw new AppError("Role not found or archived", "Not found", 404);
      }

      const userPortalCategory = await prisma.userPortalCategory.findFirst({
        where: {
          userId: user.id,
          portalCategoryId,
        },
      });

      if (!userPortalCategory) {
        throw new AppError("User portal category not found", "Not found", 404);
      }

      const sameUserPortalCategoryRole =
        await prisma.userPortalCategoryRole.findFirst({
          where: {
            userPortalCategoryId: userPortalCategory.id,
            roleId: role.id,
          },
        });

      if (sameUserPortalCategoryRole) {
        continue;
      }

      const existingOtherUserPortalCategoryRole =
        await prisma.userPortalCategoryRole.findFirst({
          where: {
            userPortalCategoryId: userPortalCategory.id,
          },
        });

      if (existingOtherUserPortalCategoryRole) {
        const existingOtherUserPortalCategoryRoleModules =
          await prisma.roleModule.findMany({
            where: {
              roleId: existingOtherUserPortalCategoryRole.roleId,
            },
          });

        const existingOtherUserPortalCategoryRoleModuleIds =
          existingOtherUserPortalCategoryRoleModules.map(
            (roleModule) => roleModule.moduleId,
          );

        const deletedUserPortalCategoryModuleIds =
          await prisma.userPortalCategoryModule.deleteMany({
            where: {
              userId: user.id,
              moduleId: {
                in: existingOtherUserPortalCategoryRoleModuleIds,
              },
              permissionType: "ROLE",
            },
          });

        const deletedUserPortalCategoryRole =
          await prisma.userPortalCategoryRole.deleteMany({
            where: {
              id: existingOtherUserPortalCategoryRole.id,
            },
          });
      }

      const newUserPortalCategoryRole =
        await prisma.userPortalCategoryRole.create({
          data: {
            userPortalCategoryId: userPortalCategory.id,
            roleId: role.id,
          },
        });

      const roleModules = role?.roleModules?.map((roleModule) => {
        return {
          id: roleModule.module.id,
          modulePermissions: roleModule.modulePermission,
        };
      });

      if (roleModules && roleModules.length > 0) {
        for (const roleModule of roleModules) {
          await prisma.userPortalCategoryModule.create({
            data: {
              userId: user.id,
              portalCategoryId: portalCategoryId,
              moduleId: roleModule.id,
              permissionType: "ROLE",
              modulePermission: roleModule.modulePermissions as string,
            },
          });
        }
      }
    }
  }

  static async filterUser(
    page: number = 1,
    limit: number = 10,
    moduleFilters?: Array<{ moduleName: string; permission: string[] }>,
    roleFilters?: Array<{ name: string }>,
  ) {
    const skip = (page - 1) * limit;

    // Base filter object
    const filters: any = {};
    // If module filters are provided
    if (moduleFilters?.length) {
      // filters.userPortalCategoryModules = {
      //   some: {
      //     AND: moduleFilters.map((filter) => ({
      //       module: {
      //         name: filter.moduleName,
      //       },
      //       modulePermission: {
      //         path: [],
      //         array_contains: filter.permission,
      //       },
      //     })),
      //   },
      // };

      filters.userPortalCategoryModules = {
        some: {
          OR: moduleFilters.map((filter) => ({
            module: {
              name: filter.moduleName,
            },
            modulePermission: {
              path: [],
              array_contains: filter.permission,
            },
          })),
        },
      };
    }

    if (roleFilters?.length) {
      filters.userPortalCategories = {
        some: {
          userPortalCategoryRoles: {
            some: {
              role: {
                name: {
                  in: roleFilters.map((filter) => filter.name),
                },
              },
            },
          },
        },
      };
    }

    // Query users with filters and pagination
    // const users = await prisma.user.findMany({
    //   where: filters,
    //   include: {
    //     userRoles: {
    //       include: {
    //         role: true,
    //       },
    //     },
    //     userPortalCategoryModules: {
    //       include: {
    //         module: true,
    //       },
    //     },
    //   },
    //   orderBy: {
    //     createdAt: "desc",
    //   },
    //   skip,
    //   take: limit,
    // });
    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        mobile: true,
        username: true,
        firstName: true,
        lastName: true,
        address: true,
        userStatus: true,
        userPortalCategories: {
          where: { status: "ACTIVE" },
          select: {
            portalCategory: {
              select: {
                id: true,
                name: true,
              },
            },
            userPortalCategoryRoles: {
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
        },
      },
      skip,
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    const transformedUsers = users.map((user) => ({
      ...user,
      portalCategories: user.userPortalCategories.map((upc) => ({
        portalCategoryId: upc.portalCategory.id,
        portalCategoryName: upc.portalCategory.name,
        roles: upc.userPortalCategoryRoles.map((roleObj) => ({
          roleId: roleObj.role.id,
          roleName: roleObj.role.name,
        })),
      })),
    }));

    // Count total for pagination
    const totalRecords = await prisma.user.count({ where: filters });

    return {
      users: transformedUsers,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
    };
  }

  static async generateCSV(users: any[]) {
    const header =
      "email,password,firstName,lastName,username,mobile,roleName\n";
    const rows = users.map(
      (user) =>
        `${user.email},${user.password},${user.firstName},${user.lastName},${user.username},${user.mobile},${user.roleName}`,
    );

    const csv = header + rows.join("\n");
    return Readable.from([csv]); // return as stream
  }
  static async userProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        userPortalCategories: {
          where: { status: "ACTIVE" },
          include: {
            portalCategory: true,
            userPortalCategoryRoles: {
              include: {
                role: true,
              },
            },
          },
        },
        userPortalCategoryModules: {
          include: {
            module: true,
            portalCategory: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const structuredProfile = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      username: user.username,
      address: user.address,
      status: user.userStatus,
      passwardChanged: user.passwordChanged,
      emailverified: user.emailVerified,
      // roles: user.userRoles.map((ur) => ({
      //   id: ur.role.id,
      //   name: ur.role.name,
      //   portalCategoryId: ur.role.portalCategoryId,
      // })),
      portals: user.userPortalCategories.map((upc) => ({
        id: upc.portalCategory.id,
        name: upc.portalCategory.name,
        roles: upc.userPortalCategoryRoles.map((upcr) => ({
          id: upcr.role.id,
          name: upcr.role.name,
          permissions: upcr.roleData,
        })),
        modules: user.userPortalCategoryModules
          .filter((upcm) => upcm.portalCategoryId === upc.portalCategoryId)
          .map((upcm) => ({
            id: upcm.module.id,
            name: upcm.module.name,
            permissions: upcm.modulePermission,
          })),
      })),
      // auditLogs: await prisma.auditLog.findMany({
      //   where: { userId },
      //   orderBy: { createdAt: "desc" },
      //   take: 10,
      // }),
      // devices: await prisma.browsersAndDevices.findMany({
      //   where: { userId },
      // }),
    };

    return structuredProfile;
  }

  static async filterTempUser(
    page: number = 1,
    limit: number = 10,
    moduleFilters?: Array<{ moduleName: string; permission: string[] }>,
    roleFilters?: Array<{ name: string }>,
    dateFilters?: {
      startDate?: Date;
      endDate?: Date;
      manualRevocation?: boolean;
    },
    searchTerm?: string, // Add searchTerm parameter
  ) {
    const skip = (page - 1) * limit;
    const today = new Date();

    // Base conditions
    const conditions: any[] = [{ permissionType: "TEMPORARY" }];

    // Handle manual revocation filter
    if (dateFilters?.manualRevocation !== undefined) {
      conditions.push({ manualRevocation: dateFilters.manualRevocation });

      // If explicitly filtering for manual revocation, don't apply active date range
      if (dateFilters.manualRevocation === false) {
        conditions.push(
          { permissionStartDate: { lte: today } },
          { permissionEndDate: { gte: today } },
        );
      }
    } else {
      // Default behavior (show active temporary permissions)
      conditions.push(
        { manualRevocation: false },
        { permissionStartDate: { lte: today } },
        { permissionEndDate: { gte: today } },
      );
    }

    // Custom date ranges
    if (dateFilters?.startDate) {
      conditions.push({ permissionStartDate: { gte: dateFilters.startDate } });
    }
    if (dateFilters?.endDate) {
      conditions.push({ permissionEndDate: { lte: dateFilters.endDate } });
    }

    // Build the complete filter
    const filters: any = {
      userPortalCategoryModules: {
        some: {
          AND: conditions,
        },
      },
    };

    // Add search term filter if provided
    if (searchTerm) {
      filters.OR = [
        { email: { contains: searchTerm, mode: "insensitive" } },
        { firstName: { contains: searchTerm, mode: "insensitive" } },
        { lastName: { contains: searchTerm, mode: "insensitive" } },
        { username: { contains: searchTerm, mode: "insensitive" } },
      ];
    }

    // Module filters
    if (moduleFilters?.length) {
      filters.userPortalCategoryModules.some.AND.push({
        OR: moduleFilters.map((filter) => ({
          module: { name: filter.moduleName },
          modulePermission: { path: [], array_contains: filter.permission },
        })),
      });
    }

    // Role filters
    if (roleFilters?.length) {
      filters.userPortalCategories = {
        some: {
          userPortalCategoryRoles: {
            some: {
              role: {
                name: { in: roleFilters.map((r) => r.name) },
              },
            },
          },
        },
      };
    }

    // Query users
    const users = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        mobile: true,
        username: true,
        firstName: true,
        lastName: true,
        address: true,
        userStatus: true,
        userPortalCategories: {
          where: { status: "ACTIVE" },
          select: {
            portalCategory: {
              select: {
                id: true,
                name: true,
              },
            },
            userPortalCategoryRoles: {
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
        },
        userPortalCategoryModules: {
          where: {
            AND: conditions,
          },
          select: {
            id: true,
            module: {
              select: {
                id: true,
                name: true,
              },
            },
            modulePermission: true,
            permissionStartDate: true,
            permissionEndDate: true,
            portalCategory: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Transform results (same as before)
    const transformedUsers = users.map((user) => ({
      ...user,
      portalCategories: user.userPortalCategories.map((upc) => ({
        portalCategoryId: upc.portalCategory.id,
        portalCategoryName: upc.portalCategory.name,
        roles: upc.userPortalCategoryRoles.map((roleObj) => ({
          roleId: roleObj.role.id,
          roleName: roleObj.role.name,
        })),
      })),
      temporaryPermissions: user.userPortalCategoryModules.map((upcm) => ({
        id: upcm.id,
        moduleId: upcm.module.id,
        moduleName: upcm.module.name,
        permissions: upcm.modulePermission,
        startDate: upcm.permissionStartDate,
        endDate: upcm.permissionEndDate,
        portalCategoryId: upcm.portalCategory.id,
        portalCategoryName: upcm.portalCategory.name,
      })),
    }));

    // Count total records
    const totalRecords = await prisma.user.count({ where: filters });

    return {
      users: transformedUsers,
      totalRecords,
      totalPages: Math.ceil(totalRecords / limit),
      currentPage: page,
    };
  }

  static async filterTempUserData(
    filters: z.infer<typeof FilterTempUserSchema>,
  ) {
    const {
      page,
      limit,
      search,
      startDate,
      endDate,
      roleFilters = [],
      moduleFilters = [],
      manualRevocation,
    } = filters;

    // 🟢 Debug: log incoming filters

    const where: any = {
      userPortalCategoryModules: {
        some: {
          permissionType: "TEMPORARY",
          ...(manualRevocation !== undefined && { manualRevocation }),
          ...(startDate && { permissionStartDate: { gte: startDate } }),
          ...(endDate && { permissionEndDate: { lte: endDate } }),
          ...(moduleFilters.length && {
            module: { name: { in: moduleFilters.map((m) => m.moduleName) } },
            ...(moduleFilters.some((m) => m.permission?.length)
              ? {
                  modulePermission: {
                    array_contains: moduleFilters.flatMap(
                      (m) => m.permission || [],
                    ),
                  },
                }
              : {}),
          }),
        },
      },
      ...(roleFilters.length && {
        userPortalCategories: {
          some: {
            userPortalCategoryRoles: {
              some: { role: { name: { in: roleFilters.map((r) => r.name) } } },
            },
          },
        },
      }),
      ...(search && {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    try {
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            userPortalCategories: {
              include: {
                portalCategory: true,
                userPortalCategoryRoles: { include: { role: true } },
              },
            },
            userPortalCategoryModules: {
              include: { portalCategory: true, module: true },
            },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);
      const totalRecords = total;
      const totalPages = Math.ceil(totalRecords / limit);
      const currentPage = page;
      return {
        totalRecords,
        totalPages,
        currentPage,
        users: users.map((u) => ({
          id: u.id,
          username: u.username,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          role: u.userPortalCategories
            .flatMap((upc) =>
              upc.userPortalCategoryRoles.map((ucr) => ucr.role.name),
            )
            .join(", "),
          portalCategory: u.userPortalCategories
            .map((upc) => upc.portalCategory.name)
            .join(", "),
        })),
      };
    } catch (err: any) {
      console.error("🔥 Prisma error:", JSON.stringify(err, null, 2));
      throw err;
    }
  }
}

export default AuthService;
