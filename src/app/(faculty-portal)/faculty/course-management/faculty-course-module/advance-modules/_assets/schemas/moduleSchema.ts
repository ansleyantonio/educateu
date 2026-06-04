import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
const numberSchema = z
  .number({ invalid_type_error: "Must be a number" })
  .positive("Must be a positive number");

const CreateAdvancedModuleSchema = z.object({
  moduleTitle: textSchema,
  moduleCode: textSchema,
  awardingBody: textSchema,
  moduleType: textSchema,
  credit: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Credit must be a number",
  }),
  estimatedTimeToComplete: z.string().optional(),
  faculty: optionalTextSchema,
  moduleDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  forumDiscussionBoard: z.boolean().optional(),
});

const filterAdvancedModuleSchema = z.object({
  moduleTitle: optionalTextSchema,
  moduleCode: optionalTextSchema,
  moduleType: optionalTextSchema,
  credit: optionalTextSchema,
  estimatedTimeToComplete: optionalTextSchema,
  faculty: optionalTextSchema,
  moduleDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  moduleStatus: optionalTextSchema,
});

const UpdateAdvancedModuleSchema = CreateAdvancedModuleSchema.partial();

export type IAdvanceModuleForm = z.infer<typeof CreateAdvancedModuleSchema>;

export const AdvanceModuleSchema = {
  create: CreateAdvancedModuleSchema,
  update: UpdateAdvancedModuleSchema,
  filter: filterAdvancedModuleSchema,
};
