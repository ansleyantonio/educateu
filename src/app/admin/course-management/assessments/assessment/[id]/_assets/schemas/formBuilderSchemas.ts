import { z } from "zod";

// 🧩 Base Schema for all elements
const formElementBaseSchema = z.object({
  id: z.string(),
  questionText: z.string(),
  point: z.number().min(0, "Point must be greater than or equal to 0"),
});

const multipleChoiceSchema = formElementBaseSchema.extend({
  type: z.literal("MULTIPLE_CHOICE"),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ).min(2, "At least two options are required"),
  answer: z.string().min(1, "At least one option must be selected"),
});

const multipleSelectSchema = formElementBaseSchema.extend({
  type: z.literal("MULTIPLE_SELECT"),
  options: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
    })
  ).min(2, "At least two options are required"),
  answer: z.array(z.string()).min(1, "At least one option must be selected"),
  partialMark: z.boolean().optional(),
});

const trueFalseSchema = formElementBaseSchema.extend({
  type: z.literal("TRUE_FALSE"),
  answer: z.boolean(),
});

const fillInBlankSchema = formElementBaseSchema.extend({
  type: z.literal("FILL_BLANK"),
  questionText: z
    .string()
    .refine(
      (val) => (val.match(/_/g) || []).length === 1,
      "Question must contain exactly one underscore (_)"
    ),
  answer: z.string(),
});

const matchingSchema = formElementBaseSchema.extend({
  type: z.literal("MATCHING"),
  options: z.object({
    leftSide: z.array(z.object({ id: z.string(), text: z.string() })),
    rightSide: z.array(z.object({ id: z.string(), text: z.string() })),
  }),
  answer: z.array(
    z.object({
      leftSideId: z.string(),
      rightSideId: z.string(),
    })
  ),
});

const numericalEntrySchema = formElementBaseSchema.extend({
  type: z.literal("NUMERICAL_ENTRY"),
  answer: z.object({
    correctValue: z.number(),
    tolerance: z.number(),
  })
});

const orderingSchema = formElementBaseSchema.extend({
  type: z.literal("ORDERING"),
  options: z.array(z.object({ id: z.string(), text: z.string() })), // Items to arrange
  answer: z.array(z.string()),
});

// types for assignment questions
const shortAnswerSchema = formElementBaseSchema.extend({
  placeholder: z.string().optional(),
  rubricName: z.string().optional(),
  rubricDescription: z.string().optional(),
  type: z.literal("SHORT_ANSWER"),
  submissionType: z.object({
    type: z.literal("SHORT_ANSWER"),
    maxLength: z.number().optional(),
  })
});

const essaySchema = formElementBaseSchema.extend({
  placeholder: z.string().optional(),
  rubricName: z.string().optional(),
  rubricDescription: z.string().optional(),
  type: z.literal("ESSAY"),
  submissionType: z.object({
    type: z.literal("ESSAY"),
    maxLength: z.number().optional(),
  })
});

const fileUploadSchema = formElementBaseSchema.extend({
  rubricName: z.string().optional(),
  rubricDescription: z.string().optional(),
  type: z.literal("FILE_UPLOAD"),
  submissionType: z.object({
    type: z.literal("FILE_UPLOAD"),
    maxFileSize: z.number().optional(),
    acceptedTypes: z.array(z.string()).optional(),
  })
});

const unkownSchema = formElementBaseSchema.extend({
  type: z.literal("UNKNOWN"),
});

export const formElementSchema = z.union([
  multipleChoiceSchema,
  multipleSelectSchema,
  trueFalseSchema,
  fillInBlankSchema,
  matchingSchema,
  shortAnswerSchema,
  essaySchema,
  numericalEntrySchema,
  orderingSchema,
  fileUploadSchema,
  unkownSchema,
]);

export const formElementTypeSchema = z.union([
  z.literal("MULTIPLE_CHOICE"),
  z.literal("MULTIPLE_SELECT"),
  z.literal("TRUE_FALSE"),
  z.literal("FILL_BLANK"),
  z.literal("MATCHING"),
  z.literal("SHORT_ANSWER"),
  z.literal("ESSAY"),
  z.literal("NUMERICAL_ENTRY"),
  z.literal("ORDERING"),
  z.literal("FILE_UPLOAD"),
  z.literal("UNKNOWN"),
]);

export const formSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  elements: z.array(formElementSchema),
});

export type Form = z.infer<typeof formSchema>;
export type FormElement = z.infer<typeof formElementSchema>;
export type FormElementType = z.infer<typeof formElementTypeSchema>;
