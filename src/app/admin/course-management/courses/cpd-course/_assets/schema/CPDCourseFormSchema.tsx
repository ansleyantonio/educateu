import {
  numberSchema,
  optionalTextSchema,
  textSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const StudyModesEnum = z.enum([
  "INSTRUCTOR_LED",
  "COHORT_BASED",
  "BLENDED_OR_HYBRID_LEARNING",
  "SELF_PACED",
]);

const createCPDCourse = z.object({
  // General Course Information
  title: textSchema({ label: "Course Title" }),
  courseType: z.string(),
  code: z.string().optional(),
  courseDescription: optionalTextSchema,
  durationLength: numberSchema,

  studyModes: z.array(StudyModesEnum).optional(),
  // Accredition
  // duration: textSchema(),
  professionalAccreditation: textSchema({ label: "Accreditation Body" }),
  accreditationBodyCode: z.string().optional(),
  accreditationStartDate: z.union([z.string(), z.date()]).optional(),
  accreditationEndDate: z.union([z.string(), z.date()]).optional(),

  // Financial Information
  // fees: numberSchema,
  // fundingModel: z.string().optional(),
  // eligibleForSponsorship: z
  //   .string()
  //   .min(1, "Select Eligible for Sponsorship")
  //   .default("No"),
});

const updateCPDCourse = createCPDCourse.partial();
export type CPDCourseType = z.infer<typeof createCPDCourse>;

export const CPDCourseSchema = {
  createCPDCourse,
  updateCPDCourse,
};
