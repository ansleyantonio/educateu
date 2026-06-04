import { EmailType } from "@prisma/client";
import prisma from "../../prismaClient";
import createAuditLog from "../../utils/auditlog";
import { ICreateEmailTemplate, IGetTemplates } from "./types";
import { Prisma } from "@prisma/client";
import { TemplateVariables } from "./variable";

// Get email template variable
const getEmailTemplateVariable = (() => {
  const map: Record<string, { label: string; variable: string }[]> = {};

  TemplateVariables.forEach(({ label, variable, types = [] }) => {
    if (!variable) return;

    types.forEach((type) => {
      if (!type) return;

      (map[type] ??= []).push({ label, variable });
    });
  });

  return (type: EmailType) => map[type] || [];
})();

// Get email templates
const getEmailTemplates = async (type: EmailType) => {
  const emailTemplates = await prisma.emailTemplate.findMany({
    where: { type },
    orderBy: { createdAt: "desc" },
    take: 1,
  });

  const template = emailTemplates[0];

  return template;
};

// Preview email templates
const getPreviewEmailTemplates = async (reqBody: IGetTemplates) => {
  const { page = 1, pageSize = 10, type, search } = reqBody;

  const skip = (page - 1) * pageSize;

  const where: Prisma.EmailTemplateWhereInput = {
    ...(type && { type }),
    ...(search && {
      OR: [{ name: { contains: search, mode: "insensitive" } }, { subject: { contains: search, mode: "insensitive" } }],
    }),
  };

  const [emailTemplates, totalCount] = await Promise.all([
    prisma.emailTemplate.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.emailTemplate.count({ where }),
  ]);

  return {
    emailTemplates,
    pagination: {
      page,
      pageSize,
      count: emailTemplates.length,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    },
  };
};

// Create email template
const createEmailTemplate = async (userId: string, reqBody: ICreateEmailTemplate) => {
  const { name, type, subject, body, variables } = reqBody;

  // Get existing active template (or null)
  const template = await prisma.emailTemplate.create({
    data: {
      name,
      type,
      subject,
      body,
      variables,
    },
  });

  await createAuditLog({
    userId,
    action: `Updated email template: ${type}  by ${userId}`,
    actionType: "email_template",
  });

  return {
    message: "Template created successfully",
    template,
  };
};

export const EmailTemplateService = {
  getEmailTemplates,
  createEmailTemplate,
  getPreviewEmailTemplates,
  getEmailTemplateVariable,
};
