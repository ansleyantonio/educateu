import { optionalNumberSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
const numberSchema = z
  .number({ invalid_type_error: "Must be a number" })
  .positive("Must be a positive number");

const filterModuleSchema = z.object({
  moduleType: optionalTextSchema,
  title: optionalTextSchema,
  code: optionalTextSchema,
  credit: optionalNumberSchema,
  estimatedTimeToComplete: optionalNumberSchema,
});

export type IFilterModuleForm = z.infer<typeof filterModuleSchema>;

export const ModuleSchema = {
  filter: filterModuleSchema,
};
