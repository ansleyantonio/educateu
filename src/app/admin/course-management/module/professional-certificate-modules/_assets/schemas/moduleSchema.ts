import {
  numberSchema,
  optionalNumberSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
// const numberSchema = z
//   .number({ invalid_type_error: "Must be a number" })
//   .positive("Must be a positive number");

const CreateProfessionalCertificateModuleSchema = z.object({
  title: textSchema,
  code: z.string().optional(),
  moduleType: textSchema,
  courseType: z.literal("PROFESSIONAL_COURSE"),
  estimatedTimeToComplete: numberSchema,
  faculty: optionalTextSchema,
  description: textSchema,
  learningOutcome: optionalTextSchema,
  forumDiscussionBoard: z.boolean().optional(),
});

const filterProfCertModuleSchema = z.object({
  title: optionalTextSchema,
  code: optionalTextSchema,
  estimatedTimeToComplete: optionalNumberSchema,
});

const updateProfessionalCertificateModuleSchema =
  CreateProfessionalCertificateModuleSchema.partial();

export type IProfessionalCertificateModuleForm = z.infer<
  typeof CreateProfessionalCertificateModuleSchema
>;

export type IFilterProfCertModuleForm = z.infer<
  typeof filterProfCertModuleSchema
>;

export const ProfessionalCertificateModuleSchema = {
  create: CreateProfessionalCertificateModuleSchema,
  update: updateProfessionalCertificateModuleSchema,
  filter: filterProfCertModuleSchema,
};
