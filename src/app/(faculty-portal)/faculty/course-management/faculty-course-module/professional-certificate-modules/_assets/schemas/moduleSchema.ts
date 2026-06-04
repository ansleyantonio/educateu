import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
// const numberSchema = z
//   .number({ invalid_type_error: "Must be a number" })
//   .positive("Must be a positive number");

const CreateProfessionalCertificateModuleSchema = z.object({
  moduleTitle: textSchema,
  moduleCode: textSchema,
  moduleType: textSchema,

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
  estimatedTimeToComplete: optionalTextSchema,
  faculty: optionalTextSchema,
  moduleDescription: optionalTextSchema,
  learningOutcome: optionalTextSchema,
  moduleStatus: optionalTextSchema,
});

const updateProfessionalCertificateModuleSchema =
  CreateProfessionalCertificateModuleSchema.partial();
export type IProfessionalCertificateModuleForm = z.infer<
  typeof CreateProfessionalCertificateModuleSchema
>;

export type IFilterProfessionalCertificateModuleForm = z.infer<
  typeof filterAdvancedModuleSchema
>;

export const ProfessionalCertificateModuleSchema = {
  create: CreateProfessionalCertificateModuleSchema,
  update: updateProfessionalCertificateModuleSchema,
  filter: filterAdvancedModuleSchema,
};
