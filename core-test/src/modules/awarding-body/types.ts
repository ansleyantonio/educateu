import { z } from "zod";

export const AwardingBodyStatusSchema = z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE");

export const MonthEnum = z.enum(["january-april", "may-august", "september-december"]);

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
  "references",
]);
export const GradeSchema = z.object({
  classification: z.string().min(1, "Classification is required"),
  percentageRange: z.string().optional(),
  ukGpaEquivalent: z.number().min(0).max(5),
});

// Main AwardingBody schema
export const AwardingBodySchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    code: z.string().min(1, "Code is required"),
    abbreviation: z.string().min(1, "Abbreviation is required"),
    intakePeriod: z.array(MonthEnum).min(1, "At least one intake period is required"),
    classification: z.string().min(1, "Classification is required"),
    percentageRange: z.string().optional(),
    ukGpaEquivalent: z.number().positive().min(0).max(5).optional(),
    selectRequiredDocuments: z.array(RequiredDocumentEnum).min(1, "At least one document is required"),
    status: AwardingBodyStatusSchema,
    newGrade: z.array(GradeSchema).min(1, "At least one grade object is required"),
  })
  .strict()
  .partial();

// Type exports
export type AwardingBodyStatus = z.infer<typeof AwardingBodyStatusSchema>;
export type Month = z.infer<typeof MonthEnum>;
export type RequiredDocument = z.infer<typeof RequiredDocumentEnum>;
export type AwardingBody = z.infer<typeof AwardingBodySchema>;
