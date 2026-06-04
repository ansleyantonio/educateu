import { z } from "zod";
import { generateUniqueCode } from "../../utils/miscUtils";

// Schema for validating AssessmentCategory enum
export const AssessmentCategorySchema = z.enum(["QUIZ", "ASSIGNMENT"]);

// Schema for validating AssessmentType enum
export const AssessmentTypeSchema = z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL"]);

// Schema for validating AssessmentStatus enum
export const AssessmentStatusSchema = z.enum(["DRAFT", "PUBLISHED"]);

// Schema for validating QuizQuestionType enum
export const QuizQuestionTypeSchema = z.enum([
  "MULTIPLE_CHOICE",
  "MULTIPLE_SELECT",
  "FILL_BLANK",
  "TRUE_FALSE",
  "MATCHING",
  "NUMERICAL_ENTRY",
  "ORDERING",
]);

// Schema for creating an assessment (excluding auto-generated fields)
export const CreateAssessmentSchema = z
  .object({
    nameOrTitle: z.string().min(1, "Name or title is required"),
    assessmentCode: z.string().min(1, "Assessment code is required").optional().default(generateUniqueCode),
    assessmentCategory: AssessmentCategorySchema,
    assessmentType: AssessmentTypeSchema,
    questionSize: z.number().int().min(0).optional(),
    descriptionOrInstructions: z.string().min(1, "Description or instructions is required"),
    availableStartDate: z.coerce.date(),
    availableEndDate: z.coerce.date(),
    timeLimit: z.number().int().min(0, "Time limit must be a non-negative integer"),
    totalPointsOrWeight: z.number().int().min(0, "Total points or weight must be a non-negative integer"),
    weight: z.number().int().min(0, "Weight must be a non-negative integer").optional().default(0),
    passingScore: z.number().int().min(0).optional(),
    attempts: z.number().int().min(1, "Attempts must be at least 1"),
    lateSubmissions: z.boolean(),
    dueDate: z.coerce.date().optional(),
    awardingBodyId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      // If assessmentType is DEGREE or DIPLOMA, awardingBodyId is required
      if ((data.assessmentType === "DEGREE" || data.assessmentType === "DIPLOMA") && !data.awardingBodyId) {
        return false;
      }
      // If assessmentType is CPD or PROFESSIONAL, awardingBodyId should not be provided
      if ((data.assessmentType === "CPD" || data.assessmentType === "PROFESSIONAL") && data.awardingBodyId) {
        return false;
      }
      return true;
    },
    {
      message:
        "awardingBodyId is required for DEGREE/DIPLOMA assessments and must not be provided for CPD/PROFESSIONAL assessments",
      path: ["awardingBodyId"],
    },
  )
  .refine(
    (data) => {
      // questionSize is required for QUIZ assessments and should not be provided for ASSIGNMENT assessments
      if (data.assessmentCategory === "QUIZ") {
        return data.questionSize !== undefined && data.questionSize !== null && data.questionSize >= 0;
      }
      if (data.assessmentCategory === "ASSIGNMENT") {
        return data.questionSize === undefined || data.questionSize === null;
      }
      return true;
    },
    {
      message: "questionSize is required for QUIZ assessments and must not be provided for ASSIGNMENT assessments",
      path: ["questionSize"],
    },
  )
  .refine(
    (data) => {
      // Ensure availableStartDate is not after availableEndDate
      return new Date(data.availableStartDate) <= new Date(data.availableEndDate);
    },
    {
      message: "Start date must not be after end date",
      path: ["availableStartDate"],
    },
  )
  .refine(
    (data) => {
      // Ensure dueDate is not after availableEndDate if both are provided
      if (data.dueDate) {
        return new Date(data.dueDate) <= new Date(data.availableEndDate);
      }
      return true;
    },
    {
      message: "Due date must not be after end date",
      path: ["dueDate"],
    },
  );

// Schema for validating create assessment request body
export const createAssessmentReqBodySchema = CreateAssessmentSchema;

