/*
 * Course Module Type Definitions
 *
 * This comprehensive module defines type definitions and validation schemas for the course management system.
 * It supports three distinct course types (Professional, Advanced, and CPD courses) with their specific
 * validation rules, enums, and business logic constraints.
 *
 * Features:
 * - Advanced Course schemas with DIPLOMA/DEGREE type validation
 * - Professional Course schemas with accreditation management
 * - CPD Course schemas for professional development
 * - Course module assignment and indexing schemas
 * - Comprehensive filtering and search schemas
 * - Cross-referenced validation with conditional field requirements
 * - Study mode, accreditation status, and duration management
 *
 * Business Rules:
 * - DIPLOMA courses require diplomaType specification
 * - DEGREE courses require degreeType specification
 * - Professional courses must have accreditation details
 * - CPD courses support flexible duration and study modes
 *
 * Author: EducateU Development Team
 * Version: 1.0.0
 */

import { z } from "zod";
import { generateUniqueCode } from "../../utils/miscUtils";
import { AppError } from "../../utils/AppError";

// Core course type enums
export const AdvancedCourseTypeSchema = z.enum(["DIPLOMA", "DEGREE"]);

export const DegreeTypeSchema = z.enum(["UNDERGRADUATE", "POSTGRADUATE"]);

export const DiplomaTypeSchema = z.enum(["HIGHER_EDUCATION", "VOCATIONAL_OR_PROFESSIONAL"]);

export const StudyModeSchema = z.enum(["SELF_PACED", "INSTRUCTOR_LED", "COHORT_BASED", "BLENDED_OR_HYBRID_LEARNING"]);

export const AccreditationStatusSchema = z.enum(["ACCREDITED", "PROVISIONALLY_ACCREDITED", "NOT_ACCREDITED"]);

export const CourseTypeSchema = z.enum(["PROFESSIONAL_COURSE", "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE"]);

