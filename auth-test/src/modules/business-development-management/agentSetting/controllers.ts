import { Request, Response } from "express";
import {
  AgentCommissionGroupSchema,
  AgreementTemplateSchema,
  AgreementTemplateUpdateSchema,
  CommissionBulkCreateSchema,
  CommissionGroupResponse,
  CommissionGroupUpdateSchema,
  createVariableSchema,
  ExpiryRemainderSchema,
} from "./schema";
import { AgentSettingService } from "./services";
import { sendSuccessResponse } from "../../../utils/responseUtils";
import { RequestWithUser } from "../../../types";
import prisma from "../../../prismaClient";
import { zodSafeParse } from "../../../utils/zodUtils";
import { parse } from "csv-parse/sync";
import { AppError } from "../../../utils/AppError";
import z from "zod";
import { agentSettingRoutes } from "./routes";
import { Prisma } from "@prisma/client";
import { format } from "fast-csv";
import * as XLSX from "xlsx";
import puppeteer from "puppeteer"; // npm install puppeteer
import createAuditLog from "../../../auditlog";
import { formatChanges } from "../../../utils/formatChanges";

// async function generatePdfFromHtml(html: string): Promise<Buffer> {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.setContent(html, { waitUntil: "networkidle0" });

//   const pdfBuffer = await page.pdf({ format: "A4" });
//   await browser.close();
//   return Buffer.from(pdfBuffer);
// }
// Add this to your controller file
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
  // Add any other fields that might be in your roleData
}
export const generatePdfFromHtml = async (html: string): Promise<Buffer> => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: "domcontentloaded" });

  const buffer = await page.pdf({
    format: "A4",
    printBackground: true,
  });

  await browser.close();
  return Buffer.from(buffer);
};

