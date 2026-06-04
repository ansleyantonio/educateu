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

export const certificateFormSchema = z.object({
  studyModes: z.array(StudyModesEnum).optional(),
  title: z.string().optional(),
  status: z.array(z.string()).optional(),
  durationLength: optionalNumberSchema,
  accreditationStatus: z.string(AccreditationStatusEnum).optional(),
  professionalAccreditation: z.string().optional(),
});

export type ICertificateFilterForm = z.infer<typeof certificateFormSchema>;