// Schema for updating an assessment (all fields optional except category and type which are immutable)
export const UpdateAssessmentSchema = z
  .object({
    nameOrTitle: z.string().min(1, "Name or title is required").optional(),
    assessmentCode: z.string().min(1, "Assessment code is required").optional(),
    questionSize: z.number().int().min(0).optional(),
    descriptionOrInstructions: z.string().min(1, "Description or instructions is required").optional(),
    status: AssessmentStatusSchema.optional(),
    availableStartDate: z.coerce.date().optional(),
    availableEndDate: z.coerce.date().optional(),
    timeLimit: z.number().int().min(0, "Time limit must be a non-negative integer").optional(),
    totalPointsOrWeight: z.number().int().min(0, "Total points or weight must be a non-negative integer").optional(),
    weight: z.number().int().min(0, "Weight must be a non-negative integer").optional(),
    passingScore: z.number().int().min(0).optional(),
    attempts: z.number().int().min(1, "Attempts must be at least 1").optional(),
    lateSubmissions: z.boolean().optional(),
    dueDate: z.coerce.date().optional(),
    awardingBodyId: z.string().uuid().optional(),
  })

  .refine(
    (data) => {
      // Ensure availableStartDate is not after availableEndDate if both are provided
      if (data.availableStartDate && data.availableEndDate) {
        return new Date(data.availableStartDate) <= new Date(data.availableEndDate);
      }
      return true;
    },
    {
      message: "Start date must not be after end date",
      path: ["availableStartDate"],
    },
  )
  .refine(
    (data) => {
      // Ensure dueDate is not after availableEndDate if both are provided
      if (data.dueDate && data.availableEndDate) {
        return new Date(data.dueDate) <= new Date(data.availableEndDate);
      }
      return true;
    },
    {
      message: "Due date must not be after end date",
      path: ["dueDate"],
    },
  );

// Schema for validating update assessment request body
export const updateAssessmentReqBodySchema = UpdateAssessmentSchema;

// Schema for validating assessment ID parameter
export const assessmentIdParamSchema = z.object({
  id: z.string().uuid("Assessment ID must be a valid UUID"),
});

// Schema for creating a quiz question
export const CreateQuizQuestionSchema = z.object({
  type: QuizQuestionTypeSchema,
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating create quiz question request body
export const createQuizQuestionReqBodySchema = CreateQuizQuestionSchema;

// Schema for validating assessment ID parameter for nested routes
export const assessmentIdParamForQuizQuestionSchema = z.object({
  assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
});

// Schema for updating a quiz question (only optional fields)
// Schema for updating question text and point (always valid)
const BaseUpdateQuizQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required").optional(),
  point: z.number().int().min(0, "Point value must be a non-negative integer").optional(),
});

// Specific schemas for options and answer based on question type
const MultipleChoiceOptionsSchema = z.array(
  z.object({
    id: z.string().optional(),
    text: z.string(),
    isCorrect: z.boolean().optional(),
  }),
);

const MultipleSelectOptionsSchema = z.array(
  z.object({
    id: z.string().optional(),
    text: z.string(),
    isCorrect: z.boolean().optional(),
  }),
);

const TrueFalseOptionsSchema = z.tuple([
  z.object({ text: z.literal("True"), isCorrect: z.boolean().optional() }),
  z.object({ text: z.literal("False"), isCorrect: z.boolean().optional() }),
]);

const FillBlankOptionsSchema = z.array(z.string()).optional(); // Additional acceptable answers

const MatchingOptionsSchema = z.object({
  leftSide: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
  rightSide: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    }),
  ),
});

const NumericalEntryOptionsSchema = z
  .object({
    unit: z.string().optional(), // Unit of measurement
    format: z.string().optional(), // Expected format
  })
  .optional();

const OrderingOptionsSchema = z.array(
  z.object({
    id: z.string(),
    text: z.string(),
    position: z.number().optional(),
  }),
);

// Answer schemas for different question types
const MultipleChoiceAnswerSchema = z.union([
  z.string(), // ID of correct option
  z.number(), // Index of correct option
]);

const MultipleSelectAnswerSchema = z.array(z.union([z.string(), z.number()])); // Array of correct option IDs or indices

const TrueFalseAnswerSchema = z.boolean();

const FillBlankAnswerSchema = z.union([
  z.string(), // Single correct answer
  z.array(z.string()), // Multiple acceptable answers
]);

const MatchingAnswerSchema = z.array(
  z.object({
    leftSideId: z.string(), // ID of left item
    rightSideId: z.string(), // ID of right item
  }),
);

const NumericalEntryAnswerSchema = z.object({
  correctValue: z.number(), // The correct numeric value
  tolerance: z.number().optional(), // Optional tolerance for acceptance range
});

const OrderingAnswerSchema = z.array(z.union([z.string(), z.number()])); // Array showing correct order of item indices or IDs

// For now, keeping the simple schema but with better validation
// We'll implement the type-specific validation in the service layer
export const UpdateQuizQuestionSchema = z
  .object({
    questionText: z.string().min(1, "Question text is required").optional(),
    point: z.number().int().min(0, "Point value must be a non-negative integer").optional(),
    options: z.any().optional(), // Will be validated in service based on question type
    answer: z.any().optional(), // Will be validated in service based on question type
    partialMark: z.boolean().optional(), // Optional field for MULTI_SELECT questions
  })
  .refine((data) => {
    // If the question type is MULTIPLE_SELECT, partialMark is required
    // Note: We need to check the original question type in the service layer since it might not be in the update data
    return true; // Basic validation, with more specific validation in service
  });

