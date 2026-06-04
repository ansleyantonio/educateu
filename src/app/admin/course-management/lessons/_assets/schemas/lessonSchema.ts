import {
  descriptionSchema,
  optionalNumberSchema,
  optionalTextSchema,
  textSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

/* ----------------------------- Enums ----------------------------- */
// export const LessonTypeEnum = z.enum([
//   "DEGREE",
//   "DIPLOMA",
//   "PROFESSIONAL_CERTIFICATE",
//   "CPD",
// ]);
// export type ILessonType = z.infer<typeof LessonTypeEnum>;

/* ----------------------------- Content Schema ----------------------------- */
const contentSchema = z.object({
  id: z.string().optional(),
  index: z.number().optional(),
  title: textSchema({ label: "Content Title" }),
  description: textSchema({ label: "Content Description" }),
  type: textSchema({ label: "Content Type" }),
  paths: z
    .array(z.union([z.string().min(1), z.object({ path: z.string().min(1) })]))
    .transform((arr) =>
      arr.map((item) => (typeof item === "string" ? item : item.path))
    ),
});

/* ----------------------------- Base Lesson ----------------------------- */
const baseLessonSchema = {
  title: textSchema({ label: "Lesson Title" }),
  code: z.string().optional(),
  type: textSchema({ label: "Lesson Type" }),
  awardingBodyId: optionalTextSchema,
  accreditation: optionalTextSchema,
  estimatedTimeToComplete: z
    .union([z.string(), z.number()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .refine((val) => val === undefined || !isNaN(val), {
      message: "Estimated time must be a valid number",
    })
    .optional(),
  outcome: descriptionSchema({ label: "Learning Outcome" }),
  contents: z.array(contentSchema).optional(),
};

/* ----------------------------- Conditional Validation ----------------------------- */
const withConditionalValidation = <T extends z.ZodRawShape>(
  schema: z.ZodObject<T>
) =>
  schema.superRefine(({ type, awardingBodyId, accreditation }, ctx) => {
    if (["DEGREE", "DIPLOMA"].includes(type) && !awardingBodyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["awardingBodyId"],
        message: "Awarding Body is required for Degree or Diploma",
      });
    }

    if (["PROFESSIONAL_CERTIFICATE", "CPD"].includes(type) && !accreditation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["accreditation"],
        message:
          "Accreditation Body is required for Professional Certificate or CPD",
      });
    }
  });

/* ----------------------------- Schemas ----------------------------- */
export const CreateLessonSchema = withConditionalValidation(
  z.object(baseLessonSchema)
);

export const UpdateLessonSchema = withConditionalValidation(
  z.object({ ...baseLessonSchema }).partial()
);

export const FilterLessonSchema = z.object({
  title: optionalTextSchema,
  code: optionalTextSchema,
  type: optionalTextSchema,
  estimatedTimeToComplete: optionalNumberSchema,
});

/* ----------------------------- Types ----------------------------- */
export type IContentForm = z.infer<typeof contentSchema>;
export type ILessonForm = z.infer<typeof CreateLessonSchema>;
export type ILessonUpdateForm = z.infer<typeof UpdateLessonSchema>;
export type IFilterLessonForm = z.infer<typeof FilterLessonSchema>;

/* ----------------------------- Export ----------------------------- */
export const LessonSchema = {
  create: CreateLessonSchema,
  update: UpdateLessonSchema,
  filter: FilterLessonSchema,
};
