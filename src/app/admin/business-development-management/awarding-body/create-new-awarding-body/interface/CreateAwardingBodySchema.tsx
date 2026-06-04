import { z } from "zod";

export const MonthEnum = z.enum([
  "january-april",
  "may-august",
  "september-december",
]);

export const RequiredDocumentEnum = z.enum([
  "passport-id",
  "transcripts",
  "essay",
  "cv",
  "proof-of-name-change",
  "english-certificates",
  "personal-statement",
  "qualification",
  "other",
  "consent-form",
  "national-identification",
  "police-clearance",
  "references"
]);

export const StatusEnum = z.enum(["ACTIVE", "INACTIVE"]);

export const GradeSchema = z.object({
  classification: z.string().min(1, "Classification is required"),
  percentageRange: z.string().min(1, "Percentage Range is required"),
  ukGpaEquivalent: z
    .number()
    .min(0, "GPA cannot be less than 0")
    .max(5, "GPA cannot be more than 5")
    .optional(),
});

export const CreateAwardingBodyFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  abbreviation: z.string().min(1, "Abbreviation is required"),
  intakePeriod: z.array(MonthEnum).min(1, "At least one intake period required"),
  grades: z.array(GradeSchema).min(1, "At least one grade is required"),
  selectRequiredDocuments: z
    .array(RequiredDocumentEnum)
    .min(1, "Select at least one document"),
  status: StatusEnum,
});

export const UpdateAwardingBodyFormSchema = CreateAwardingBodyFormSchema.partial().extend({
  intakePeriod: z.array(MonthEnum).min(1).optional(),
  grades: z.array(GradeSchema).optional(),
  selectRequiredDocuments: z.array(RequiredDocumentEnum).min(1).optional(),
  status: StatusEnum.optional(),
});

export const AwardingBodyFilterSchema = z.object({
  intakePeriod: z.array(MonthEnum).optional(),
  selectRequiredDocuments: z.array(RequiredDocumentEnum).optional(),
  status: StatusEnum.optional(),
  searchText: z.string().optional(),
});

export type CreateAwardingBodyInput = z.infer<typeof CreateAwardingBodyFormSchema>;
export type UpdateAwardingBodyInput = z.infer<typeof UpdateAwardingBodyFormSchema>;