// Schema for creating a quiz question with partialMark
export const CreateQuizQuestionSchemaWithPartialMark = CreateQuizQuestionSchema.extend({
  questionText: z.string().min(1, "Question text is required"),
  point: z.number().int().min(0, "Point value must be a non-negative integer"),
  options: z.any().optional(),
  answer: z.any().optional(),
  partialMark: z.boolean().optional(), // Optional field that will be required for MULTI_SELECT in service validation
});

// Schema for validating update quiz question request body
export const updateQuizQuestionReqBodySchema = UpdateQuizQuestionSchema;

// Schema for updating a quiz question index
export const UpdateQuizQuestionIndexSchema = z.object({
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating update quiz question index request body
export const updateQuizQuestionIndexReqBodySchema = UpdateQuizQuestionIndexSchema;

// Schema for validating get quiz questions query parameters
export const getQuizQuestionsReqQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// Schema for creating an assignment question
export const CreateAssignmentQuestionSchema = z.object({
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating create assignment question request body
export const createAssignmentQuestionReqBodySchema = CreateAssignmentQuestionSchema;

// Schema for updating an assignment question (only optional fields)
export const UpdateAssignmentQuestionSchema = z.object({
  questionText: z.string().min(1, "Question text is required").optional(),
  submissionType: z.any().optional(), // Submission type can be any JSON structure
  point: z.number().int().min(0, "Point value must be a non-negative integer").optional(),
  rubricName: z.string().optional(),
  rubricDescription: z.string().optional(),
});

// Schema for validating update assignment question request body
export const updateAssignmentQuestionReqBodySchema = UpdateAssignmentQuestionSchema;

// Schema for updating an assignment question index
export const UpdateAssignmentQuestionIndexSchema = z.object({
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating update assignment question index request body
export const updateAssignmentQuestionIndexReqBodySchema = UpdateAssignmentQuestionIndexSchema;

// Schema for validating get assignment questions query parameters
export const getAssignmentQuestionsReqQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// Schema for creating a rubric criteria
export const CreateRubricCriteriaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  weight: z.number().int().min(0, "Weight must be a non-negative integer"),
  levels: z
    .array(
      z.object({
        name: z.string().min(1, "Level name is required"),
        description: z.string().min(1, "Level description is required"),
        weight: z.number().int().min(0, "Level weight must be a non-negative integer"),
      }),
    )
    .optional()
    .default([]),
});

// Schema for connecting an existing rubric criteria
export const ConnectExistingRubricCriteriaSchema = z.object({
  type: z.literal("existing"),
  rubricCriteriaId: z.string().uuid("Rubric criteria ID must be a valid UUID"),
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for creating a new rubric criteria
export const CreateNewRubricCriteriaSchema = z.object({
  type: z.literal("new"),
  data: CreateRubricCriteriaSchema,
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for either connecting existing or creating new rubric criteria
export const RubricCriteriaConnectionSchema = z.discriminatedUnion("type", [
  ConnectExistingRubricCriteriaSchema,
  CreateNewRubricCriteriaSchema,
]);

// Schema for validating create rubric criteria with mix of existing and new request body
export const createRubricCriteriaReqBodySchema = z.object({
  rubricCriteriaConnections: z
    .array(RubricCriteriaConnectionSchema)
    .nonempty("At least one rubric criteria connection is required"),
  rubricName: z.string().min(1, "Rubric name is required when rubric fields are empty").optional(),
  rubricDescription: z.string().min(1, "Rubric description is required when rubric fields are empty").optional(),
});

// Schema for validating get assessments request query
export const getAssessmentsReqQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  assessmentCode: z.string().min(1).optional(),
  assessmentCategory: AssessmentCategorySchema.optional(),
  assessmentType: AssessmentTypeSchema.optional(),
  timeLimit: z.coerce.number().int().min(1).optional(),
  totalPointsOrWeight: z.coerce.number().int().min(1).optional(),
  searchTerm: z.string().min(1).optional(),
});

// Schema for getting rubric criteria response
export const getRubricCriteriaResponseSchema = z.object({
  status: z.literal("success"),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.object({
    rubricCriteria: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        description: z.string(),
        weight: z.number().min(0),
        levelName: z.string().min(1),
        levelDescription: z.string(),
        levels: z.array(
          z.object({
            name: z.string().min(1),
            description: z.string(),
            weight: z.number().min(0),
          }),
        ),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        assignmentQuestionId: z.string().uuid(),
      }),
    ),
  }),
});

// Schema for getting single rubric criteria response
export const getSingleRubricCriteriaResponseSchema = z.object({
  status: z.literal("success"),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.object({
    rubricCriteria: z.object({
      id: z.string().uuid(),
      name: z.string().min(1),
      description: z.string(),
      weight: z.number().min(0),
      levelName: z.string().min(1),
      levelDescription: z.string(),
      levels: z.array(
        z.object({
          name: z.string().min(1),
          description: z.string(),
          weight: z.number().min(0),
        }),
      ),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
      assignmentQuestionId: z.string().uuid(),
    }),
  }),
});

// Schema for validating rubric criteria ID parameter
export const rubricCriteriaIdParamSchema = z.object({
  id: z.string().uuid("Rubric criteria ID must be a valid UUID"),
});

// Schema for updating a rubric criteria (only non-relational fields)
export const UpdateRubricCriteriaSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  weight: z.number().int().min(0, "Weight must be a non-negative integer").optional(),
  levels: z
    .array(
      z.object({
        name: z.string().min(1, "Level name is required"),
        description: z.string().min(1, "Level description is required"),
        weight: z.number().int().min(0, "Level weight must be a non-negative integer"),
      }),
    )
    .optional(),
});

// Schema for validating update rubric criteria request body
export const updateRubricCriteriaReqBodySchema = UpdateRubricCriteriaSchema;

// Schema for updating a rubric criteria index
export const UpdateRubricCriteriaIndexSchema = z.object({
  index: z.number().int().min(0, "Index must be a non-negative integer"),
});

// Schema for validating update rubric criteria index request body
export const updateRubricCriteriaIndexReqBodySchema = UpdateRubricCriteriaIndexSchema;

// Schema for creating a rubric template from an assignment question
export const CreateRubricTemplateFromAssignmentQuestionSchema = z.object({
  templateName: z.string().min(1, "Template name is required"),
});

// Schema for validating create rubric template request body
export const createRubricTemplateFromAssignmentQuestionReqBodySchema = CreateRubricTemplateFromAssignmentQuestionSchema;

// Schema for getting rubric templates response
export const getRubricTemplatesResponseSchema = z.object({
  status: z.literal("success"),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.object({
    rubricTemplates: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        rubricCriteriaOrder: z.unknown().optional(), // JSON field
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        rubricCriteria: z.array(
          z.object({
            id: z.string().uuid(),
            name: z.string().min(1),
            description: z.string(),
            weight: z.number().min(0),
            levelName: z.string().min(1),
            levelDescription: z.string(),
            levels: z.array(
              z.object({
                name: z.string().min(1),
                description: z.string(),
                weight: z.number().min(0),
              }),
            ),
            createdAt: z.string().datetime(),
            updatedAt: z.string().datetime(),
            assignmentQuestionId: z.string().uuid(),
          }),
        ),
      }),
    ),
  }),
});

