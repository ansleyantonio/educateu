import z from "zod";
import { AdvancedCourseCreateSchema } from "../course/types";
import { generateUniqueCode } from "../../utils/miscUtils";

const AdvancedCourseModuleSchema = z.object({
  id: z.string().uuid(),
  courseType: z.enum(["DEGREE_COURSE", "DIPLOMA_COURSE", "PROFESSIONAL_COURSE", "CPD_COURSE"]),
  moduleType: z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL_CERTIFICATE"]),
  title: z.string(),
  code: z.string().optional().default(generateUniqueCode),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  description: z.string(),
  credit: z.coerce.number(),
  awardingBodyId: z.string(),
  estimatedTimeToComplete: z.number(),
  faculty: z.string().uuid().optional(),
  learningOutcome: z.string().optional(),
  forumOrDiscussionBoard: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type AdvancedCourseModule = z.infer<typeof AdvancedCourseModuleSchema>;

export const AdvancedCourseModuleCreateSchema = AdvancedCourseModuleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AdvancedCourseModuleCreate = z.infer<typeof AdvancedCourseModuleCreateSchema>;

export const AdvancedCourseModuleUpdateSchema = AdvancedCourseModuleSchema.partial().extend({
  id: z.string().uuid(),
});

export type AdvancedCourseModuleUpdate = z.infer<typeof AdvancedCourseModuleUpdateSchema>;

export const ProfessionalOrCpdCourseModuleSchema = AdvancedCourseModuleSchema.omit({
  credit: true,
  awardingBodyId: true,
});

export type ProfessionalOrCpdCourseModule = z.infer<typeof ProfessionalOrCpdCourseModuleSchema>;

export const ProfessionalOrCpdCourseModuleCreateSchema = ProfessionalOrCpdCourseModuleSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ProfessionalOrCpdCourseModuleCreate = z.infer<typeof ProfessionalOrCpdCourseModuleCreateSchema>;

export const ProfessionalOrCpdCourseModuleUpdateSchema = ProfessionalOrCpdCourseModuleSchema.partial().extend({
  id: z.string().uuid(),
});

export type ProfessionalOrCpdCourseModuleUpdate = z.infer<typeof ProfessionalOrCpdCourseModuleUpdateSchema>;

export const CourseModuleGetReqBodySchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).default(10),
    searchTerm: z.string().min(1).optional(),
    courseType: z.enum(["DEGREE_COURSE", "DIPLOMA_COURSE", "PROFESSIONAL_COURSE", "CPD_COURSE"]).optional(),
    title: z.string().min(1).optional(),
    moduleType: z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL_CERTIFICATE"]).optional(),
    moduleCode: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    credit: z.coerce.number().optional(),
    awardingBodyId: z.string().optional(),
    facultyId: z.string().optional(),
    estimatedTimeToComplete: z.coerce.number().optional(),
  })
  .strict();

export type CourseModuleGetReqBody = z.infer<typeof CourseModuleGetReqBodySchema>;

export const CourseCourseModuleGetReqBodySchema = z
  .object({
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).default(10),
  })
  .strict();

export type CourseCourseModuleGetReqBody = z.infer<typeof CourseCourseModuleGetReqBodySchema>;

export const assignLessonToCourseModuleSchema = z.object({
  moduleId: z.string().uuid(),
  lessonId: z.string().uuid(),
});

export type AssignLessonToCourseModule = z.infer<typeof assignLessonToCourseModuleSchema>;

export const assignAssessmentToCourseModuleSchema = z.object({
  moduleId: z.string().uuid(),
  assessmentId: z.string().uuid(),
});

export type AssignAssessmentToCourseModule = z.infer<typeof assignAssessmentToCourseModuleSchema>;

export const updateLessonsIndexSchema = z.object({
  lessonId: z.string().uuid(),
  index: z.coerce.number().int().min(0),
});

export type UpdateLessonsIndex = z.infer<typeof updateLessonsIndexSchema>;

export const updateAssessmentIndexSchema = z.object({
  assessmentId: z.string().uuid(),
  index: z.coerce.number().int().min(0),
});

export type UpdateAssessmentIndex = z.infer<typeof updateAssessmentIndexSchema>;