// Main AdvancedCourse schema
export const AdvancedCourseSchema = z
  .object({
    id: z.string().uuid(),
    courseType: CourseTypeSchema,
    title: z.string(),
    code: z.string().optional().default(generateUniqueCode),
    status: z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    hesaCourseId: z.string().optional(),
    degreeType: DegreeTypeSchema.optional(),
    diplomaType: DiplomaTypeSchema.optional(),
    intendedAward: z.string(),
    courseDescription: z.string(),
    studyModes: z.array(StudyModeSchema),
    durationLength: z.number().int(),
    numberOfSemesters: z.number().int(),
    totalCredits: z.number().int().optional(),
    yearOneExpectedCredits: z.number().int().optional(),
    yearTwoExpectedCredits: z.number().int().optional(),
    yearThreeExpectedCredits: z.number().int().optional(),
    yearFourExpectedCredits: z.number().int().optional(),
    minimumPassingCreditsPerYear: z.number().int().optional(),
    awardingBodyId: z.string().uuid(),
    accreditationBody: z.string().optional(),
    accreditationStatus: AccreditationStatusSchema.optional(),
    qualificationAim: z.string().optional(),
    approvalDate: z.coerce.date().optional(),
    reviewDate: z.coerce.date().optional(),
    courseLeader: z.string().optional(),
    governanceNotes: z.string().optional(),
    // sessionId: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

// Input schema for creating an AdvancedCourse (without auto-generated fields)
export const AdvancedCourseCreateSchema = AdvancedCourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).refine(
  (data) => {
    // If type is DIPLOMA, diplomaType must be provided
    if (data.courseType === "DIPLOMA_COURSE" && !data.diplomaType) {
      return false;
    }
    // If type is DEGREE, degreeType must be provided
    if (data.courseType === "DEGREE_COURSE" && !data.degreeType) {
      return false;
    }
    return true;
  },
  {
    message:
      "When course type is DIPLOMA, diplomaType is required. When course type is DEGREE, degreeType is required.",
    path: ["type"], // This will associate the error with the type field
  },
);

// Input schema for updating an AdvancedCourse (all fields optional except id)
export const AdvancedCourseUpdateSchema = AdvancedCourseSchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports
export type AdvancedCourseType = z.infer<typeof AdvancedCourseTypeSchema>;
export type DegreeType = z.infer<typeof DegreeTypeSchema>;
export type DiplomaType = z.infer<typeof DiplomaTypeSchema>;
export type StudyMode = z.infer<typeof StudyModeSchema>;
export type AccreditationStatus = z.infer<typeof AccreditationStatusSchema>;
export type AdvancedCourse = z.infer<typeof AdvancedCourseSchema>;
export type AdvancedCourseCreate = z.infer<typeof AdvancedCourseCreateSchema>;
export type AdvancedCourseUpdate = z.infer<typeof AdvancedCourseUpdateSchema>;

// New enum schemas
export const FundingModelSchema = z.enum(["SELF_FUNDED", "EMPLOYER_FUNDED"]);

// Assuming YesNo enum exists - common pattern
export const YesNoSchema = z.enum(["YES", "NO"]);

// Main ProfessionalCourse schema
export const ProfessionalCourseSchema = z
  .object({
    id: z.string().uuid(),
    courseType: CourseTypeSchema,
    title: z.string(),
    status: z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
    code: z.string().optional().default(generateUniqueCode),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    courseDescription: z.string(),
    studyModes: z.array(StudyModeSchema),
    durationLength: z.number().int(),
    professionalAccreditation: z.string(),
    accreditationBodyCode: z.string().optional(),
    accreditationStatus: AccreditationStatusSchema.optional(),
    accreditationStartDate: z.coerce.date().optional(),
    accreditationEndDate: z.coerce.date().optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict();

// Input schema for creating a ProfessionalCourse (without auto-generated fields)
export const ProfessionalCourseCreateSchema = ProfessionalCourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Input schema for updating a ProfessionalCourse (all fields optional except id)
export const ProfessionalCourseUpdateSchema = ProfessionalCourseSchema.partial().extend({
  id: z.string().uuid(),
});

// Type exports
export type FundingModel = z.infer<typeof FundingModelSchema>;
export type YesNo = z.infer<typeof YesNoSchema>;
export type ProfessionalCourse = z.infer<typeof ProfessionalCourseSchema>;
export type ProfessionalCourseCreate = z.infer<typeof ProfessionalCourseCreateSchema>;
export type ProfessionalCourseUpdate = z.infer<typeof ProfessionalCourseUpdateSchema>;

// Main CpdCourse Zod schema
export const CpdCourseSchema = z
  .object({
    id: z.string().uuid().optional(), // Optional for creation, will be auto-generated
    courseType: CourseTypeSchema,
    title: z.string().min(1, "Title is required"),
    status: z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"]).optional(),
    code: z.string().optional().default(generateUniqueCode),
    courseDescription: z.string().optional(),
    studyModes: z.array(StudyModeSchema).min(1, "At least one study mode is required"),
    durationLength: z.number().int().positive("Duration must be a positive integer"),
    professionalAccreditation: z.string().min(1, "Professional accreditation is required"),
    accreditationBodyCode: z.string().optional(),
    accreditationStartDate: z.coerce.date().optional(),
    accreditationEndDate: z.coerce.date().optional(),
    createdAt: z.coerce.date().optional(), // Optional for creation, will be auto-generated
    updatedAt: z.coerce.date().optional(), // Optional for creation, will be auto-generated
  })
  .strict();

// Type inference
export type CpdCourse = z.infer<typeof CpdCourseSchema>;

// Schema for creating a new course (without auto-generated fields)
export const CreateCpdCourseSchema = CpdCourseSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateCpdCourse = z.infer<typeof CreateCpdCourseSchema>;

// Schema for updating a course (all fields optional except id)
export const UpdateCpdCourseSchema = CpdCourseSchema.partial().required({ id: true });

export type UpdateCpdCourse = z.infer<typeof UpdateCpdCourseSchema>;

export const assignCourseModuleSchema = z.object({
  courseId: z.string().uuid(),
  moduleId: z.string().uuid(),
});

export type AssignCourseModule = z.infer<typeof assignCourseModuleSchema>;

export const getCoursesReqBodySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).optional().default(10),
  courseType: z
    .union([
      z.enum(["PROFESSIONAL_COURSE", "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE"]),
      z.array(z.enum(["PROFESSIONAL_COURSE", "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE"])),
    ])
    .optional(),
  searchTerm: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  status: z.array(z.enum(["PUBLISHED", "UNPUBLISHED", "ARCHIVED"])).optional(),
  // studyModes: z.array(StudyModeSchema).min(1).optional(),
  numberOfSemesters: z.coerce.number().int().min(1).optional(),
  durationLength: z.coerce.number().int().min(1).optional(),
  accreditationStatus: AccreditationStatusSchema.optional(),
  hasFees: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      if (val === "true") return true;
      if (val === "false") return false;
      throw new AppError("Invalid value for hasFees", "BAD_REQUEST", 400);
    }),
});

export type GetCoursesReqBody = z.infer<typeof getCoursesReqBodySchema>;

export const updateModuleIndexSchema = z
  .array(
    z.object({
      moduleId: z.string().uuid(),
      index: z.number().int().min(1),
    }),
  )
  .min(1);

export type UpdateModuleIndex = z.infer<typeof updateModuleIndexSchema>;

export const updateModuleSemesterSchema = z.object({
  moduleId: z.string().uuid(),
  semesterNumber: z.coerce.number().int().min(1),
});

export type UpdateModuleSemester = z.infer<typeof updateModuleSemesterSchema>;
