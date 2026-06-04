import { optionalNumberSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const StudyModesEnum = z.enum([
  "INSTRUCTOR_LED",
  "COHORT_BASED",
  "BLENDED_OR_HYBRID_LEARNING",
  "SELF_PACED",
]);

const AccreditationStatusEnum = z.enum([
  "ACCREDITED",
  "PROVISIONALLY_ACCREDITED",
  "NOT_ACCREDITED",
]);

const StatusEnum = z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]);

export const courseFormSchema = z.object({
  studyModes: z.array(StudyModesEnum).optional(),
  title: z.string().optional(),
  code: z.string().optional(),
  status: z.string(StatusEnum).optional(),
  durationLength: optionalNumberSchema,
  accreditationStatus: z.string(AccreditationStatusEnum).optional(),
  professionalAccreditation: z.string().optional(),
});

export type IProfCertCourseFilterForm = z.infer<typeof courseFormSchema>;
