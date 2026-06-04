import {
  optionalNumberSchema,
  optionalTextSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const baseSchema = {
  nameOrTitle: z.string().min(1, "Name or title is required"),
  assessmentCode: z.string().optional(),
  assessmentCategory: z.enum(["QUIZ", "ASSIGNMENT"], {
    required_error: "Assessment category is required",
  }),
  assessmentType: z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL"], {
    required_error: "Assessment type is required",
  }),
  questionSize: z
    .number()
    .min(1, "Question size is required")
    .positive("Question size must be positive")
    .optional(),
  descriptionOrInstructions: z
    .string()
    .min(5, "Description or instructions should be at least 5 characters"),
  availableStartDate: z
    .date({
      required_error: "Available start date is required",
    })
    .optional(),
  availableEndDate: z
    .date({
      required_error: "Available end date is required",
    })
    .optional(),
  timeType: z.enum(["minutes", "hours"]).default("minutes"),
  timeLimit: z
    .number()
    .min(1, "Time limit is required")
    .positive("Time limit must be positive"),
  totalPointsOrWeight: z
    .number()
    .min(1, "Total points or weight is required")
    .positive("Total points or weight must be positive"),
  attempts: z
    .number()
    .min(1, "Number of attempts is required")
    .int("Attempts must be an integer")
    .positive("Attempts must be positive"),
  lateSubmissions: z.boolean().default(false),
  passingScore: z
    .number()
    .min(0, "Passing score must be non-negative")
    .optional(),
  dueDate: z.date().optional(),
  awardingBodyId: z
    .string()
    .uuid("Awarding body ID must be a valid UUID")
    .optional(),
};

// Use superRefine to dynamically check assessmentType from the data
const createAssessmentSchema = z.object(baseSchema).superRefine((data, ctx) => {
  // Require dates on final submission
  if (!data.availableStartDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availableStartDate"],
      message: "Available start date is required",
    });
  }
  if (!data.availableEndDate) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["availableEndDate"],
      message: "Available end date is required",
    });
  }

  // Validate date order if both dates exist
  if (data.availableStartDate && data.availableEndDate) {
    if (data.availableEndDate < data.availableStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["availableEndDate"],
        message:
          "Available end date must be greater than or equal to available start date",
      });
    }
  }

  // Validate due date if it exists
  if (data.dueDate) {
    if (data.availableStartDate && data.dueDate < data.availableStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message:
          "Due date must be greater than or equal to available start date",
      });
    }
    if (data.availableEndDate && data.dueDate > data.availableEndDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date must be less than or equal to available end date",
      });
    }
  }

  // Conditionally require awardingBodyId for DEGREE and DIPLOMA
  if (data.assessmentType === "DEGREE" || data.assessmentType === "DIPLOMA") {
    if (!data.awardingBodyId || data.awardingBodyId.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["awardingBodyId"],
        message: "Awarding body is required for DEGREE and DIPLOMA assessments",
      });
    }
  }

  //  require questionSize for QUIZ category
  if (data.assessmentCategory === "QUIZ") {
    if (!data.questionSize || data.questionSize <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["questionSize"],
        message: "Question Size is required for Quiz assessments",
      });
    }
  }
});

/* ----------------------------- Filter Schema ----------------------------- */
export const FilterAssessmentSchema = z.object({
  assessmentCode: optionalTextSchema,
  assessmentCategory: optionalTextSchema,
  assessmentType: optionalTextSchema,
  timeLimit: optionalNumberSchema,
});

/* ----------------------------- Types ----------------------------- */
export type IFilterAssessmentForm = z.infer<typeof FilterAssessmentSchema>;

/* ----------------------------- Export ----------------------------- */
export const AssessmentSchema = {
  create: createAssessmentSchema,
  filter: FilterAssessmentSchema,
};
