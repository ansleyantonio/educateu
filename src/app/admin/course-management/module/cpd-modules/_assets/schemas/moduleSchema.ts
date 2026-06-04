import {
  numberSchema,
  optionalNumberSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();

const CreateCPDModuleSchema = z.object({
  title: textSchema,
  code: z.string().optional(),
  moduleType: textSchema,
  courseType: z.literal("CPD_COURSE"),
  estimatedTimeToComplete: numberSchema,
  description: textSchema,
  learningOutcome: optionalTextSchema,
  forumDiscussionBoard: z.boolean().optional(),
});

const filterCPDModuleSchema = z.object({
  title: optionalTextSchema,
  code: optionalTextSchema,
  estimatedTimeToComplete: optionalNumberSchema,
});

const updateCPDModuleSchema = CreateCPDModuleSchema.partial();
export type I_CPD_ModuleForm = z.infer<typeof CreateCPDModuleSchema>;

export type IFilterCPdModuleForm = z.infer<typeof filterCPDModuleSchema>;

export const CPDModuleSchema = {
  create: CreateCPDModuleSchema,
  update: updateCPDModuleSchema,
  filter: filterCPDModuleSchema,
};
