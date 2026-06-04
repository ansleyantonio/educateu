import { z } from "zod";
import { generateUniqueCode } from "../../utils/miscUtils";

// Enum schema
export const LessonTypeSchema = z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL_CERTIFICATE"]);

// Base lesson schema (for complete lesson object)
export const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, "Title is required"),
  code: z.string().optional().default(generateUniqueCode),
  outcome: z.string().min(1, "Outcome is required"),
  type: LessonTypeSchema,
  accreditationBody: z.string().optional(),
  awardingBodyId: z.string().uuid().optional(),
  estimatedTimeToComplete: z.coerce.number().int().positive("Estimated time must be a positive integer"),
  contents: z
    .array(
      z.object({
        title: z.string().min(1, "Content title is required"),
        description: z.string().min(1, "Content description is required"),
        type: z.string().min(1, "Content type is required"),
        paths: z.array(z.string().min(1, "Content path is required")).min(1),
      }),
    )
    .min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Create schema (for creating new lessons)
export const CreateLessonSchema = LessonSchema.omit({ id: true, createdAt: true, updatedAt: true });

// Update schema (for updating existing lessons)
export const UpdateLessonSchema = LessonSchema.partial().extend({
  id: z.string().uuid(),
  contents: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        title: z.string().min(1, "Content title is required").optional(),
        description: z.string().min(1, "Content description is required").optional(),
        type: z.string().min(1, "Content type is required").optional(),
        paths: z.array(z.string().min(1, "Content path is required")).min(1).optional(),
        index: z.number().optional(),
      }),
    )
    .min(1)
    .optional(),
});

// Get single lesson schema
export const GetSingleLessonSchema = z.object({
  id: z.string().uuid(),
});

// TypeScript types inferred from schemas
export type LessonType = z.infer<typeof LessonTypeSchema>;
export type Lesson = z.infer<typeof LessonSchema>;
export type CreateLesson = z.infer<typeof CreateLessonSchema>;
export type UpdateLesson = z.infer<typeof UpdateLessonSchema>;
export type GetSingleLesson = z.infer<typeof GetSingleLessonSchema>;

export const getLessonReqBodySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).optional().default(10),
  searchTerm: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  type: LessonTypeSchema.optional(),
  estimatedTimeToComplete: z.coerce.number().int().positive().optional(),
  awardingBodyId: z.string().uuid().optional(),
  code: z.string().min(1).optional(),
});

export type GetLessonReqBody = z.infer<typeof getLessonReqBodySchema>;
