/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  descriptionSchema,
  numberSchema,
  optionalTextSchema,
  textSchema,
} from "@/lib/SchemaType/validationSchema";
import { ValidateDateGap } from "@/utils/DateGapValidator";
import { z } from "zod";

const StudyModesEnum = z.enum([
  "INSTRUCTOR_LED",
  "COHORT_BASED",
  "BLENDED_OR_HYBRID_LEARNING",
  "SELF_PACED",
]);

const StatusEnum = z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]);

const basicSchema = z.object({
  // General Course Information
  title: textSchema({ label: "Course Title" }),
  code: z.string().optional(),
  courseType: z.string(),
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  courseDescription: descriptionSchema({
    max: 1200,
    label: "Course Description",
  }),
  durationLength: numberSchema,
  studyModes: z.array(StudyModesEnum),
  status: z.string(StatusEnum).optional(),
  // Accredition
  professionalAccreditation: z
    .string()
    .min(1, "Professional Accreditation is required"),
  accreditationBodyCode: optionalTextSchema,
  accreditationStatus: z.string().optional(),
  accreditationStartDate: z.union([z.string(), z.date()]).optional(),
  accreditationEndDate: z.union([z.string(), z.date()]).optional(),

  // Financial Information
  // courseFees: numberSchema,
  // fundingModel: z.string().optional(),
  // eligibleForSponsorship: z.string().min(1, "Select Eligible for Sponsorship"),
});

const validateAllCourseConditions = (data: any, ctx: z.RefinementCtx) => {
  ValidateDateGap({
    data,
    ctx,
    startKey: "startDate",
    endKey: "endDate",
    minGap: "30d",
  });
};
const CreateFormSchema = basicSchema.superRefine(validateAllCourseConditions);

const updateFormSchema = basicSchema
  .partial()
  .superRefine(validateAllCourseConditions);
export type FormValueType = z.infer<typeof CreateFormSchema>;
export const ProfessionalCourse = {
  CreateFormSchema,
  updateFormSchema,
};
