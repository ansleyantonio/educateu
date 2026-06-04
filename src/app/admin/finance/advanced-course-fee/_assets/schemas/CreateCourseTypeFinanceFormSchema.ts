import { z } from "zod";

const ModuleSchema = z.object({
  // moduleName: z.string().min(1, "Module name is required"),
  module: z.string().min(1, "Module name is required"),
  credit: z.number().min(1, "Credit must be at least 1"),
  fee: z.number().min(0, "Fee must be non-negative"),
});

const SemesterSchema = z.object({
  semesterName: z.string().min(1, "Semester name is required"),
  semesterFee: z.number().min(0, "Semester fee must be non-negative"),
  modules: z.array(ModuleSchema).min(1, "At least one module is required"),
});

const CreateCourseTypeFinanceFormSchema = z.object({
  session: z.string().min(1, "Session is required"),
  course: z.string().min(1, "Course name is required"),
  sessionCourseId: z.string().min(1, "Session-Course ID is required"),
  overallcoursefee: z.number().min(0, "Overall course fee must be non-negative"),
  agreementStatus: z.boolean().default(false),
  semesters: z.array(SemesterSchema).min(1, "At least one semester is required"),
});

const CourseFinanceResponseSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  overallCourseFee: z.number().min(0, "Overall course fee must be non-negative"),
  tieredPricing: z.array(z.unknown()).optional(), // can define later if needed
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  currencyType: z.string().min(1, "Currency type is required"),
  // promoCodeStatus: z.enum(["active", "inactive"]),
  promoCodeStatus: z.enum(["ACTIVE", "INACTIVE", "UPCOMING"]),
  createdAt: z.string().datetime("Invalid date format"),
  updatedAt: z.string().datetime("Invalid date format"),
});

const UpdateCourseTypeFinanceFormSchema = CreateCourseTypeFinanceFormSchema.partial();

export type CourseFinanceResponseType = z.infer<typeof CourseFinanceResponseSchema>;

const FilterCourseTypeFinanceFormSchema = z.object({
  session: z.string().optional(),
  course: z.string().optional(),
  overallCourseFee: z.number().optional(),
  agreementStatus: z.boolean().optional(),
});

export type CreateCourseTypeFinanceFormType = z.infer<
  typeof CreateCourseTypeFinanceFormSchema
>;
export type UpdateCourseTypeFinanceFormType = z.infer<
  typeof UpdateCourseTypeFinanceFormSchema
>;
export type FilterCourseTypeFinanceFormType = z.infer<
  typeof FilterCourseTypeFinanceFormSchema
>;

export const CourseTypeFinanceFormSchema = {
  create: CreateCourseTypeFinanceFormSchema,
  update: UpdateCourseTypeFinanceFormSchema,
  filter: FilterCourseTypeFinanceFormSchema,
  response: CourseFinanceResponseSchema
};