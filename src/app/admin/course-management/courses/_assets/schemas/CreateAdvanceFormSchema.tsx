/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  numberSchema,
  optionalNumberSchema,
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

const baseAdvanceCourseFormSchema = z.object({
  // Course Details
  title: textSchema({ label: "Course Title" }),
  code: z.string().optional(),
  courseType: z.string(),
  status: z.string().optional(),
  hesaCourseId: z.string().optional(),
  // advancedCourseType: z.string().optional(),
  degreeType: z.string().optional(),
  diplomaType: z.string().optional(),
  intendedAward: textSchema({ label: "Intended Award" }),
  courseDescription: z
    .string()
    .min(1, { message: "Course description is required" })
    .min(5, "Course Description must be at least 5 characters long"),
  // courseDescription: descriptionSchema({ label: "Course Description" }),
  studyModes: z
    .array(StudyModesEnum)
    .refine((value) => value.some((item) => item), {
      message: "At least one study mode must be selected.",
    }),

  // Academic Session and Duration
  startDate: z.union([z.string(), z.date()]).optional(),
  endDate: z.union([z.string(), z.date()]).optional(),
  //sessionId: z.string().min(1, "Select academic sessions is required"),
  numberOfSemesters: numberSchema,
  totalCredits: optionalNumberSchema,
  durationLength: numberSchema,
  yearOneExpectedCredits: optionalNumberSchema,
  yearTwoExpectedCredits: optionalNumberSchema,
  yearThreeExpectedCredits: optionalNumberSchema,
  yearFourExpectedCredits: optionalNumberSchema,
  minimumPassingCreditsPerYear: numberSchema,

  // awarding Body information
  awardingBodyId: textSchema({ label: "Awarding Body Name" }),
  // awardingBodyCode: optionalTextSchema,

  // Accreditation and Compliance
  accreditationBody: optionalTextSchema,
  accreditationStatus: z.string().optional(),
  qualificationAim: z.string().optional(),

  // Governance and Quality Assurance
  approvalDate: z.union([
    z.string({ required_error: "Course approval date is required" }),
    z.date({
      required_error: "Course approval date is required",
    }),
  ]),
  reviewDate: z.union([
    z.string({ required_error: "Course review date is required" }),
    z.date({
      required_error: "Course review date is required",
    }),
  ]),
  courseLeader: optionalTextSchema,
  governanceNotes: optionalTextSchema,
});

// DEGREE-specific required fields
const validateAllCourseConditions = (data: any, ctx: z.RefinementCtx) => {
  if (data.courseType === "DEGREE_COURSE") {
    const { durationLength, totalCredits, ...yearlyCredits } = data;
    const years = ["One", "Two", "Three", "Four"];

    // Validate total credits
    if (!totalCredits || isNaN(totalCredits)) {
      ctx.addIssue({
        path: ["totalCredits"],
        code: z.ZodIssueCode.custom,
        message: "Total credits is required.",
      });
    }

    // Calculate sum of required years only
    const calculatedSum = years
      .slice(0, durationLength)
      .reduce(
        (sum, year) => sum + (yearlyCredits[`year${year}ExpectedCredits`] ?? 0),
        0,
      );

    // Validate sum matches total
    if (calculatedSum !== totalCredits) {
      const message =
        "Total credits must equal the sum of all yearly distributions.";

      years.slice(0, durationLength).forEach((year) => {
        ctx.addIssue({
          path: [`year${year}ExpectedCredits`],
          code: z.ZodIssueCode.custom,
          message,
        });
      });
    }

    // Validate required yearly credits
    years.slice(0, durationLength).forEach((year) => {
      const credits = yearlyCredits[`year${year}ExpectedCredits`];
      if (credits === undefined) {
        ctx.addIssue({
          path: [`year${year}ExpectedCredits`],
          code: z.ZodIssueCode.custom,
          message: `Year ${year} credits are required.`,
        });
      }
    });
  }

  if (data.courseType === "DEGREE_COURSE" && !data.degreeType) {
    ctx.addIssue({
      path: ["degreeType"],
      code: z.ZodIssueCode.custom,
      message: "Degree type is required when course type is DEGREE.",
    });
  }

  if (data.courseType === "DIPLOMA_COURSE" && !data.diplomaType) {
    ctx.addIssue({
      path: ["diplomaType"],
      code: z.ZodIssueCode.custom,
      message: "Diploma type is required when course type is DIPLOMA.",
    });
  }

  ValidateDateGap({
    data,
    ctx,
    startKey: "startDate",
    endKey: "endDate",
    minGap: data.courseType === "DEGREE_COURSE" ? "1y" : "30d",
  });

  ValidateDateGap({
    data,
    ctx,
    startKey: "reviewDate",
    endKey: "approvalDate",
  });
};

// Final schemas
const CreateAdvanceCourseFormSchema = baseAdvanceCourseFormSchema.superRefine(
  validateAllCourseConditions,
);

const UpdateAdvanceCourseFormSchema = baseAdvanceCourseFormSchema
  .partial()
  .superRefine(validateAllCourseConditions);

// Types
export type IAdvanceCourseForm = z.infer<typeof CreateAdvanceCourseFormSchema>;
export type IUpdateAdvanceCourseForm = z.infer<
  typeof UpdateAdvanceCourseFormSchema
>;

export const AdvanceCourseSchema = {
  CreateAdvanceCourseFormSchema,
  UpdateAdvanceCourseFormSchema,
};
