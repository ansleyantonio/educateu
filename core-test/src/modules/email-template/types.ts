import z from "zod";
import { EmailType } from "@prisma/client";

//
export const getTemplatesReqBodySchema = z
  .object({
    type: z.nativeEnum(EmailType),
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    search: z.string().optional(),
  })
  .strict();

// Create email template
export const createEmailTemplateReqBodySchema = z.object({
  name: z.string(),
  type: z.nativeEnum(EmailType),
  subject: z.string(),
  body: z.string(),
  variables: z.record(z.any()).optional(),
});

// Update email template
export const updateEmailTemplateReqBodySchema = createEmailTemplateReqBodySchema.omit({ type: true }).partial();

export type ICreateEmailTemplate = z.infer<typeof createEmailTemplateReqBodySchema>;
export type IUpdateEmailTemplate = z.infer<typeof updateEmailTemplateReqBodySchema>;
export type IGetTemplates = z.infer<typeof getTemplatesReqBodySchema>;
