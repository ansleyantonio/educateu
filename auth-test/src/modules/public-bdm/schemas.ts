import { stat } from "node:fs";
import { z } from "zod";
const photoSchema = z.object({
  path: z.string().min(1),
  mimetype: z.string().min(1),
  size: z.number().nonnegative(),
  originalname: z.string().min(1),
});
const awardingBodyTemplateSchema = z.object({
  awardingBodyId: z.string().uuid(),
  commissionTemplateId: z.string().uuid(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});
const agentTypeSchema = z.enum([
  "INTERNAL",
  "EXTERNAL",
  "internal",
  "external",
]);
export const registerSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    mobile: z
      .string()
      .min(10, { message: "Mobile number must be at least 10 characters" }),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    address: z.string().optional(),
    internalReference: z.string().optional(),
    userStatus: z
      .enum(["PENDING", "ACTIVE", "DEACTIVATED", "SUSPENDED"])
      .default("PENDING")
      .optional(),
    companyName: z.string().optional(),
    aggrementExpiryDate: z.string().optional(),
    potentialPayment: z.string().optional(),
    commissionGroupId: z.string().optional(),
    commitionRate: z.string().optional(),
    agentType: agentTypeSchema.default("EXTERNAL"),
    commissionTemplate: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    note: z.string().optional(),
    agreementStatus: z.boolean().default(true).optional(),
    awardingBodyTemplates: z.array(awardingBodyTemplateSchema).optional(),

    photo: z
      .string()
      .transform((val, ctx) => {
        try {
          return JSON.parse(val);
        } catch (e) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Invalid JSON format in photo",
          });
          return z.NEVER;
        }
      })
      .pipe(photoSchema)
      .optional(),
  })
  .strict();

// Export the inferred type
export type RegisterUserData = z.infer<typeof registerSchema>;

export const updateUserSchema = registerSchema.partial().extend({
  userId: z.string().uuid().optional(),
});

export type updateUserData = z.infer<typeof updateUserSchema>;
