import { raw } from "body-parser";
import path from "path";
import { z } from "zod";

export const portalType = z.enum(["admin", "faculty", "agent"]);
export type portalTypeType = z.infer<typeof portalType>;

export const mfaSchema = z.object({
  mfaEnabled: z.boolean(),
});

export const verifyOTPEmail = z.object({
  email: z.string().email("Invalid email format"),
});

export const sendMultipleEmailsSchema = z.object({
  email: z
    .array(z.string().email())
    .nonempty("At least one recipient email is required"),

  attachments: z
    .array(
      z.object({
        filename: z.string().optional(),
        content: z.string().optional(),
        encoding: z.literal("base64").optional(),
        path: z.string().optional(),
        href: z.string().url().optional(),
        raw: z.string().optional(),
        contentType: z.string().optional(),
      })
    )
    .optional(),

  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),

  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
});
export type sendMultipleEmailsSchemaType = z.infer<
  typeof sendMultipleEmailsSchema
>;
