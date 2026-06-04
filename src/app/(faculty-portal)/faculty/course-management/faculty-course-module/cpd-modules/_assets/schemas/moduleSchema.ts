import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
// const numberSchema = z
//   .number({ invalid_type_error: "Must be a number" })
//   .positive("Must be a positive number");

const CreateCPDModuleSchema = z.object({
  moduleTitle: textSchema,
  moduleCode: textSchema,
  moduleType: textSchema,

  estimatedTimeToComplete: z.string().optional(),
  faculty: optionalTextSchema,
  moduleDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  forumDiscussionBoard: z.boolean().optional(),
});

const filterCPDModuleSchema = z.object({
  moduleTitle: optionalTextSchema,
  moduleCode: optionalTextSchema,
  moduleType: optionalTextSchema,
  estimatedTimeToComplete: optionalTextSchema,
  faculty: optionalTextSchema,
  moduleDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  moduleStatus: optionalTextSchema,
});

const updateCPDModuleSchema = CreateCPDModuleSchema.partial();
export type I_CPD_ModuleForm = z.infer<typeof CreateCPDModuleSchema>;

export type IFilterCPdModuleForm = z.infer<typeof filterCPDModuleSchema>;

export const CPDModuleSchema = {
  create: CreateCPDModuleSchema,
  update: updateCPDModuleSchema,
  filter: filterCPDModuleSchema,
};
