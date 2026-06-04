import { z } from "zod";
export const EnRollmentEnum = z.enum(["INTERNAL", "EXTERNAL"]);

// In schema.ts
export const AgentCommissionGroupSchema = z.object({
  name: z.string(),
  type: EnRollmentEnum.default("INTERNAL"),
  bonus: z.number().optional().nullable(),
  studentLimit: z.number().int().positive().optional().nullable(),
});

export const AgreementTemplateSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    agreement: z.string().min(1, "HTML content is required"),
    awardingBodyId: z.string().uuid(),
    commissionGroupId: z.string().uuid(),
    templateType: z.enum(["INTERNAL", "EXTERNAL"]).default("INTERNAL"),
  })
  .strict();

export const AgreementTemplateUpdateSchema =
  AgreementTemplateSchema.partial().extend({
    id: z.string().uuid(),
  });

export const ExpiryRemainderSchema = z
  .object({
    id: z.string().uuid().optional(),
    daysBefore: z.number().int().positive(),
  })
  .strict();

export const CommissionSchema = z
  .object({
    studentRangeLower: z.number().int().positive(),
    studentRangeUpper: z.number().int().positive().optional(),
    rate1: z.number().optional(),
    rate2: z.number().optional(),
    rate3: z.number().optional(),
    rate4: z.number().optional(),
  })
  .strict();

export const CommissionBulkCreateSchema = z
  .object({
    commissionGroupId: z.string().uuid(),
    bonus: z.number().optional().nullable(),
    // studentLimit: z.number().int().positive().optional().nullable(),
    studentLimit: z.number().int().nonnegative().optional().nullable(),

    commissions: z.array(CommissionSchema).nonempty(),
  })
  .strict();

export const CommissionResponseSchema = z
  .object({
    id: z.string().uuid(),
    studentRangeLower: z.number().int().positive(),
    studentRangeUpper: z.number().int().positive().nullable(),
    // bonus: z.number().nullable(),
    rate1: z.number().nullable(),
    rate2: z.number().nullable(),
    rate3: z.number().nullable(),
    rate4: z.number().nullable(),
  })
  .strict();

export const CommissionGroupResponseSchema = z
  .object({
    commissionGroupId: z.string().uuid(),
    commissionGroupName: z.string(),
    studentLimit: z.number().int().positive().nullable(),
    bonus: z.number().nullable(),
    type: z.enum(["INTERNAL", "EXTERNAL"]),
    commissions: z.array(CommissionResponseSchema),
  })
  .strict();

// Add to your schema.ts
export const CommissionGroupFilterSchema = z
  .object({
    type: z.enum(["INTERNAL", "EXTERNAL"]).optional(),
  })
  .strict();

export const CommissionGroupUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    type: EnRollmentEnum.optional(),
  })
  .strict()
  .refine((data) => data.name || data.type, {
    message: "At least one field (name or type) must be provided",
    path: ["name_or_type"],
  });

export type CommissionGroupUpdateInput = z.infer<
  typeof CommissionGroupUpdateSchema
>;
export const createVariableSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
});
export type CreateVariableInput = z.infer<typeof createVariableSchema>;

// TypeScript types derived from Zod schemas
export type CommissionResponse = z.infer<typeof CommissionResponseSchema>;
export type CommissionGroupResponse = z.infer<
  typeof CommissionGroupResponseSchema
>;
export type CommissionInput = z.infer<typeof CommissionSchema>;
export type CommissionBulkCreateInput = z.infer<
  typeof CommissionBulkCreateSchema
>;
export type AgentCommissionGroup = z.infer<typeof AgentCommissionGroupSchema>;
export type AgreementTemplateType = z.infer<typeof AgreementTemplateSchema>;
export type ExpiryRemainder = z.infer<typeof ExpiryRemainderSchema>;
export type AgreementTemplateUpdateType = z.infer<
  typeof AgreementTemplateUpdateSchema
>;
