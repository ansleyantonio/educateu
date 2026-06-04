import { optionalNumberSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();

const contentSchema = z.object({
  title: z.string().min(1, "Content title is required"),
  description: z.string().min(1, "Content description is required"),
  type: z.string().min(1, "Content type is required"),
  // paths: z.array(z.string().min(1, "Content path is required")),
  paths: z
    .array(z.union([z.string().min(1), z.object({ path: z.string().min(1) })]))
    .transform((arr) =>
      arr.map((item) => (typeof item === "string" ? item : item.path)),
    ),
});

const CreateLessonSchema = z.object({
  lessonTitle: textSchema,
  lessonCode: textSchema,
  lessonType: textSchema,

  // estimatedTimeToComplete: z.string().optional(),
  estimatedTimeToComplete: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Estimated time must be a valid number",
    })
    .optional(),
  faculty: optionalTextSchema,
  lessonDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  contents: z.array(contentSchema),
});

const UpdateLessonSchema = z.object({
  lessonTitle: optionalTextSchema,
  lessonCode: optionalTextSchema,
  lessonType: optionalTextSchema,
  estimatedTimeToComplete: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Estimated time must be a valid number",
    })
    .optional(),
  faculty: optionalTextSchema,
  lessonDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  contents: z.array(contentSchema).optional(),
});

const filterLessonSchema = z.object({
  lessonTitle: optionalTextSchema,
  lessonCode: optionalTextSchema,
  lessonType: optionalTextSchema,
  estimatedTimeToComplete: optionalNumberSchema,
  faculty: optionalTextSchema,
  lessonDescription: optionalTextSchema,
});

// const UpdateLessonSchema = CreateLessonSchema.partial();

export type ILessonForm = z.infer<typeof CreateLessonSchema>;
export type ILessonUpdateForm = z.infer<typeof UpdateLessonSchema>;
export type IFilterLessonForm = z.infer<typeof filterLessonSchema>;

export const LessonSchema = {
  create: CreateLessonSchema,
  update: UpdateLessonSchema,
  filter: filterLessonSchema,
};