export const AgentSettingController = {
  createCoimmissionGroup: async (req: RequestWithUser, res: Response) => {
    const reqBody = zodSafeParse(req.body, AgentCommissionGroupSchema);
    const data = await AgentSettingService.createCommissionGroup(reqBody);

    const readableChanges = formatChanges({}, data);

    if (req.user && readableChanges.length > 0) {
      await createAuditLog({
        userId: req.user?.userId || "",
        action: readableChanges.join("\n"),
        actionType: "business_development",
        previousValue: JSON.stringify(reqBody),
        newValue: JSON.stringify(data),
        moduleName: "business_development",
      });
    }

    sendSuccessResponse(
      res,
      data,
      "Commission Group created successfully",
      201,
    );
  },

  createCommissions: async (req: RequestWithUser, res: Response) => {
    const result = zodSafeParse(req.body, CommissionBulkCreateSchema);

    // Get existing commissions before creating/updating
    const existingCommissions = await prisma.commission.findMany({
      where: { commissionGroupId: result.commissionGroupId },
    });

    const data = await AgentSettingService.createCommissions(result);

    const commissionGroup = await prisma.commissionGroup.findUnique({
      where: { id: result.commissionGroupId },
      select: { name: true },
    });

    // Format changes for audit log
    const readableChanges = formatChanges(
      { commissions: existingCommissions },
      { commissions: data },
    );

    if (req.user && readableChanges.length > 0) {
      await createAuditLog({
        userId: req.user.userId,
        action: `Commission Group '${commissionGroup?.name}': ${readableChanges.join("\n")}`,
        actionType: "business_development",
        previousValue: JSON.stringify({ commissions: existingCommissions }),
        newValue: JSON.stringify({ commissions: data }),
        moduleName: "business_development",
      });
    }

    sendSuccessResponse(res, data, "Commissions created successfully", 201);
  },

  getCommissionGroups: async (req: Request, res: Response) => {
    // Extract type from query params
    const type = req.query.type as "INTERNAL" | "EXTERNAL" | undefined;

    // Validate type if provided
    if (type && !["INTERNAL", "EXTERNAL"].includes(type)) {
      throw new AppError("Invalid type parameter", "BAD_REQUEST", 400);
    }

    const data =
      await AgentSettingService.getCommissionGroupsWithCommissions(type);
    sendSuccessResponse(res, data, "Commission groups retrieved successfully");
  },
  getCommissionGroupById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const data = await AgentSettingService.getCommissionGroupById(id);
    sendSuccessResponse(res, data, "Commission group retrieved successfully");
  },

  deleteCommission: async (req: Request, res: Response) => {
    const { commissionId } = req.params;
    const commission = await prisma.commission.findUnique({
      where: { id: commissionId },
    });
    if (!commission) {
      throw new AppError("Commission not found", "NOT_FOUND", 404);
    }
    await AgentSettingService.deleteCommissionById(commissionId);

    sendSuccessResponse(res, null, "Commission deleted successfully", 204);
  },

  updateCommissionGroup: async (req: RequestWithUser, res: Response) => {
    const { id } = req.params;

    // Validate input using Zod schema
    const updateData = zodSafeParse(req.body, CommissionGroupUpdateSchema);

    const data = await AgentSettingService.updateCommissionGroup(
      id,
      updateData,
    );
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: ` updated commission group `,
          userId: req.user?.userId,
          actionType: "business_development",
          moduleName: "business_development",
        },
      });
    }
    sendSuccessResponse(res, data, "Commission group updated successfully");
  },

  async createTemplate(req: RequestWithUser, res: Response) {
    const parsed = zodSafeParse(req.body, AgreementTemplateSchema);
    const existingAwardingBody = await prisma.awardingBody.findUnique({
      where: { id: parsed.awardingBodyId },
    });
    if (!existingAwardingBody) {
      throw new AppError("Awarding Body not found", "NOT_FOUND", 404);
    }
    const commissionGroup = await prisma.commissionGroup.findUnique({
      where: { id: parsed.commissionGroupId },
    });
    if (!commissionGroup) {
      throw new AppError("Commission Group not found", "NOT_FOUND", 404);
    }
    const { pdfBuffer, template } =
      await AgentSettingService.createAgreementTemplate(parsed);
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: ` created new agreement template`,
          userId: req.user?.userId,
          actionType: "business_development",
          moduleName: "business_development",
        },
      });
    }
    sendSuccessResponse(res, template, "Template created successfully", 201);
  },

  async getAgreementPdf(req: Request, res: Response) {
    const { id } = req.params;

    if (
      !id.match(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      )
    ) {
      throw new AppError("Invalid agreement ID format", "BAD_REQUEST", 400);
    }

    const agreement = await prisma.agreementTemplate.findUnique({
      where: { id },
    });

    if (!agreement) {
      throw new AppError("Agreement not found", "NOT_FOUND", 404);
    }

    if (!agreement.pdfBuffer || agreement.pdfBuffer.length === 0) {
      throw new AppError("PDF content missing", "INTERNAL_ERROR", 500);
    }
    const formatted =
      agreement.templateType +
      "_" +
      new Date().toISOString().replace(/[:.]/g, "-");

    res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="agreement_${formatted}.pdf"`,
      "Content-Length": agreement.pdfBuffer.length,
    });

    res.end(agreement.pdfBuffer);
  },
  async getTemplateInfo(req: Request, res: Response) {
    const template = await AgentSettingService.getTemplateById(req.params.id);
    res.json({
      status: "success",
      data: {
        id: template.id,
        templateType: template.templateType,
        textPreview: template.templateText,
        name: template.name,
        awardingBodyId: template.awardingBodyId || "",
        commissionGroupId: template.commissionGroupId || "",
      },
    });
  },

  getUsersByCommissionGroupHandler: async (req: Request, res: Response) => {
    const { id: commissionGroupId } = req.params;

    if (!commissionGroupId) {
      throw new AppError("commissionGroupId is required", "BAD_REQUEST", 400);
    }

    const users =
      await AgentSettingService.getUsersByCommissionGroup(commissionGroupId);
    sendSuccessResponse(res, users, "Users retrieved successfully");
  },
  async getUserSpecificAgreementPdf(req: Request, res: Response) {
    const userId = req.params?.id;

    // Step 1: Fetch user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }

    // Step 2: Fetch roles with agreementTemplateId
    const userRoles = await prisma.userPortalCategoryRole.findMany({
      where: {
        userPortalCategory: {
          userId: userId,
        },
        roleData: {
          path: ["agreementTemplateId"],
          not: Prisma.JsonNull,
        },
      },
      include: {
        userPortalCategory: true,
      },
    });

    if (!userRoles || userRoles.length === 0) {
      throw new AppError(
        "No commission groups found for this user",
        "NOT_FOUND",
        404,
      );
    }

    // Step 3: Get first agreementTemplateId from roleData
    const firstValidTemplateId = userRoles
      .map((role) => {
        try {
          return (role.roleData as any)?.agreementTemplateId;
        } catch {
          return null;
        }
      })
      .find((id) => !!id);

    if (!firstValidTemplateId) {
      throw new AppError(
        "No valid agreement template ID found in user roles",
        "NOT_FOUND",
        404,
      );
    }

    // Step 4: Fetch the agreement template
    const template = await prisma.agreementTemplate.findUnique({
      where: {
        id: firstValidTemplateId,
      },
    });

    if (!template || !template.pdfBuffer || template.pdfBuffer.length === 0) {
      throw new AppError("PDF content missing", "INTERNAL_ERROR", 500);
    }

    // // Step 5: Replace placeholders in templateText (if needed)
    // const processedTemplateText = template.templateText.replace(
    //   /{{AgentUser}}/g,
    //   user.agentUser ?? ""
    // );

    // Step 6: Return the PDF as response
    const filledText = template.templateText.replace(
      /{{AgentUser}}/g,
      user.agentUser ?? "",
    );

    try {
      const pdfBuffer = await generatePdfFromHtml(filledText);
      res.writeHead(200, {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="user_agreement_${userId}.pdf"`,
        "Content-Length": pdfBuffer.length,
      });
      res.end(pdfBuffer);
    } catch (err) {
      console.error("PDF Generation Failed:", err); // <--- Add this
      res.status(500).json({
        message: "Failed to generate PDF",
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  // async getUserSpecificAgreementPdf(req: Request, res: Response) {
  //   const userId = req.params?.id;

  //   const userRoles = await prisma.userPortalCategoryRole.findMany({
  //     where: {
  //       userPortalCategory: {
  //         userId: userId,
  //       },
  //       roleData: {
  //         path: ["commissionGroupId"],
  //         not: Prisma.JsonNull,
  //       },
  //     },
  //     include: {
  //       userPortalCategory: true,
  //     },
  //   });
  //   console.log(userRoles);
  //   if (!userRoles || userRoles.length === 0) {
  //     throw new AppError(
  //       "No commission groups found for this user",
  //       "NOT_FOUND",
  //       404
  //     );
  //   }

  //   const commissionGroupIds = userRoles
  //     .map((role) => {
  //       try {
  //         const roleData = role.roleData as any;
  //         return roleData?.commissionGroupId;
  //       } catch {
  //         return null;
  //       }
  //     })
  //     .filter(Boolean);

  //   if (commissionGroupIds.length === 0) {
  //     throw new AppError(
  //       "No valid commission groups found in user roles",
  //       "NOT_FOUND",
  //       404
  //     );
  //   }

  //   const templates = await prisma.agreementTemplate.findMany({
  //     where: {
  //       templateType: {
  //         in: ["INTERNAL", "EXTERNAL"],
  //       },
  //     },
  //     orderBy: {
  //       createdAt: "desc",
  //     },
  //     take: 1,
  //   });

  //   if (!templates || templates.length === 0) {
  //     throw new AppError(
  //       "No agreement templates found for user's commission groups",
  //       "NOT_FOUND",
  //       404
  //     );
  //   }

  //   const template = templates[0];

  //   if (!template.pdfBuffer || template.pdfBuffer.length === 0) {
  //     throw new AppError("PDF content missing", "INTERNAL_ERROR", 500);
  //   }

  //   res.writeHead(200, {
  //     "Content-Type": "application/pdf",
  //     "Content-Disposition": `inline; filename="user_agreement_${userId}.pdf"`,
  //     "Content-Length": template.pdfBuffer.length,
  //   });

  //   res.end(template.pdfBuffer);
  // },

  // Add to your AgentSettingController

  createExpiryRemainder: async (req: RequestWithUser, res: Response) => {
    const reqBody = zodSafeParse(req.body, ExpiryRemainderSchema);
    const data = await AgentSettingService.createExpiryRemainder(reqBody);

    sendSuccessResponse(
      res,
      data,
      "Expiry remainder created successfully",
      201,
    );
  },
  getExpiryRemainder: async (req: RequestWithUser, res: Response) => {
    const data = await AgentSettingService.getAllExpiryRemainders();
    sendSuccessResponse(res, data, "Expiry remainder retrieved successfully");
  },

  createGlobalSetting: async (req: RequestWithUser, res: Response) => {
    const reqBody = zodSafeParse(req.body, createVariableSchema);
    const data = await AgentSettingService.createGlobalSetting(reqBody);
    if (req.user) {
      await prisma.auditLog.create({
        data: {
          action: ` created global setting ${data.name}`,
          userId: req.user?.userId,
          actionType: "business_development",
          moduleName: "business_development",
        },
      });
    }
    sendSuccessResponse(res, data, "Global setting created successfully", 201);
  },
  getGlobalSetting: async (req: RequestWithUser, res: Response) => {
    const name = req.query.name as string;
    const data = await AgentSettingService.getGlobalSetting(name);
    sendSuccessResponse(res, data, "Global setting retrieved successfully");
  },

  getLatestTemplates: async (req: RequestWithUser, res: Response) => {
    const templateType = req.query.templateType as "INTERNAL" | "EXTERNAL";
    const data = await AgentSettingService.getLatestTemplates(templateType);
    sendSuccessResponse(res, data, "Latest templates retrieved successfully");
  },

  downloadCommissionGroups: async (req: Request, res: Response) => {
    try {
      const type = req.query.type as "INTERNAL" | "EXTERNAL" | undefined;

      if (type && !["INTERNAL", "EXTERNAL"].includes(type)) {
        throw new AppError("Invalid type parameter", "BAD_REQUEST", 400);
      }

      const data =
        await AgentSettingService.getCommissionGroupsWithCommissions(type);

      // Create a workbook
      const wb = XLSX.utils.book_new();

      // Create an array for storing the data
      const rows: any[] = [];

      // Add header row - updated to include all rate columns
      rows.push([
        "Tier",
        "Student Range",
        "Bonus",
        "First Rate",
        "Second Rate",
        "Third Rate",
        "Fourth Rate",
      ]);

      // Iterate over commission groups and prepare rows for Excel
      // data.forEach((group) => {
      //   group.commissions.forEach((commission) => {
      //     const studentRange = commission.studentRangeUpper
      //       ? `${commission.studentRangeLower}-${commission.studentRangeUpper}`
      //       : `>${commission.studentRangeLower}`;

      //     // Push each commission row to the rows array - updated to use individual rates
      //     rows.push([
      //       group.commissionGroupName,
      //       studentRange,
      //       group.bonus,
      //       commission.rate1 ? `${commission.rate1}%` : "-",
      //       commission.rate2 ? `${commission.rate2}%` : "-",
      //       commission.rate3 ? `${commission.rate3}%` : "-",
      //       commission.rate4 ? `${commission.rate4}%` : "-",
      //       // commission.bonus !== null && commission.bonus !== undefined
      //       //   ? commission.bonus
      //       //   : "-",
      //     ]);
      //   });
      // });
      // Iterate over commission groups and prepare rows for Excel
      data.forEach((group) => {
        // Insert a header row for the group
        rows.push([
          `${group.commissionGroupName} (Bonus: ${group.bonus ?? "-"})`,
        ]);

        // Add sub-header row
        rows.push([
          "Student Range",
          "Bonus",
          "First Rate",
          "Second Rate",
          "Third Rate",
          "Fourth Rate",
        ]);

        // Insert commissions
        group.commissions.forEach((commission) => {
          const studentRange = commission.studentRangeUpper
            ? `${commission.studentRangeLower}-${commission.studentRangeUpper}`
            : `>${commission.studentRangeLower}`;

          rows.push([
            studentRange,
            group.bonus ?? "-",
            commission.rate1 ? `${commission.rate1}%` : "-",
            commission.rate2 ? `${commission.rate2}%` : "-",
            commission.rate3 ? `${commission.rate3}%` : "-",
            commission.rate4 ? `${commission.rate4}%` : "-",
          ]);
        });

        // Add an empty row for spacing
        rows.push([]);
      });

      // Convert rows array into a worksheet
      const ws = XLSX.utils.aoa_to_sheet(rows);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(wb, ws, "Commission Data");

      // Set response headers for Excel file download
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      );
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="commission-groups-${type || "ALL"}.xlsx"`,
      );

      // Write the Excel file to the response
      const buffer = XLSX.write(wb, {
        bookType: "xlsx",
        type: "buffer",
      });

      res.end(buffer);
    } catch (error) {
      console.error("Error generating Excel file:", error);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        "Error generating Excel file",
        "INTERNAL_SERVER_ERROR",
        500,
      );
    }
  },

  getAwardingBodiesWithTemplates: async (req: Request, res: Response) => {
    const id = req.params.id;
    const data = await AgentSettingService.getAwardingBodiesWithTemplates(id);
    sendSuccessResponse(res, data, "Data retrieved successfully");
  },

  updateTemplate: async (req: Request, res: Response) => {
    const id = req.params.id as string;
    // Validate body with Zod
    const parsed = zodSafeParse(req.body, AgreementTemplateUpdateSchema);

    // Check awarding body exists
    const existingAwardingBody = await prisma.awardingBody.findUnique({
      where: { id: parsed.data.awardingBodyId },
    });
    if (!existingAwardingBody) {
      throw new AppError("Awarding body not found", "NOT_FOUND", 404);
    }

    // Check commission group exists
    const commissionGroup = await prisma.commissionGroup.findUnique({
      where: { id: parsed.data.commissionGroupId },
    });
    if (!commissionGroup) {
      throw new AppError("Commission group not found", "NOT_FOUND", 404);
    }

    // Update template
    const updatedTemplate = await AgentSettingService.updateTemplate(
      parsed,
      id,
    );

    sendSuccessResponse(res, updatedTemplate, "Template updated successfully");
  },

  getTypeWiseAwardingBodies: async (req: Request, res: Response) => {
    const type = req.query.type as
      | "INTERNAL"
      | "EXTERNAL"
      | "internal"
      | "external"
      | undefined;

    // Validate type if provided
    if (
      type &&
      !["INTERNAL", "EXTERNAL", "internal", "external"].includes(type)
    ) {
      throw new AppError("Invalid type parameter", "BAD_REQUEST", 400);
    }

    const data = await AgentSettingService.getTypeWiseAwardingBodies(type);
    sendSuccessResponse(res, data, "Commission groups retrieved successfully");
  },

  getAgreementsByMatchId: async (req: Request, res: Response) => {
    const { matchId } = req.params;
    const isMatchIdValid = await prisma.agreementTemplate.findFirst({
      where: { matchId },
    });
    if (!isMatchIdValid) {
      throw new AppError("Invalid matchId", "NOT_FOUND", 404);
    }
    const data = await AgentSettingService.getAgreementsByMatchId(matchId);
    sendSuccessResponse(res, data, "Agreements retrieved successfully");
  },
};
