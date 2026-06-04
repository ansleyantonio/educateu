import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

process.env.JWT_REFRESH_SECRET || "defaultRefreshTokenSecret";

import prisma from "../../../prismaClient";
import { accountStatus, Prisma, userStatus } from "@prisma/client";
import {
  RegisterUserData,
  updateAgreementType,
  updateUserData,
  updateUserSchema,
  UpgradeTemplateInput,
} from "./schema";

// Define templateType if not imported from elsewhere
type templateType = "INTERNAL" | "EXTERNAL";
import e from "express";
import { Console } from "console";
import { report } from "process";
import { sendRegistrationEmail } from "../../communication/mail/mailer";
import { AppError } from "../../../utils/AppError";
import axios from "axios";
import { set } from "zod";
// Helper function to safely extract roleData in both formats
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
  awardingBodyTemplates?: any[]; // Added this property
  set?: { [key: string]: any };
}

class AuthService {
  static async register(registerData: RegisterUserData) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { agentEmail: { equals: registerData.email, mode: "insensitive" } },
          { agentUser: { equals: registerData.username, mode: "insensitive" } },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.agentUser === registerData.username) {
        throw new AppError(
          "Username is already registered",
          "USERNAME_TAKEN",
          409,
        );
      }
      if (existingUser.agentEmail === registerData.email) {
        throw new AppError("Email is already registered", "EMAIL_TAKEN", 409);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(registerData.password, 10);

    const agentPortalCategory = await prisma.portalCategory.findUnique({
      where: { name: "agent" },
    });

    if (!agentPortalCategory) {
      throw new AppError("Agent portal category not found", "NOT_FOUND", 404);
    }

    // Fetch the 'Sub-Agent' role
    const agentRole = await prisma.role.findFirst({
      where: {
        name: "agent",
        portalCategoryId: agentPortalCategory.id,
      },
    });

    if (!agentRole) {
      throw new AppError("Agent role not found", "NOT_FOUND", 404);
    }

    if (registerData.agentType) {
      const normalizedAgentType =
        registerData.agentType.toUpperCase() as templateType;

      // Create the new user
      const user = await prisma.user.create({
        data: {
          agentEmail: registerData.email,
          agentUser: registerData.username,
          password: hashedPassword,
          mobile: registerData.mobile || "",
          firstName: registerData.firstName,
          lastName: registerData.lastName,
          address: registerData.address || null,
          userStatus: "ACTIVE",
        },
      });

      const userPortalCategory = await prisma.userPortalCategory.create({
        data: {
          userId: user.id,
          portalCategoryId: agentPortalCategory.id,
        },
      });

      // Initialize awardingBodyTemplates as an empty array or from registerData if available
      const awardingBodyTemplates = registerData.awardingBodyTemplates || [];

      const roleData: any = {
        potentialPayment: registerData.potentialPayment || null,
        commissionGroupId: registerData.commissionGroupId || null,
        commitionRate: registerData.commitionRate || null,
        companyName: registerData.companyName || null,
        aggrementExpiryDate: registerData.aggrementExpiryDate || null,
        agentType: registerData.agentType || null,
        commissionTemplate: registerData.commissionTemplate || null,
        startDate: registerData.startDate || null,
        endDate: registerData.endDate || null,
        note: registerData.note || null,
        agreementStatus: registerData.agreementStatus || true,
        userStatus: registerData.userStatus || "ACTIVE",
        awardingBodyTemplates: awardingBodyTemplates,
      };

      await prisma.userPortalCategoryRole.create({
        data: {
          userPortalCategoryId: userPortalCategory.id,
          roleId: agentRole.id,
          roleData: roleData,
        },
      });

      const roleModules = await prisma.roleModule.findMany({
        where: { roleId: agentRole.id },
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
  }

  static async getUserById(id: string) {
    const agentPortalCategory = await prisma.portalCategory.findUnique({
      where: { name: "agent" },
    });

    if (!agentPortalCategory)
      throw new AppError("Agent portal category not found", "NOT_FOUND", 404);

    const agentRole = await prisma.role.findFirst({
      where: {
        name: "agent",
        portalCategoryId: agentPortalCategory.id,
      },
    });

    if (!agentRole)
      throw new AppError("Agent role not found", "NOT_FOUND", 404);

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
        auditLogs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
          },
        },
      },
    });

    if (!user) throw new AppError("User not found", "NOT_FOUND", 404);

    // Use the helper function to extract roleData
    const rawRoleData =
      user.userPortalCategories[0]?.userPortalCategoryRoles[0]?.roleData;
    const roleData = extractRoleData(rawRoleData);
    const auditLog = user.auditLogs[0];

    // Get the reportingTo user name if reportingTo exists
    let agentName = null;
    if (roleData.reportingTo) {
      const reportingToUser = await prisma.user.findUnique({
        where: { id: roleData.reportingTo },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      if (reportingToUser) {
        agentName = `${reportingToUser.firstName} ${reportingToUser.lastName}`;
      }
    }

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

    let commissionRate = "0%";
    let commissionDetails = null;
    let matchedTier = null;
    let commissionGroupName = null;
    const applicationCreateStatus = await prisma.variable.findUnique({
      where: { name: "newapplication" },
      select: { value: true },
    });

    // Use commissionGroupId instead of commissionTemplate
    if (roleData.commissionGroupId) {
      const commissionGroup = await prisma.commissionGroup.findUnique({
        where: { id: roleData.commissionGroupId },
        include: { commissions: true },
      });

      if (commissionGroup) {
        commissionGroupName = commissionGroup.name;

        if (commissionGroup.commissions?.length) {
          commissionDetails = commissionGroup.commissions;

          // Sort tiers by studentRangeLower (ascending)
          const sortedTiers = [...commissionGroup.commissions].sort(
            (a, b) => a.studentRangeLower - b.studentRangeLower,
          );

          // Find the matching tier based on application count
          matchedTier = sortedTiers.find(
            (tier) =>
              totalApplications >= tier.studentRangeLower &&
              (tier.studentRangeUpper === null ||
                totalApplications <= tier.studentRangeUpper),
          );

          // If no tier matched (count=0 or above all ranges), use the first tier
          if (!matchedTier && sortedTiers.length > 0) {
            matchedTier = sortedTiers[0];
          }

          if (matchedTier) {
            // Format the rate as percentage (e.g., "5%" for rate=5)
            commissionRate =
              matchedTier.firstRate !== null
                ? `${matchedTier.firstRate}%`
                : "0%";
          }
        }
      }
    }

    // Extract awardingBodyTemplates from roleData and enrich with additional data
    const awardingBodyTemplates = roleData.awardingBodyTemplates || [];

    // Enrich awardingBodyTemplates with awarding body name and commission range details
    const enrichedAwardingBodyTemplates = await Promise.all(
      awardingBodyTemplates.map(async (template: any) => {
        try {
          // Fetch awarding body details
          const awardingBody = await prisma.awardingBody.findUnique({
            where: { id: template.awardingBodyId },
            select: { name: true },
          });

          // Fetch commission template details including commission group and range
          const commissionTemplate = await prisma.agreementTemplate.findUnique({
            where: { id: template.commissionTemplateId },
            include: {
              commissionGroup: {
                include: {
                  commissions: {
                    orderBy: { studentRangeLower: "asc" },
                  },
                },
              },
              awardingBody: {
                select: { name: true },
              },
            },
          });
          let versionAvailable = false;
          if (commissionTemplate?.matchId) {
            const latestTemplate = await prisma.agreementTemplate.findFirst({
              where: { matchId: commissionTemplate.matchId },
              orderBy: { versions: "desc" },
              select: { versions: true },
            });

            if (
              latestTemplate &&
              commissionTemplate.versions &&
              latestTemplate.versions !== null &&
              latestTemplate.versions > commissionTemplate.versions
            ) {
              versionAvailable = true;
            }
          }

          // Find the matching commission range based on totalApplications
          let matchedCommissionRange = null;
          let currentCommissionRate = "0%";

          if (commissionTemplate?.commissionGroup?.commissions) {
            const commissions = commissionTemplate.commissionGroup.commissions;

            // Find the commission range that matches the totalApplications count
            matchedCommissionRange = commissions.find(
              (commission) =>
                totalApplications >= commission.studentRangeLower &&
                (commission.studentRangeUpper === null ||
                  totalApplications <= commission.studentRangeUpper),
            );

            // If no range matched, use the first range
            if (!matchedCommissionRange && commissions.length > 0) {
              matchedCommissionRange = commissions[0];
            }

            if (matchedCommissionRange) {
              currentCommissionRate =
                matchedCommissionRange.firstRate !== null
                  ? `${matchedCommissionRange.firstRate}%`
                  : "0%";
            }
          }

          return {
            awardingBodyId: template.awardingBodyId,
            awardingBodyName: awardingBody?.name || "Unknown",
            commissionTemplateId: template.commissionTemplateId,
            commissionTemplateName: commissionTemplate?.name || "Unknown",
            commissionTemplateVersion: commissionTemplate?.versions || "1",
            matchId: commissionTemplate?.matchId || null,
            currentCommissionRate: currentCommissionRate,
            status: template.status || "ACTIVE",
            totalApplications: totalApplications,
            versionAvailable,
            commissionRange: matchedCommissionRange
              ? {
                  studentRangeLower: matchedCommissionRange.studentRangeLower,
                  studentRangeUpper: matchedCommissionRange.studentRangeUpper,
                  firstRate: matchedCommissionRange.firstRate,
                  secondRate: matchedCommissionRange.secondRate,
                  thirdRate: matchedCommissionRange.thirdRate,
                  fourthRate: matchedCommissionRange.fourthRate,
                }
              : null,
          };
        } catch (error) {
          return {
            ...template,
            awardingBodyName: "Error loading",
            commissionTemplateName: "Error loading",
            currentCommissionRate: "0%",
            totalApplications: totalApplications,
            commissionRange: null,
          };
        }
      }),
    );

    let overallCommissionRate = "0%";
    if (enrichedAwardingBodyTemplates.length > 0) {
      overallCommissionRate =
        enrichedAwardingBodyTemplates[0].currentCommissionRate;
    }

    const formattedUser = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.agentEmail,
      mobile: user.mobile,
      username: user.agentUser,
      address: user.address,
      userStatus: user.userStatus,
      companyName: roleData.companyName || null,
      aggrementExpiryDate: roleData.aggrementExpiryDate || null,
      potentialPayment: roleData.potentialPayment || "0%",
      commissionRate: overallCommissionRate, // Use the rate from awarding body templates
      note: roleData.note || null,
      endDate: roleData.endDate || null,
      agentType: roleData.agentType || null,
      startDate: roleData.startDate || null,
      agreementStatus: roleData.agreementStatus ?? null,
      agreementTemplateId: roleData.agreementTemplateId || null,
      commissionTemplate: roleData.commissionGroupId || null,
      commissionGroupName: commissionGroupName || null,
      commissionDetails: matchedTier || null,
      reportingTo: roleData.reportingTo || null,
      agentName: agentName || null,
      auditLog: auditLog ? auditLog.createdAt : null,
      activityStatus: roleData.userStatus || null,
      applicationCreateStatus: applicationCreateStatus?.value || null,
      portalName: agentPortalCategory.name,
      awardingBodyTemplates: enrichedAwardingBodyTemplates,
      totalApplications: totalApplications,
    };

    const totalSubagents = await prisma.user.count({
      where: {
        userPortalCategories: {
          some: {
            userPortalCategoryRoles: {
              some: {
                roleData: {
                  path: ["reportingTo"],
                  equals: id,
                },
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
      user: formattedUser,
      totalApplications,
      totalSubagents,
    };
  }
  static async getAllUsers(
    page: number = 1,
    pageSize: number,
    name: string = "",
    status: string = "",
    agentType: string = "",
  ) {
    try {
      const agentPortalCategory = await prisma.portalCategory.findUnique({
        where: { name: "agent" },
      });

      if (!agentPortalCategory) {
        throw new Error("Agent portal category not found");
      }

      const agentRole = await prisma.role.findFirst({
        where: {
          name: "agent",
          portalCategoryId: agentPortalCategory.id,
        },
      });

      if (!agentRole) {
        throw new AppError("Agent role not found", "NOT_FOUND", 404);
      }

      const whereConditions: any = {
        userStatus: (status as userStatus) || "ACTIVE",
        OR: [
          { firstName: { contains: name, mode: "insensitive" } },
          { lastName: { contains: name, mode: "insensitive" } },
          // { username: { contains: name, mode: "insensitive" } },
          { agentEmail: { contains: name, mode: "insensitive" } },
          { agentUser: { contains: name, mode: "insensitive" } },
        ],
        userPortalCategories: {
          some: {
            portalCategoryId: agentPortalCategory.id,
            userPortalCategoryRoles: {
              some: {
                roleId: agentRole.id,
                ...(status
                  ? { roleData: { path: ["userStatus"], equals: status } }
                  : {}),
                ...(agentType
                  ? { roleData: { path: ["agentType"], equals: agentType } }
                  : {}),
              },
            },
          },
        },
      };

      // Fetch with pagination applied in Prisma
      const [agents, totalAgents] = await Promise.all([
        prisma.user.findMany({
          where: whereConditions,
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
        }),
        prisma.user.count({ where: whereConditions }),
      ]);

      const formattedAgents = agents.map((agent) => {
        const rawRoleData =
          agent.userPortalCategories[0]?.userPortalCategoryRoles[0]?.roleData;
        const roleData = extractRoleData(rawRoleData);
        const auditLog = agent.auditLogs[0];

        return {
          id: agent.id,
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.agentEmail,
          mobile: agent.mobile,
          username: agent.agentUser,
          mfaEnabled: agent.mfaEnabled,
          userStatus: agent.userStatus,
          activityStatus: roleData.userStatus || null,
          address: agent.address || null,
          photo: agent.photo || null,
          internalReference: roleData.internalReference || null,
          companyName: roleData.companyName || null,
          aggrementExpiryDate: roleData.aggrementExpiryDate || null,
          potentialPayment: roleData.potentialPayment || null,
          commitionRate: roleData.commitionRate || null,
          note: roleData.note || null,
          endDate: roleData.endDate || null,
          agentType: roleData.agentType || null,
          commissionTemplate: roleData.commissionTemplate || null,
          commissionGroupId: roleData.commissionGroupId || null,
          startDate: roleData.startDate || null,
          agreementStatus: roleData.agreementStatus ?? null,
          auditLog: auditLog ? auditLog.createdAt : null,
          roasterId:
            agent.userPortalCategories[0]?.userPortalCategoryRoles[0]?.id || "",
        };
      });

      return {
        agents: formattedAgents,
        pagination: {
          totalAgents,
          totalPages: Math.ceil(totalAgents / pageSize),
          currentPage: page,
        },
      };
    } catch (error) {
      throw new Error(`Failed to fetch agents: ${(error as Error).message}`);
    }
  }

  static async updateUser(userId: string, updateData: updateUserData) {
    try {
      const updatedData: Prisma.UserUpdateInput = {};

      // Update base user fields directly from updateData
      if (updateData.firstName !== undefined)
        updatedData.firstName = updateData.firstName;
      if (updateData.lastName !== undefined)
        updatedData.lastName = updateData.lastName;
      if (updateData.email !== undefined)
        updatedData.agentEmail = updateData.email;
      if (updateData.mobile !== undefined)
        updatedData.mobile = updateData.mobile;
      if (updateData.username !== undefined)
        updatedData.agentUser = updateData.username;
      if (updateData.address !== undefined)
        updatedData.address = updateData.address;

      if (updateData.photo !== undefined) {
        updatedData.photo = JSON.stringify(updateData.photo);
      }
      if (updateData.userStatus !== undefined) {
        updatedData.userStatus = updateData.userStatus;
      }

      if (updateData.password !== undefined) {
        updatedData.password = await bcrypt.hash(updateData.password, 10);
      }

      // Check for uniqueness conflicts on email/mobile/username (exclude current user)
      if (updateData.email) {
        const existingEmail = await prisma.user.findFirst({
          where: {
            agentEmail: { equals: updateData.email, mode: "insensitive" },
            id: { not: userId },
          },
        });
        if (existingEmail) {
          throw new AppError(
            "Email is already registered by another user",
            "CONFLICT",
            409,
          );
        }
      }

      if (updateData.username) {
        const existingUsername = await prisma.user.findFirst({
          where: {
            agentUser: { equals: updateData.username, mode: "insensitive" },
            id: { not: userId },
          },
        });
        if (existingUsername) {
          throw new AppError(
            "Username is already registered by another user",
            "CONFLICT",
            409,
          );
        }
      }

      // Update user base data
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updatedData,
      });

      // Now handle userPortalCategory roles update, if relevant fields provided
      const userPortalCategory = await prisma.userPortalCategory.findFirst({
        where: { userId },
        include: {
          userPortalCategoryRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!userPortalCategory) {
        throw new AppError(
          "UserPortalCategory not found for the user",
          "NOT_FOUND",
          404,
        );
      }

      const currentRoleData =
        userPortalCategory.userPortalCategoryRoles[0]?.roleData || {};
      const existingData =
        typeof currentRoleData === "object" && "set" in currentRoleData
          ? (currentRoleData as { set: any }).set
          : currentRoleData;

      const updatedRoleData = {
        ...existingData,
        ...(updateData.companyName !== undefined && {
          companyName: updateData.companyName,
        }),
        ...(updateData.aggrementExpiryDate !== undefined && {
          aggrementExpiryDate: updateData.aggrementExpiryDate,
        }),
        ...(updateData.potentialPayment !== undefined && {
          potentialPayment: updateData.potentialPayment,
        }),
        ...(updateData.commissionGroupId !== undefined && {
          commissionGroupId: updateData.commissionGroupId,
        }),
        ...(updateData.commitionRate !== undefined && {
          commitionRate: updateData.commitionRate,
        }),
        ...(updateData.note !== undefined && { note: updateData.note }),
        ...(updateData.endDate !== undefined && {
          endDate: updateData.endDate,
        }),
        ...(updateData.agentType !== undefined && {
          agentType: updateData.agentType,
        }),
        ...(updateData.startDate !== undefined && {
          startDate: updateData.startDate,
        }),
        ...(updateData.activityStatus !== undefined && {
          userStatus: updateData.activityStatus,
        }),
        ...(updateData.agreementStatus !== undefined && {
          agreementStatus: updateData.agreementStatus,
        }),
        ...(updateData.awardingBodyTemplates !== undefined && {
          awardingBodyTemplates: updateData.awardingBodyTemplates,
        }),
      };

      // Update role data for userPortalCategoryRoles
      await prisma.userPortalCategoryRole.updateMany({
        where: { userPortalCategoryId: userPortalCategory.id },
        data: {
          roleData: updatedRoleData,
        },
      });

      // Return user with relations (optional)
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
    } catch (error) {
      throw error;
    }
  }

  static async deleteUser(userId: string) {
    try {
      await prisma.auditLog.deleteMany({ where: { userId } });
      await prisma.userRole.deleteMany({ where: { userId } });
      await prisma.userPortalCategory.deleteMany({ where: { userId } });
      await prisma.userPortalCategoryModule.deleteMany({ where: { userId } });

      await prisma.user.delete({
        where: { id: userId },
      });

      return { message: "User and all related records deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete user: ${(error as Error).message}`);
    }
  }

  static async getPendingAgents(
    page: number = 1,
    pageSize: number = 10,
    name: string = "",
  ) {
    try {
      // Fetch the 'agent' portal category
      const agentPortalCategory = await prisma.portalCategory.findUnique({
        where: { name: "agent" },
      });

      if (!agentPortalCategory) {
        throw new Error("Agent portal category not found");
      }

      // Fetch the 'agent' role
      const agentRole = await prisma.role.findFirst({
        where: {
          name: "agent",
          portalCategoryId: agentPortalCategory.id,
        },
      });

      if (!agentRole) {
        throw new AppError("Agent role not found", "NOT_FOUND", 404);
      }

      // Fetch pending agents with pagination and filters
      const pendingAgents = await prisma.user.findMany({
        where: {
          OR: [
            {
              firstName: {
                contains: name,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: name,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: name,
                mode: "insensitive",
              },
            },
          ],
          userStatus: "PENDING", // Filter by PENDING status
          userPortalCategories: {
            some: {
              portalCategoryId: agentPortalCategory.id, // Filter by agent portal category
              userPortalCategoryRoles: {
                some: {
                  roleId: agentRole.id, // Filter by agent role
                },
              },
            },
          },
        },
        include: {
          userPortalCategories: {
            include: {
              userPortalCategoryRoles: {
                include: { role: true }, // Include role details
              },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      });

      // Transform the response to include the required fields
      const formattedPendingAgents = pendingAgents.map((agent) => {
        // Extract roleData from userPortalCategoryRoles
        const roleData =
          (agent.userPortalCategories[0]?.userPortalCategoryRoles[0]
            ?.roleData as RoleData) || {};

        return {
          id: agent.id,
          firstName: agent.firstName,
          lastName: agent.lastName,
          email: agent.agentEmail,
          mobile: agent.mobile,
          username: agent.agentUser,
          address: agent.address,
          userStatus: agent.userStatus,
          activityStatus: roleData.userStatus || "null",
          emailVerified: agent.emailVerified,
          internalReference: roleData.internalReference || null,
          companyName: roleData.companyName || null,
          aggrementExpiryDate: roleData.aggrementExpiryDate || null,
          potentialPayment: roleData.potentialPayment || null,
          commitionRate: roleData.commitionRate || null,
          note: roleData.note || null,
          endDate: roleData.endDate || null,
          agentType: roleData.agentType || null,
          startDate: roleData.startDate || null,
          agreementStatus: roleData.agreementStatus || null,
        };
      });

      // Count total number of pending agents matching the filters
      const totalPendingAgents = await prisma.user.count({
        where: {
          OR: [
            {
              firstName: {
                contains: name,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: name,
                mode: "insensitive",
              },
            },
            {
              username: {
                contains: name,
                mode: "insensitive",
              },
            },
          ],
          userStatus: "PENDING", // Filter by PENDING status
          userPortalCategories: {
            some: {
              portalCategoryId: agentPortalCategory.id, // Filter by agent portal category
              userPortalCategoryRoles: {
                some: {
                  roleId: agentRole.id, // Filter by agent role
                },
              },
            },
          },
        },
      });

      return {
        pendingAgents: formattedPendingAgents,
        pagination: {
          totalPendingAgents,
          totalPages: Math.ceil(totalPendingAgents / pageSize),
          currentPage: page,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to fetch pending agents: ${(error as Error).message}`,
      );
    }
  }

  static async getUsersWithNullCommissionRate(
    page: number,
    pageSize: number,
    name: string,
    agentType?: string,
  ) {
    const skip = (page - 1) * pageSize;

    try {
      // First, find the agent portal category and role
      const agentPortalCategory = await prisma.portalCategory.findUnique({
        where: { name: "agent" },
      });

      if (!agentPortalCategory) {
        throw new Error("Agent portal category not found");
      }

      const agentRole = await prisma.role.findFirst({
        where: {
          name: "agent",
          portalCategoryId: agentPortalCategory.id,
        },
      });

      if (!agentRole) {
        throw new AppError("Agent role not found", "NOT_FOUND", 404);
      }

      // Build the base where clause
      const where: Prisma.UserWhereInput = {
        userPortalCategories: {
          some: {
            portalCategoryId: agentPortalCategory.id,
            userPortalCategoryRoles: {
              some: {
                roleId: agentRole.id,
                OR: [
                  // Check for null commissionGroupId
                  { roleData: { equals: Prisma.JsonNull } },
                  // {
                  //   roleData: {
                  //     path: ["commissionGroupId"],
                  //     equals: Prisma.DbNull,
                  //   },
                  // },
                  // {
                  //   roleData: {
                  //     path: ["set", "commissionGroupId"],
                  //     equals: Prisma.DbNull,
                  //   },
                  // },
                  // Check for missing commissionGroupId
                  {
                    NOT: {
                      roleData: {
                        path: ["commissionGroupId"],
                        not: Prisma.JsonNull,
                      },
                    },
                  },
                  {
                    NOT: {
                      roleData: {
                        path: ["set", "commissionGroupId"],
                        not: Prisma.JsonNull,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      };

      // Add agentType filter if provided (case-insensitive)
      if (agentType) {
        // Create all possible case variations
        const agentTypeVariations = [
          agentType.toLowerCase(), // "internal"/"external"
          agentType.toUpperCase(), // "INTERNAL"/"EXTERNAL"
          agentType.charAt(0).toUpperCase() + agentType.slice(1).toLowerCase(), // "Internal"/"External"
        ];

        // Remove duplicates
        const uniqueVariations = [...new Set(agentTypeVariations)];

        const agentTypeCondition: Prisma.UserPortalCategoryRoleWhereInput = {
          OR: uniqueVariations.flatMap((variation) => [
            { roleData: { path: ["agentType"], equals: variation } },
            { roleData: { path: ["set", "agentType"], equals: variation } },
          ]),
        };

        // Safely add the AND condition
        if (where.userPortalCategories?.some?.userPortalCategoryRoles?.some) {
          where.userPortalCategories.some.userPortalCategoryRoles.some.AND = [
            agentTypeCondition,
          ];
        }
      }

      // Add name filter if provided

      if (name) {
        where.OR = [
          { firstName: { contains: name, mode: "insensitive" } },
          { lastName: { contains: name, mode: "insensitive" } },
          { agentEmail: { contains: name, mode: "insensitive" } },
          { agentUser: { contains: name, mode: "insensitive" } },
        ];
      }

      const users = await prisma.user.findMany({
        where,
        skip,
        take: pageSize,
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

      return users;
    } catch (error) {
      throw new Error(
        "Error fetching users with roles: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }
  static async updateAgreement(data: updateAgreementType) {
    try {
      // Step 1: Fetch the user with roles and roleData
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
        include: {
          userPortalCategories: {
            include: {
              userPortalCategoryRoles: true, // we just need roleData here
            },
          },
        },
      });

      if (!user) {
        throw new Error("User not found");
      }

      let isUpdated = false;

      // Step 2: Iterate over userPortalCategoryRoles and update JSON
      for (const category of user.userPortalCategories) {
        for (const role of category.userPortalCategoryRoles) {
          if (!role.roleData) continue;

          let roleData = role.roleData as any;

          if (Array.isArray(roleData.awardingBodyTemplates)) {
            const updatedTemplates = roleData.awardingBodyTemplates.map(
              (template: any) => {
                if (template.commissionTemplateId === data.agreementId) {
                  isUpdated = true;
                  return {
                    ...template,
                    status: data.status, // update status
                  };
                }
                return template;
              },
            );

            // Step 3: Save updated roleData if modified
            if (isUpdated) {
              await prisma.userPortalCategoryRole.update({
                where: { id: role.id },
                data: {
                  roleData: {
                    ...roleData,
                    awardingBodyTemplates: updatedTemplates,
                  },
                },
              });
            }
          }
        }
      }

      if (!isUpdated) {
        throw new Error("Agreement not found in user roleData");
      }

      return { success: true };
    } catch (error) {
      throw new Error(
        "Error updating user agreement: " +
          (error instanceof Error ? error.message : "Unknown error"),
      );
    }
  }

  static async upgradeTemplateVersion(body: UpgradeTemplateInput) {
    const { userId, commissionTemplateId, matchId } = body;

    if (!commissionTemplateId && !matchId) {
      throw new AppError(
        "Provide either commissionTemplateId or matchId",
        "BAD_REQUEST",
        400,
      );
    }

    // Get the user's role with roleData
    const userRole = await prisma.userPortalCategoryRole.findFirst({
      where: {
        userPortalCategory: {
          userId,
        },
      },
      select: { id: true, roleData: true },
    });

    if (!userRole || !userRole.roleData) {
      throw new AppError("Role data not found for this user", "NOT_FOUND", 404);
    }

    let roleData = userRole.roleData as any;

    // Find template in awardingBodyTemplates[]
    const templateIndex = roleData.awardingBodyTemplates?.findIndex(
      (t: any) => {
        // First, try to find by commissionTemplateId if provided
        if (
          commissionTemplateId &&
          t.commissionTemplateId === commissionTemplateId
        ) {
          return true;
        }
        // If matchId is provided, check if template has matchId and it matches
        if (matchId && t.matchId === matchId) {
          return true;
        }
        // If only matchId is provided but template doesn't have matchId field,
        // we need to fetch the template from DB to get its matchId
        if (matchId && !t.matchId && t.commissionTemplateId) {
          // We'll handle this case separately
          return false;
        }
        return false;
      },
    );

    // If template not found by direct match and we have matchId, try to find via DB lookup
    let userTemplate = null;
    let resolvedTemplateIndex = templateIndex;

    if (templateIndex === -1 && matchId) {
      // Find all templates that have commissionTemplateId and check their matchId in DB
      for (let i = 0; i < roleData.awardingBodyTemplates.length; i++) {
        const template = roleData.awardingBodyTemplates[i];
        if (template.commissionTemplateId) {
          // Check if this template has the matching matchId in database
          const dbTemplate = await prisma.agreementTemplate.findUnique({
            where: { id: template.commissionTemplateId },
            select: { matchId: true },
          });

          if (dbTemplate?.matchId === matchId) {
            userTemplate = template;
            resolvedTemplateIndex = i;
            break;
          }
        }
      }
    } else if (templateIndex !== -1) {
      userTemplate = roleData.awardingBodyTemplates[templateIndex];
    }

    if (resolvedTemplateIndex === -1 || resolvedTemplateIndex === undefined) {
      throw new AppError("Template not found in roleData", "NOT_FOUND", 404);
    }

    // Get the current template ID for DB lookup
    const currentTemplateId = userTemplate.commissionTemplateId;

    // Get the latest template version from DB using matchId from the found template
    const currentTemplate = await prisma.agreementTemplate.findUnique({
      where: { id: currentTemplateId },
      select: { matchId: true, versions: true },
    });

    if (!currentTemplate?.matchId) {
      throw new AppError("Template matchId not found", "NOT_FOUND", 404);
    }

    // Get the latest template with the same matchId
    const latestTemplate = await prisma.agreementTemplate.findFirst({
      where: {
        matchId: currentTemplate.matchId,
      },
      orderBy: { versions: "desc" },
      select: {
        id: true,
        versions: true,
        name: true,
        matchId: true,
      },
    });

    if (!latestTemplate) {
      throw new AppError(
        "Latest commission template not found",
        "NOT_FOUND",
        404,
      );
    }

    if (latestTemplate.versions == null) {
      throw new AppError(
        "Commission template version not found",
        "NOT_FOUND",
        404,
      );
    }

    // Check if already on latest version
    const currentVersion = userTemplate.commissionTemplateVersion || 1;
    if (latestTemplate.versions <= currentVersion) {
      return {
        upgraded: false,
        message: "Already on latest version",
        currentVersion: currentVersion,
        latestVersion: latestTemplate.versions,
      };
    }

    // Update the template in roleData
    roleData.awardingBodyTemplates[resolvedTemplateIndex] = {
      ...roleData.awardingBodyTemplates[resolvedTemplateIndex],
      commissionTemplateId: latestTemplate.id,
      commissionTemplateVersion: latestTemplate.versions,
      matchId: latestTemplate.matchId, // Add matchId for future searches
    };

    // Save updated roleData to DB
    await prisma.userPortalCategoryRole.update({
      where: { id: userRole.id },
      data: { roleData },
    });

    return {
      upgraded: true,
      message: "Template upgraded successfully",
      previousVersion: currentVersion,
      newVersion: latestTemplate.versions,
      newTemplateId: latestTemplate.id,
      templateName: latestTemplate.name,
      matchId: latestTemplate.matchId,
    };
  }

  static async getAwardingBodyTemplates(
    userId: string,
    page: number,
    limit: number,
    search: string,
  ) {
    const agentPortalCategory = await prisma.portalCategory.findUnique({
      where: { name: "agent" },
    });

    if (!agentPortalCategory)
      throw new AppError("Agent portal category not found", "NOT_FOUND", 404);

    const agentRole = await prisma.role.findFirst({
      where: {
        name: "agent",
        portalCategoryId: agentPortalCategory.id,
      },
    });

    if (!agentRole)
      throw new AppError("Agent role not found", "NOT_FOUND", 404);

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) throw new AppError("User not found", "NOT_FOUND", 404);

    const rawRoleData =
      user.userPortalCategories[0]?.userPortalCategoryRoles[0]?.roleData;
    const roleData = extractRoleData(rawRoleData);

    const totalApplications = await prisma.application.count({
      where: {
        userPortalCategoryRoleApplications: {
          some: {
            userPortalCategoryRole: {
              userPortalCategory: {
                userId: userId,
              },
            },
          },
        },
      },
    });

    let commissionRate = "0%";
    let commissionDetails = null;
    let matchedTier = null;
    let commissionGroupName = null;

    if (roleData.commissionGroupId) {
      const commissionGroup = await prisma.commissionGroup.findUnique({
        where: { id: roleData.commissionGroupId },
        include: { commissions: true },
      });

      if (commissionGroup) {
        commissionGroupName = commissionGroup.name;

        if (commissionGroup.commissions?.length) {
          commissionDetails = commissionGroup.commissions;

          const sortedTiers = [...commissionGroup.commissions].sort(
            (a, b) => a.studentRangeLower - b.studentRangeLower,
          );

          // Find the matching tier based on application count
          matchedTier = sortedTiers.find(
            (tier) =>
              totalApplications >= tier.studentRangeLower &&
              (tier.studentRangeUpper === null ||
                totalApplications <= tier.studentRangeUpper),
          );

          if (!matchedTier && sortedTiers.length > 0) {
            matchedTier = sortedTiers[0];
          }

          if (matchedTier) {
            commissionRate =
              matchedTier.firstRate !== null
                ? `${matchedTier.firstRate}%`
                : "0%";
          }
        }
      }
    }

    const awardingBodyTemplates = roleData.awardingBodyTemplates || [];

    const enrichedAwardingBodyTemplates = await Promise.all(
      awardingBodyTemplates.map(async (template: any) => {
        try {
          // Fetch awarding body details
          const awardingBody = await prisma.awardingBody.findUnique({
            where: { id: template.awardingBodyId },
            select: { name: true },
          });

          // Fetch commission template details including commission group and range
          const commissionTemplate = await prisma.agreementTemplate.findUnique({
            where: { id: template.commissionTemplateId },
            include: {
              commissionGroup: {
                include: {
                  commissions: {
                    orderBy: { studentRangeLower: "asc" },
                  },
                },
              },
              awardingBody: {
                select: { name: true },
              },
            },
          });
          let versionAvailable = false;
          if (commissionTemplate?.matchId) {
            const latestTemplate = await prisma.agreementTemplate.findFirst({
              where: { matchId: commissionTemplate.matchId },
              orderBy: { versions: "desc" },
              select: { versions: true },
            });

            if (
              latestTemplate &&
              commissionTemplate.versions &&
              latestTemplate.versions !== null &&
              latestTemplate.versions > commissionTemplate.versions
            ) {
              versionAvailable = true;
            }
          }

          // Find the matching commission range based on totalApplications
          let matchedCommissionRange = null;
          let currentCommissionRate = "0%";
          let commissionsData =
            commissionTemplate?.commissionGroup?.commissions || [];

          if (commissionTemplate?.commissionGroup?.commissions) {
            const commissions = commissionTemplate.commissionGroup.commissions;

            // Find the commission range that matches the totalApplications count
            matchedCommissionRange = commissions.find(
              (commission) =>
                totalApplications >= commission.studentRangeLower &&
                (commission.studentRangeUpper === null ||
                  totalApplications <= commission.studentRangeUpper),
            );

            // If no range matched, use the first range
            if (!matchedCommissionRange && commissions.length > 0) {
              matchedCommissionRange = commissions[0];
            }

            if (matchedCommissionRange) {
              currentCommissionRate =
                matchedCommissionRange.firstRate !== null
                  ? `${matchedCommissionRange.firstRate}%`
                  : "0%";
            }
          }

          return {
            awardingBodyId: template.awardingBodyId,
            awardingBodyName: awardingBody?.name || "Unknown",
            commissionTemplateId: template.commissionTemplateId,
            commissionTemplateName: commissionTemplate?.name || "Unknown",
            commissionTemplateVersion: commissionTemplate?.versions || "1",
            matchId: commissionTemplate?.matchId || null,
            currentCommissionRate: currentCommissionRate,
            status: template.status || "ACTIVE",
            totalApplications: totalApplications,
            versionAvailable,
            commissionRangeData: commissionsData || [],
            commissionRange: matchedCommissionRange
              ? {
                  studentRangeLower: matchedCommissionRange.studentRangeLower,
                  studentRangeUpper: matchedCommissionRange.studentRangeUpper,
                  firstRate: matchedCommissionRange.firstRate,
                  secondRate: matchedCommissionRange.secondRate,
                  thirdRate: matchedCommissionRange.thirdRate,
                  fourthRate: matchedCommissionRange.fourthRate,
                }
              : null,
          };
        } catch (error) {
          return {
            ...template,
            awardingBodyName: "Error loading",
            commissionTemplateName: "Error loading",
            currentCommissionRate: "0%",
            totalApplications: totalApplications,
            commissionRange: null,
          };
        }
      }),
    );

    let overallCommissionRate = "0%";
    if (enrichedAwardingBodyTemplates.length > 0) {
      overallCommissionRate =
        enrichedAwardingBodyTemplates[0].currentCommissionRate;
    }

    const filtered = enrichedAwardingBodyTemplates.filter((t) => {
      const term = search.toLowerCase();
      return (
        t.awardingBodyName.toLowerCase().includes(term) ||
        t.commissionTemplateName.toLowerCase().includes(term)
      );
    });

    // 🔹 Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const pagination = {
      count: paginated.length,
      total,
      page,
      perPage: limit,
      totalPages,
    };

    return {
      awardingBodyTemplates: paginated,
      pagination,
    };
  }
}

export default AuthService;
