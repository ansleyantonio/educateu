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
      .optional(),
    companyName: z.string().optional(),
    aggrementExpiryDate: z.string().optional(),
    potentialPayment: z.string().optional(),
    commissionGroupId: z.string().optional(),
    commitionRate: z.string().optional(),
    // agentType: z.enum(["INTERNAL", "EXTERNAL"]),
    agentType: agentTypeSchema,
    commissionTemplate: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    note: z.string().optional(),
    agreementStatus: z.boolean().default(true).optional(),
    awardingBodyTemplates: z.array(awardingBodyTemplateSchema),
    activityStatus: z
      .enum(["PENDING", "ACTIVE", "DEACTIVATED", "SUSPENDED"])
      .optional(),

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

export const AgentSettingSchema = z
  .object({
    id: z.string().uuid().optional(), // UUID, auto-generated
    internalCommissionTamplate: z
      .string()
      .min(1, "Internal Commission Template is required"),
    externalCommissionTamplate: z
      .string()
      .min(1, "External Commission Template is required"),
    agentEnrollment: z.string().min(1, "Agent Enrollment is required"),
    applicationsubmission: z.boolean().default(false), // Defaults to false
    internalAgreementTamplate: z
      .string()
      .min(1, "Internal Agreement Template is required"),
    externalAgreementTamplate: z
      .string()
      .min(1, "External Agreement Template is required"),
    expiryDate: z.string().min(1, "Expiry Date is required"), // String type (consider using `z.date()` if it's a real date)
  })
  .strict(); // Disallows additional properties

export const updateAgreementSchema = z
  .object({
    userId: z.string().uuid(),
    agreementId: z.string().uuid(),
    status: z.enum(["ACTIVE", "INACTIVE"]),
  })
  .strict();

export const upgradeTemplateSchema = z
  .object({
    userId: z.string().uuid({
      message: "userId must be a valid UUID",
    }),
    commissionTemplateId: z.string().uuid().optional(),
    matchId: z.string().optional(),
  })
  .strict();

export type UpgradeTemplateInput = z.infer<typeof upgradeTemplateSchema>;
export type updateAgreementType = z.infer<typeof updateAgreementSchema>;
// Define a Partial Schema for updates (all fields optional)
export const PartialAgentSettingSchema = AgentSettingSchema.partial();

// Define TypeScript types from the schema
export type AgentSettingType = z.infer<typeof AgentSettingSchema>;
export type PartialAgentSettingType = z.infer<typeof PartialAgentSettingSchema>;

export const querySchema = z.object({
  page: z
    .string()
    .optional()
    .default("1")
    .transform((val) => parseInt(val, 10)),
  pageSize: z
    .string()
    .optional()
    .default("10")
    .transform((val) => parseInt(val, 10)),
  name: z.string().optional().default(""),
  status: z.string().optional().default(""),
});

export type QueryParams = z.infer<typeof querySchema>;
