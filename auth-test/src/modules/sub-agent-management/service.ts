import bcrypt from "bcryptjs";
import prisma from "../../prismaClient";
import { Prisma, userStatus } from "@prisma/client";
import { SubAgentDataType } from "./schema";
import { AppError } from "../../utils/AppError";

class AuthService {
  static async register(registerData: SubAgentDataType) {
    const {
      email,
      mobile,
      password,
      firstName,
      lastName,
      username,
      address,
      userStatus: status, // Renamed to avoid conflict with Prisma enum
      companyName,
      internalReference,
      reportingTo,
    } = registerData;

    // Check if the user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { agentEmail: { equals: email, mode: "insensitive" } },
          { agentUser: { equals: username, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.agentUser === username) {
        throw new AppError(
          "Username is already registered",
          "USERNAME_TAKEN",
          409,
        );
      }
      if (existingUser.agentEmail === email) {
        throw new AppError("Email is already registered", "EMAIL_TAKEN", 409);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password as string, 10);

    // Fetch the 'Agent' portal category
    const agentPortalCategory = await prisma.portalCategory.findUnique({
      where: { name: "agent" },
    });

    if (!agentPortalCategory) {
      throw new AppError(
        "Agent portal category not found",
        "AGENT_PORTAL_NOT_FOUND",
        404,
      );
    }

    // Fetch the 'Sub-Agent' role
    const subAgentRole = await prisma.role.findFirst({
      where: {
        name: "sub-agent",
        portalCategoryId: agentPortalCategory.id,
      },
    });

    if (!subAgentRole) {
      throw new AppError(
        "Sub-Agent role not found",
        "SUB_AGENT_ROLE_NOT_FOUND",
        404,
      );
    }

    // Create the new user with proper userStatus handling
    const user = await prisma.user.create({
      data: {
        agentEmail: email,
        agentUser: username,
        password: hashedPassword,
        mobile,
        firstName: firstName as string,
        lastName: lastName as string,
        mfaEnabled: false,
        userStatus: status ? (status as userStatus) : "ACTIVE", // Cast to Prisma enum
        address: address || null,
      },
    });

    // Create the UserPortalCategory for the user
    const userPortalCategory = await prisma.userPortalCategory.create({
      data: {
        userId: user.id,
        portalCategoryId: agentPortalCategory.id,
      },
    });

    // Create the UserPortalCategoryRole for the user
    await prisma.userPortalCategoryRole.create({
      data: {
        userPortalCategoryId: userPortalCategory.id,
        roleId: subAgentRole.id,
        roleData: {
          internalReference: internalReference || undefined,
          userStatus: status || undefined,
          companyName: companyName || undefined,
          reportingTo: reportingTo || undefined,
        },
      },
    });

    const roleModules = await prisma.roleModule.findMany({
      where: { roleId: subAgentRole.id },
      include: { module: true },
    });

    for (const roleModule of roleModules) {
      await prisma.userPortalCategoryModule.create({
        data: {
          userId: user.id,
          portalCategoryId: agentPortalCategory.id,
          moduleId: roleModule.moduleId,
          modulePermission:
            roleModule.modulePermission as Prisma.InputJsonValue,
          permissionType: "ROLE",
        },
      });
    }

    // Return the newly created user with their roles
    return prisma.user.findUnique({
      where: { id: user.id },
      include: {
        userPortalCategories: {
          include: {
            userPortalCategoryRoles: {
              include: { role: true },
            },
          },
        },
      },
    });
  }

  static async getUserById(id: string) {
    try {
      // Fetch user details along with roles
      const user = await prisma.user.findUnique({
        where: { id: id },
        include: {
          userPortalCategories: {
            include: {
              userPortalCategoryRoles: {
                include: { role: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new AppError("User not found", "USER_NOT_FOUND", 404);
      }

      // Count total applications associated with this user
      const totalApplications = await prisma.application.count({
        where: {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRole: {
                userPortalCategory: {
                  userId: id,
                },
              },
            },
          },
        },
      });

      // Count total number of subagents
      const totalSubagents = await prisma.user.count({
        where: {
          userPortalCategories: {
            some: {
              userPortalCategoryRoles: {
                some: {
                  role: {
                    name: "sub-agent",
                  },
                },
              },
            },
          },
        },
      });

      return {
        user,
        totalApplications,
        totalSubagents,
      };
    } catch (error) {
      throw new AppError("Failed to fetch user", "USER_FETCH_FAILED", 500);
    }
  }

  static async getAllUsers(
    page: number = 1,
    pageSize: number,
    name: string = "",
    status: string = "",
    agentType: string = "",
    userId: string = "",
  ) {
    try {
      // Fetch the 'agent' portal category
      const agentPortalCategory = await prisma.portalCategory.findUnique({
        where: { name: "agent" },
      });

      if (!agentPortalCategory) {
        throw new AppError(
          "Agent portal category not found",
          "AGENT_PORTAL_CATEGORY_NOT_FOUND",
          404,
        );
      }

      // Fetch the 'sub-agent' role
      const agentRole = await prisma.role.findFirst({
        where: {
          name: "sub-agent",
          portalCategoryId: agentPortalCategory.id,
        },
      });

      if (!agentRole) {
        throw new AppError(
          "Sub-Agent role not found",
          "SUB_AGENT_ROLE_NOT_FOUND",
          404,
        );
      }

      // Build the where clause for Prisma
      const whereClause: any = {
        OR: [
          { firstName: { contains: name, mode: "insensitive" } },
          { lastName: { contains: name, mode: "insensitive" } },
          { agentUser: { contains: name, mode: "insensitive" } },
        ],
        userStatus: status ? (status as userStatus) : undefined,
        userPortalCategories: {
          some: {
            portalCategoryId: agentPortalCategory.id,
            userPortalCategoryRoles: {
              some: {
                roleId: agentRole.id,
                ...(agentType && {
                  roleData: {
                    path: ["agentType"],
                    equals: agentType,
                  },
                }),
                ...(userId && {
                  roleData: {
                    path: ["reportingTo"],
                    equals: userId,
                  },
                }),
              },
            },
          },
        },
      };

      // Fetch agents with pagination and filters
      const agents = await prisma.user.findMany({
        where: whereClause,
        include: {
          userPortalCategories: {
            include: {
              userPortalCategoryRoles: {
                include: { role: true },
              },
            },
          },
          auditLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      // Transform the response
      const formattedAgents = await Promise.all(
        agents.map(async (agent) => {
          const roleData =
            (agent.userPortalCategories[0]?.userPortalCategoryRoles[0]
              ?.roleData as any) || {};
          const auditLog = agent.auditLogs[0];

          const totalApplications = await prisma.application.count({
            where: {
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: {
                      userId: agent.id,
                    },
                  },
                },
              },
            },
          });

          return {
            id: agent.id,
            firstName: agent.firstName,
            lastName: agent.lastName,
            email: agent.agentEmail,
            mobile: agent.mobile,
            username: agent.agentUser,
            userStatus: agent.userStatus,
            mfaEnabled: agent.mfaEnabled,
            address: agent.address,
            internalReference: roleData.internalReference || null,
            reportingTo: roleData.reportingTo || null,
            companyName: roleData.companyName || null,
            aggrementExpiryDate: roleData.aggrementExpiryDate || null,
            potentialPayment: roleData.potentialPayment || null,
            commitionRate: roleData.commitionRate || null,
            note: roleData.note || null,
            endDate: roleData.endDate || null,
            agentType: roleData.agentType || null,
            startDate: roleData.startDate || null,
            agreementStatus: roleData.agreementStatus || null,
            auditLog: auditLog ? auditLog.createdAt : null,
            totalApplications,
          };
        }),
      );

      // Count total users
      const totalUsers = await prisma.user.count({
        where: whereClause,
      });

      return {
        users: formattedAgents,
        pagination: {
          totalUsers,
          totalPages: Math.ceil(totalUsers / pageSize),
          currentPage: page,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch agents: ${(error as Error).message}`);
    }
  }

  static async updateUser(userId: string, updateData: SubAgentDataType) {
    const {
      password,
      email,
      mobile,
      username,
      companyName,
      internalReference,
      reportingTo,
      address,
      userStatus: status,
      ...userData
    } = updateData;

    const updatedData: any = {};

    if (userData.firstName !== undefined)
      updatedData.firstName = userData.firstName;
    if (userData.lastName !== undefined)
      updatedData.lastName = userData.lastName;
    if (email) updatedData.agentEmail = email;
    if (mobile) updatedData.mobile = mobile;
    if (username) updatedData.agentUser = username;
    if (address) updatedData.address = address;
    if (status) updatedData.userStatus = status as userStatus;

    // Check for existing users to prevent duplicates
    if (email) {
      const existingUserByEmail = await prisma.user.findFirst({
        where: {
          agentEmail: { equals: email, mode: "insensitive" },
          id: { not: userId },
        },
      });
      if (existingUserByEmail)
        throw new AppError(
          "Email is already registered by another user",
          "EMAIL_TAKEN",
          409,
        );
    }

    if (username) {
      const existingUserByUsername = await prisma.user.findFirst({
        where: {
          agentUser: { equals: username, mode: "insensitive" },
          id: { not: userId },
        },
      });
      if (existingUserByUsername)
        throw new Error("Username is already registered by another user");
    }

    // Hash the password if provided
    if (password) {
      updatedData.password = await bcrypt.hash(password, 10);
    }

    // Update user details
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updatedData,
    });

    // Fetch the UserPortalCategoryRole associated with the user
    const userPortalCategoryRoles =
      await prisma.userPortalCategoryRole.findMany({
        where: {
          userPortalCategory: {
            userId: userId,
          },
        },
      });

    // Update roleData in UserPortalCategoryRole if relevant fields are provided
    if (
      companyName !== undefined ||
      internalReference !== undefined ||
      reportingTo !== undefined ||
      status !== undefined
    ) {
      for (const userPortalCategoryRole of userPortalCategoryRoles) {
        const existingRoleData = (userPortalCategoryRole.roleData as any) || {};

        const newRoleData = {
          ...existingRoleData,
          ...(internalReference !== undefined && { internalReference }),
          ...(companyName !== undefined && { companyName }),
          ...(reportingTo !== undefined && { reportingTo }),
          ...(status !== undefined && { userStatus: status }),
        };

        await prisma.userPortalCategoryRole.update({
          where: { id: userPortalCategoryRole.id },
          data: {
            roleData: newRoleData,
          },
        });
      }
    }

    // Return updated user with their roles
    return prisma.user.findUnique({
      where: { id: updatedUser.id },
      include: {
        userPortalCategories: {
          include: {
            userPortalCategoryRoles: {
              include: { role: true },
            },
          },
        },
      },
    });
  }

  static async getAgentWiseSubAgents(
    page: number = 1,
    pageSize: number = 10,
    name: string = "",
    status: string = "",
    agentType: string = "",
    userId: string = "",
  ) {
    try {
      // Fetch the 'agent' portal category
      const agentPortalCategory = await prisma.portalCategory.findUnique({
        where: { name: "agent" },
      });

      if (!agentPortalCategory) {
        throw new AppError(
          "Agent portal category not found",
          "AGENT_PORTAL_CATEGORY_NOT_FOUND",
          404,
        );
      }

      // Fetch the 'sub-agent' role
      const agentRole = await prisma.role.findFirst({
        where: {
          name: "sub-agent",
          portalCategoryId: agentPortalCategory.id,
        },
      });

      if (!agentRole) {
        throw new AppError(
          "Sub-Agent role not found",
          "SUB_AGENT_ROLE_NOT_FOUND",
          404,
        );
      }

      // Build the where clause for Prisma
      const whereClause: any = {
        OR: [
          { firstName: { contains: name, mode: "insensitive" } },
          { lastName: { contains: name, mode: "insensitive" } },
          { agentUser: { contains: name, mode: "insensitive" } },
        ],
        userStatus: status ? (status as userStatus) : undefined,
        userPortalCategories: {
          some: {
            portalCategoryId: agentPortalCategory.id,
            userPortalCategoryRoles: {
              some: {
                roleId: agentRole.id,
                ...(agentType && {
                  roleData: {
                    path: ["agentType"],
                    equals: agentType,
                  },
                }),
                ...(userId && {
                  roleData: {
                    path: ["reportingTo"],
                    equals: userId,
                  },
                }),
              },
            },
          },
        },
      };

      // Fetch agents with pagination and filters
      const agents = await prisma.user.findMany({
        where: whereClause,
        include: {
          userPortalCategories: {
            include: {
              userPortalCategoryRoles: {
                include: { role: true },
              },
            },
          },
          auditLogs: {
            take: 1,
            orderBy: { createdAt: "desc" },
            select: { createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
        // skip: (page - 1) * pageSize,
        // take: pageSize,
      });

      // Transform the response
      const formattedAgents = await Promise.all(
        agents.map(async (agent) => {
          const roleData =
            (agent.userPortalCategories[0]?.userPortalCategoryRoles[0]
              ?.roleData as any) || {};
          const auditLog = agent.auditLogs[0];

          const totalApplications = await prisma.application.count({
            where: {
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRole: {
                    userPortalCategory: {
                      userId: agent.id,
                    },
                  },
                },
              },
            },
          });

          return {
            id: agent.id,
            firstName: agent.firstName,
            lastName: agent.lastName,
            email: agent.agentEmail,
            mobile: agent.mobile,
            username: agent.agentUser,
            userStatus: agent.userStatus,
            mfaEnabled: agent.mfaEnabled,
            address: agent.address,
            internalReference: roleData.internalReference || null,
            reportingTo: roleData.reportingTo || null,
            companyName: roleData.companyName || null,
            aggrementExpiryDate: roleData.aggrementExpiryDate || null,
            potentialPayment: roleData.potentialPayment || null,
            commitionRate: roleData.commitionRate || null,
            note: roleData.note || null,
            endDate: roleData.endDate || null,
            agentType: roleData.agentType || null,
            startDate: roleData.startDate || null,
            agreementStatus: roleData.agreementStatus || null,
            auditLog: auditLog ? auditLog.createdAt : null,
            totalApplications,
          };
        }),
      );

      // Count total users
      const totalUsers = await prisma.user.count({
        where: whereClause,
      });

      return {
        formattedAgents,
        // pagination: {
        //   totalUsers,
        //   totalPages: Math.ceil(totalUsers / pageSize),
        //   currentPage: page,
        // },
      };
    } catch (error) {
      throw new Error(`Failed to fetch agents: ${(error as Error).message}`);
    }
  }
}

export default AuthService;
