import {
  optionalNumberSchema,
  optionalTextSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const StudyModesEnum = z.enum([
  "INSTRUCTOR_LED",
  "COHORT_BASED",
  "BLENDED_OR_HYBRID_LEARNING",
  "SELF_PACED",
]);

export const courseFilterFormSchema = z.object({
  title: optionalTextSchema,
  code: optionalTextSchema,
  status: z.array(z.string()).optional(),
  studyModes: z.array(StudyModesEnum).optional(),
  //  advancedCourseType: optionalTextSchema,
  durationLength: optionalNumberSchema,
  numberOfSemesters: optionalNumberSchema,
});

export type IAdvanceCourseFilterForm = z.infer<typeof courseFilterFormSchema>;