// Schema for getting rubric criteria for a template response
export const getRubricCriteriaForTemplateResponseSchema = z.object({
  status: z.literal("success"),
  statusCode: z.literal(200),
  message: z.string(),
  data: z.object({
    templateId: z.string().uuid(),
    templateName: z.string(),
    rubricCriteria: z.array(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1),
        description: z.string(),
        weight: z.number().min(0),
        levelName: z.string().min(1),
        levelDescription: z.string(),
        levels: z.array(
          z.object({
            name: z.string().min(1),
            description: z.string(),
            weight: z.number().min(0),
          }),
        ),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
        assignmentQuestionId: z.string().uuid(),
      }),
    ),
  }),
});

// Type exports
export type AssessmentCategory = z.infer<typeof AssessmentCategorySchema>;
export type AssessmentType = z.infer<typeof AssessmentTypeSchema>;
export type AssessmentStatus = z.infer<typeof AssessmentStatusSchema>;
// Answer schemas for different question types
export type QuizQuestionType = z.infer<typeof QuizQuestionTypeSchema>;
export type CreateAssessment = z.infer<typeof CreateAssessmentSchema>;
export type UpdateAssessment = z.infer<typeof UpdateAssessmentSchema>;
export type CreateQuizQuestion = z.infer<typeof CreateQuizQuestionSchema>;

export type RubricCriteriaLevel = {
  name: string;
  description: string;
  weight: number;
};

export type CreateRubricCriteria = z.infer<typeof CreateRubricCriteriaSchema>;
export type UpdateRubricCriteria = z.infer<typeof UpdateRubricCriteriaSchema>;

// Define a type for handling RubricCriteria from Prisma which has levels as JsonValue
export type PrismaRubricCriteria = {
  id: string;
  name: string;
  description: string;
  weight: number;
  levels: import("@prisma/client/runtime/library").JsonValue;
  createdAt: Date;
  updatedAt: Date;
  assignmentQuestionId: string | null;
  rubricTemplateId: string | null;
};
