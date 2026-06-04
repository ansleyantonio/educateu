import type { EmailTemplate, EmailType } from '@prisma/client';
import prisma from '../prismaClient';

export const getEmailTemplateByType = async (
  type: EmailType
): Promise<EmailTemplate | null> => {
  const emailTemplates = await prisma.emailTemplate.findMany({
    where: { type },
    orderBy: { createdAt: 'desc' },
    take: 1,
  });

  const template = emailTemplates[0] ?? null;

  return template;
};
