import * as z from "zod";

export const MAX_FILE_SIZE = 800000; // 800KB

export const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

// Custom File Validation Schema
const fileSchema = z
  .custom<File>()
  .refine((file) => file.size <= MAX_FILE_SIZE, {
    message: `File size must be less than ${MAX_FILE_SIZE / 1000}KB`,
  })
  .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
    message: "Unsupported file format",
  });

export const formSchema = z.object({
  internalCommissionTemplate: fileSchema.optional(),
  externalCommissionTemplate: fileSchema.optional(),
  internalAgreementTemplate: fileSchema.optional(),
  externalAgreementTemplate: fileSchema.optional(),
  agentEnrollment: z.enum(["EXTERNAL", "INTERNAL", "Enrollment"]),
  // agentEnrollment: z.string().optional(),
  disableNewApplication: z.boolean().default(false),
  expiryDateReminder: z.enum(["1week", "2weeks", "1month"]),
});

// Infer the TypeScript type from Zod schema
export type FormValues = z.infer<typeof formSchema>;
