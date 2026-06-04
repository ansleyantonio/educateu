import puppeteer from "puppeteer";
import prisma from "../../../prismaClient";
import { AppError } from "../../../utils/AppError";
import {
  AgentCommissionGroup,
  AgreementTemplateType,
  CommissionBulkCreateInput,
  CommissionGroupResponse,
  CommissionGroupUpdateInput,
  CommissionInput,
  CreateVariableInput,
  ExpiryRemainder,
} from "./schema";
import { AwardingBodyStatus, Prisma } from "@prisma/client";

function extractRoleData(roleData: any): any {
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
  set?: { [key: string]: any };
}

export const AgentSettingService = {
  createCommissionGroup: async (data: AgentCommissionGroup) => {
    if (!data.name) {
      throw new AppError("Name is required", "BAD_REQUEST", 400);
    }
    const existGroup = await prisma.commissionGroup.findFirst({
      where: {
        name: data.name,
        type: data.type,
      },
    });

    if (existGroup) {
      throw new AppError("Commission group already exists", "BAD_REQUEST", 400);
    }

    return prisma.commissionGroup.create({ data });
  },

  createCommissions: async (data: CommissionBulkCreateInput) => {
    const group = await prisma.commissionGroup.findUnique({
      where: { id: data.commissionGroupId },
    });

    if (!group) {
      throw new AppError("Commission group not found", "NOT_FOUND", 404);
    }

    // Update bonus and studentLimit if provided
    if (data.bonus !== undefined || data.studentLimit !== undefined) {
      await prisma.commissionGroup.update({
        where: { id: data.commissionGroupId },
        data: {
          ...(data.bonus !== undefined && { bonus: data.bonus }),
          ...(data.studentLimit !== undefined && {
            studentLimit: data.studentLimit,
          }),
        },
      });
    }

    // Set default values for rates
    for (const commission of data.commissions) {
      commission.rate1 = commission.rate1 ?? 0;
      commission.rate2 = commission.rate2 ?? 0;
      commission.rate3 = commission.rate3 ?? 0;
      commission.rate4 = commission.rate4 ?? 0;

      if (
        commission.studentRangeUpper &&
        commission.studentRangeLower >= commission.studentRangeUpper
      ) {
        throw new AppError(
          `studentRangeLower (${commission.studentRangeLower}) must be less than studentRangeUpper (${commission.studentRangeUpper})`,
          "BAD_REQUEST",
          400
        );
      }
    }

    const sortedCommissions = [...data.commissions].sort(
      (a, b) => a.studentRangeLower - b.studentRangeLower
    );
    if (sortedCommissions[0].studentRangeLower !== 1) {
      throw new AppError(
        `The first student range must start at 1 (found ${sortedCommissions[0].studentRangeLower})`,
        "BAD_REQUEST",
        400
      );
    }
    for (let i = 0; i < sortedCommissions.length - 1; i++) {
      const current = sortedCommissions[i];
      const next = sortedCommissions[i + 1];

      const currentUpper =
        current.studentRangeUpper || current.studentRangeLower;
      const nextLower = next.studentRangeLower;

      if (currentUpper >= nextLower) {
        throw new AppError(
          `Ranges overlap between ${currentUpper} and ${nextLower}`,
          "BAD_REQUEST",
          400
        );
      }

      if (currentUpper + 1 !== nextLower) {
        throw new AppError(
          `Gap between ranges (${currentUpper} and ${nextLower})`,
          "BAD_REQUEST",
          400
        );
      }
    }

    try {
      // Use the array approach instead of callback for better compatibility
      const transactionOperations = [
        prisma.commission.deleteMany({
          where: { commissionGroupId: data.commissionGroupId },
        }),
        ...data.commissions.map((commission) =>
          prisma.commission.create({
            data: {
              studentRangeLower: commission.studentRangeLower,
              studentRangeUpper: commission.studentRangeUpper,
              firstRate: commission.rate1,
              secondRate: commission.rate2,
              thirdRate: commission.rate3,
              fourthRate: commission.rate4,
              commissionGroupId: data.commissionGroupId,
            },
          })
        ),
      ];

      const results = await prisma.$transaction(transactionOperations);

      // Return only the created commissions (skip the first result which is delete count)
      return results.slice(1);
    } catch (error) {
      console.error("Error in createCommissions transaction:", error);
      throw new AppError(
        `Failed to create commissions: ${error instanceof Error ? error.message : "Unknown error"}`,
        "INTERNAL_SERVER_ERROR",
        500
      );
    }
  },

  getCommissionGroupsWithCommissions: async (
    type?: "INTERNAL" | "EXTERNAL"
  ): Promise<CommissionGroupResponse[]> => {
    const commissionGroups = await prisma.commissionGroup.findMany({
      where: type ? { type } : {},
      include: {
        commissions: {
          orderBy: { studentRangeLower: "asc" },
        },
      },
    });

    return commissionGroups.map((group) => ({
      commissionGroupId: group.id,
      commissionGroupName: group.name,
      studentLimit: group.studentLimit,
      bonus: group.bonus,
      type: group.type,
      commissions: group.commissions.map((commission) => ({
        id: commission.id,
        studentRangeLower: commission.studentRangeLower,
        studentRangeUpper: commission.studentRangeUpper,
        // bonus: group.bonus,
        rate1: commission.firstRate,
        rate2: commission.secondRate,
        rate3: commission.thirdRate,
        rate4: commission.fourthRate,
      })),
    }));
  },
  getCommissionGroupById: async (
    groupId: string
  ): Promise<CommissionGroupResponse> => {
    const group = await prisma.commissionGroup.findUnique({
      where: { id: groupId },
      include: {
        commissions: {
          orderBy: { studentRangeLower: "asc" },
        },
      },
    });

    if (!group) {
      throw new AppError("Commission group not found", "NOT_FOUND", 404);
    }

    return {
      commissionGroupId: group.id,
      commissionGroupName: group.name,
      type: group.type,
      bonus: group.bonus,
      studentLimit: group.studentLimit,
      commissions: group.commissions.map((c) => ({
        id: c.id,
        studentRangeLower: c.studentRangeLower,
        studentRangeUpper: c.studentRangeUpper,
        rate1: c.firstRate, // Map firstRate to rate1
        rate2: c.secondRate, // Map secondRate to rate2
        rate3: c.thirdRate, // Map thirdRate to rate3
        rate4: c.fourthRate,
      })),
    };
  },

  deleteCommissionById: async (commissionId: string) => {
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });

    if (!commission) {
      throw new AppError("Commission not found", "NOT_FOUND", 404);
    }

    return prisma.commission.delete({
      where: { id: commissionId },
    });
  },

  updateCommissionGroup: async (
    groupId: string,
    updateData: CommissionGroupUpdateInput
  ) => {
    // Check for name uniqueness if name is being updated
    if (updateData.name) {
      const existingGroup = await prisma.commissionGroup.findFirst({
        where: {
          name: updateData.name,
          id: { not: groupId },
        },
      });

      if (existingGroup) {
        throw new AppError(
          "Commission group name already exists",
          "BAD_REQUEST",
          400
        );
      }
    }

    return prisma.commissionGroup.update({
      where: { id: groupId },
      data: updateData,
    });
  },

  assignCommissionToAgents: async (
    commissionGroupId: string,
    userIds: string[]
  ) => {
    const commissionGroup = await prisma.commissionGroup.findUnique({
      where: { id: commissionGroupId },
    });

    if (!commissionGroup) {
      throw new AppError("Commission group not found", "NOT_FOUND", 404);
    }

    const results = await Promise.all(
      userIds.map(async (userId) => {
        const userRole = await prisma.userPortalCategoryRole.findFirst({
          where: {
            userPortalCategory: {
              userId: userId,
              portalCategory: {
                name: "agent",
              },
            },
            role: {
              name: "agent",
            },
          },
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
          },
        });

        if (!userRole) {
          throw new AppError(
            `User ${userId} is not an agent or role not found`,
            "BAD_REQUEST",
            400
          );
        }

        const currentRoleData = extractRoleData(userRole.roleData);

        const updatedRoleData = {
          ...currentRoleData,
          commissionGroupId: commissionGroupId,
          commissionGroupName: commissionGroup.name,
          commissionGroupType: commissionGroup.type,
          assignedAt: new Date().toISOString(),
        };

        return await prisma.userPortalCategoryRole.update({
          where: { id: userRole.id },
          data: {
            roleData: updatedRoleData,
          },
          include: {
            userPortalCategory: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });
      })
    );

    return {
      success: true,
      message: "Commission assigned successfully",
      assignedAgents: results.map((r) => ({
        userId: r.userPortalCategory.user.id,
        name: `${r.userPortalCategory.user.firstName} ${r.userPortalCategory.user.lastName}`,
        commissionGroupId,
        commissionGroupName: commissionGroup.name,
      })),
    };
  },

  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
      ],
    });
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "domcontentloaded" });
    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20mm",
        right: "20mm",
        bottom: "20mm",
        left: "20mm",
      },
    });

    await browser.close();
    return Buffer.from(buffer);
  },

  generateRandomMatchId(length: number = 3): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars[randomIndex];
    }
    return result;
  },

  async createAgreementTemplate(data: AgreementTemplateType) {
    try {
      const pdfBuffer = await this.generatePdfFromHtml(data.agreement);

      // Build matchId prefix: first 2 chars from each field
      const awardingPart = (data.awardingBodyId || "").slice(0, 2);
      const namePart = (data.name || "").slice(0, 2);
      const typePart = (data.templateType || "").slice(0, 2);
      const baseMatchId = `${awardingPart}${namePart}${typePart}`;

      // Find existing templates with same key
      const existingTemplate = await prisma.agreementTemplate.findFirst({
        where: {
          awardingBodyId: data.awardingBodyId || undefined,
          name: data.name || undefined,
          templateType: data.templateType,
        },
        orderBy: {
          versions: "desc",
        },
      });

      let version = 1;
      let matchId = baseMatchId + this.generateRandomMatchId(); // default: prefix + random

      if (existingTemplate) {
        // If exists → increment version and reuse matchId
        version = (existingTemplate.versions ?? 1) + 1;
        matchId = existingTemplate.matchId || matchId;
      }

      const template = await prisma.agreementTemplate.create({
        data: {
          name: data.name || null,
          templateText: data.agreement,
          pdfBuffer: Buffer.from(pdfBuffer),
          templateType: data.templateType,
          awardingBodyId: data.awardingBodyId || null,
          commissionGroupId: data.commissionGroupId || null,
          versions: version,
          matchId: matchId,
        },
      });

      return {
        pdfBuffer,
        template,
      };
    } catch (error) {
      throw new AppError(
        `PDF generation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "INTERNAL_SERVER_ERROR",
        500
      );
    }
  },

  async getTemplateById(id: string) {
    const template = await prisma.agreementTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new AppError("Template not found", "NOT_FOUND", 404);
    }

    return template;
  },

  async getUsersByCommissionGroup(commissionGroupId: string) {
    const roles = await prisma.userPortalCategoryRole.findMany({
      where: {
        roleData: {
          path: ["commissionGroupId"],
          equals: commissionGroupId,
        },
      },
      include: {
        userPortalCategory: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return roles.map((role) => ({
      userId: role.userPortalCategory.user.id,
      name: `${role.userPortalCategory.user.firstName} ${role.userPortalCategory.user.lastName}`,
      email: role.userPortalCategory.user.email,
      commissionGroupId,
    }));
  },

  createExpiryRemainder: async (data: ExpiryRemainder) => {
    if (!data.daysBefore) {
      throw new AppError("Days before is required", "BAD_REQUEST", 400);
    }
    await prisma.expiryRemainder.deleteMany({});

    return prisma.expiryRemainder.create({ data });
  },

  getAllExpiryRemainders: async () => {
    return prisma.expiryRemainder.findMany();
  },

  createGlobalSetting: async (data: CreateVariableInput) => {
    const existing = await prisma.variable.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return prisma.variable.update({
        where: { name: data.name },
        data: { value: data.value },
      });
    }

    return prisma.variable.create({
      data: {
        name: data.name,
        value: data.value,
      },
    });
  },

  getGlobalSetting: async (name: string) => {
    const globalSetting = await prisma.variable.findUnique({
      where: { name: name },
    });

    if (!globalSetting) {
      throw new AppError("Global setting not found", "NOT_FOUND", 404);
    }

    return globalSetting;
  },

  // getLatestTemplates: async (templateType: "INTERNAL" | "EXTERNAL") => {
  //   const templates = await prisma.agreementTemplate.findMany({
  //     where: {
  //       templateType,
  //     },
  //     select: {
  //       id: true,
  //       name: true,
  //       templateText: true,
  //       templateType: true,
  //       awardingBodyId: true,
  //       awardingBody: { select: { name: true } },
  //       commissionGroup: { select: { name: true } },
  //       commissionGroupId: true,

  //       // pdfBuffer: true,
  //     },
  //     orderBy: { createdAt: "desc" },
  //     // take: 1,
  //   });

  //   return templates.map((template) => ({
  //     id: template.id,
  //     name: template.name || "",
  //     templateText: template.templateText,
  //     templateType: template.templateType,
  //     awardingBodyId: template.awardingBodyId || "",
  //     awardingBodyName: template.awardingBody?.name || "",
  //     commissionGroupId: template.commissionGroupId || "",
  //     commissionGroupName: template.commissionGroup?.name || "",
  //     // pdfBuffer: template.pdfBuffer,
  //     // createdAt: template.createdAt,
  //   }));
  // },
  getLatestTemplates: async (templateType: "INTERNAL" | "EXTERNAL") => {
    // get latest version per matchId
    const latestTemplates = await prisma.agreementTemplate.groupBy({
      by: ["matchId"],
      where: { templateType },
      _max: {
        versions: true, // get highest version
      },
    });

    // fetch full template info for each latest version
    const templates = await Promise.all(
      latestTemplates.map((t) =>
        prisma.agreementTemplate.findFirst({
          where: {
            matchId: t.matchId,
            versions: t._max.versions,
          },
          select: {
            id: true,
            name: true,
            templateText: true,
            templateType: true,
            awardingBodyId: true,
            awardingBody: { select: { name: true } },
            commissionGroupId: true,
            commissionGroup: { select: { name: true } },
            versions: true,
            matchId: true,
          },
        })
      )
    );

    return templates.map((template) => ({
      id: template?.id || "",
      name: template?.name || "",
      templateText: template?.templateText || "",
      templateType: template?.templateType || "",
      awardingBodyId: template?.awardingBodyId || "",
      awardingBodyName: template?.awardingBody?.name || "",
      commissionGroupId: template?.commissionGroupId || "",
      commissionGroupName: template?.commissionGroup?.name || "",
      version: `v${template?.versions}`,
      matchId: template?.matchId || "",
    }));
  },

  getAwardingBodiesWithTemplates: async (id: string) => {
    // Fetch all templates for the awarding body
    const awardingBody = await prisma.awardingBody.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        agreementTemplates: {
          select: {
            id: true,
            name: true,
            matchId: true,
            versions: true,
          },
        },
      },
    });

    if (!awardingBody) {
      return {
        status: "error",
        statusCode: 404,
        message: "Awarding body not found",
        data: [],
      };
    }

    const latestTemplatesMap: Record<
      string,
      (typeof awardingBody.agreementTemplates)[0]
    > = {};

    awardingBody.agreementTemplates.forEach((template) => {
      if (!template.matchId) return; // skip if matchId is null or undefined
      const existing = latestTemplatesMap[template.matchId];
      if (!existing || (template.versions ?? 1) > (existing.versions ?? 1)) {
        latestTemplatesMap[template.matchId] = template;
      }
    });

    const latestTemplates = Object.values(latestTemplatesMap).map(
      (template) => ({
        awardingBodyId: awardingBody.id,
        awardingBodyName: awardingBody.name,
        commissionTemplateId: template.id,
        templateName: template.name,
        version: template.versions,
      })
    );

    return latestTemplates;
  },

  async updateTemplate(data: AgreementTemplateType, id: string) {
    const pdfBuffer = await this.generatePdfFromHtml(data.agreement);

    return prisma.agreementTemplate.update({
      where: { id },
      data: {
        name: data.name || null,
        templateText: data.agreement,
        pdfBuffer: Buffer.from(pdfBuffer),
        templateType: data.templateType,
        awardingBodyId: data.awardingBodyId || null,
        commissionGroupId: data.commissionGroupId || null,
      },
    });
  },
  async getTypeWiseAwardingBodies(
    type: "INTERNAL" | "EXTERNAL" | "internal" | "external" | undefined
  ) {
    const normalizedType = type
      ? (type.toUpperCase() as "INTERNAL" | "EXTERNAL")
      : undefined;

    const statusFilter = await prisma.agreementTemplate.findMany({
      where: {
        templateType: normalizedType,
        awardingBody: { status: AwardingBodyStatus.ACTIVE },
      },
      select: {
        awardingBody: { select: { id: true, name: true } },
      },
    });

    // Deduplicate awarding bodies by ID
    const uniqueAwardingBodies = Array.from(
      new Map(
        statusFilter
          .filter((item) => item.awardingBody !== null)
          .map((item) => [item.awardingBody!.id, item.awardingBody!])
      ).values()
    );

    return uniqueAwardingBodies;
  },

  async getAgreementsByMatchId(matchId: string) {
    const templates = await prisma.agreementTemplate.findMany({
      where: { matchId },
      orderBy: { versions: "desc" },
      select: {
        id: true,
        name: true,
        templateText: true,
        templateType: true,
        awardingBodyId: true,
        commissionGroupId: true,
        versions: true,
        matchId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (templates.length === 0) {
      throw new AppError(
        "No agreements found for this matchId",
        "NOT_FOUND",
        404
      );
    }

    return templates;
  },
};
