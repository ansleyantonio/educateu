import {
  optionalNumberSchema,
  textSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
//const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
const numberSchema = z
  .number({ invalid_type_error: "Must be a number" })
  .positive("Must be a positive number");

const CreateAdvancedModuleSchema = z.object({
  title: textSchema({ label: "Module Title" }),
  courseType: textSchema({ label: "Course Type" }),
  code: z.string().optional(),
  awardingBodyId: textSchema({ label: "Awarding Body" }),
  moduleType: z.string().optional(),
  credit: numberSchema,
  estimatedTimeToComplete: numberSchema,
  description: textSchema({ label: "Module Description" }),
  learningOutcome: optionalTextSchema,
  forumOrDiscussionBoard: z.boolean().optional(),
});

const filterAdvancedModuleSchema = z.object({
  moduleType: optionalTextSchema,
  title: optionalTextSchema,
  code: optionalTextSchema,
  credit: optionalNumberSchema,
  estimatedTimeToComplete: optionalNumberSchema,
});

const UpdateAdvancedModuleSchema = CreateAdvancedModuleSchema.partial();

export type IAdvanceModuleForm = z.infer<typeof CreateAdvancedModuleSchema>;

export type IFilterAdvanceModuleForm = z.infer<
  typeof filterAdvancedModuleSchema
>;

export const AdvanceModuleSchema = {
  create: CreateAdvancedModuleSchema,
  update: UpdateAdvancedModuleSchema,
  filter: filterAdvancedModuleSchema,
};
