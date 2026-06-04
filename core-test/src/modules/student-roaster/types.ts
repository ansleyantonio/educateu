import { z } from "zod";

export const getRegistriesReqBodySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    agentId: z.string().uuid().optional(),
    awardingBodyId: z.string().uuid().optional(),
    moduleId: z.string().uuid().optional(),
    sessionId: z.string().uuid().optional(),
    courseType: z.enum(["DEGREE_COURSE", "DIPLOMA_COURSE"]).optional(),
    courseId: z.string().uuid().optional(),
    applicationId: z.string().uuid().optional(),
  })
  .strict();

export const getRegisteredStudentReqBodySchema = z
  .object({
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    registrationId: z.string().uuid(),
    studentId: z.string().uuid(),
  })
  .strict();

export const downloadCsvReqBodySchema = z
  .object({
    ids: z.array(z.string().uuid()).min(1),
    fields: z.array(z.string()).min(1).optional(),
  })
  .strict();

export const transferSupportTokensBodySchema = z
  .object({
    tokenId: z.string().uuid(),
    stage: z.enum(["EC_REQUEST", "WITHDRAWAL"]),
  })
  .strict();

export const resolveEC2TokensBodySchema = z
  .object({
    tokenId: z.string().uuid(),
    moduleId: z.string().uuid().optional(),
    assessmentId: z.string().uuid(),
    time: z.string().optional(),
  })
  .strict();

export const resolveSupportTokensBodySchema = z
  .object({
    tokenId: z.string().uuid(),
  })
  .strict();

export const assignSupportTokensBodySchema = z
  .object({
    tokenId: z.string().uuid(),
    assignedToId: z.string().uuid().optional(),
    // stage: z.enum(["EC2", "WITHDRAWAL", "GENERAL"]),
  })
  .strict();

// Support Tokens Request Body Schema
export const getSupportTokensReqBodySchema = z
  .object({
    // status: z.enum(["PENDING", "RESOLVED", "ASSIGNED", "REJECTED"]).default("PENDING"),
    // status: z.enum(["PENDING", "RESOLVED", "ASSIGNED", "REJECTED"]).optional(),
    // stage: z.enum(["SUPPORT", "EC_REQUEST", "WITHDRAWAL"]).default("SUPPORT"),
    page: z.coerce.number().optional().default(1),
    pageSize: z.coerce.number().optional().default(10),
    scope: z.enum(["all", "own"]).optional(),
    search: z.string().optional(),
    courseType: z.enum(["DEGREE_COURSE", "DIPLOMA_COURSE", "PROFESSIONAL_COURSE", "CPD_COURSE"]).optional(),
    courseId: z.string().optional(),
  })
  .strict();

// Support Tokens Response Schema
export const getSupportTokensResBodySchema = z
  .object({
    supportTickets: z.array(
      z.object({
        id: z.string().uuid(),
        tokenNo: z.string().uuid(),
        status: z.enum(["PENDING", "RESOLVED", "ASSIGNED", "REJECTED"]),
        stage: z.enum(["SUPPORT", "EC_REQUEST", "WITHDRAWAL"]),
        moduleId: z.string().uuid().nullable(),
        studentCourseId: z.string().uuid(),
        subject: z.string(),
        message: z.string(),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
      }),
    ),
    pagination: z.object({
      page: z.number(),
      pageSize: z.number(),
      totalCount: z.number(),
      totalPages: z.number(),
    }),
  })
  .strict();

export type RegistriesRequestBody = z.infer<typeof getRegistriesReqBodySchema>;
export type GetRegisteredStudentDetailsRequestBody = z.infer<typeof getRegisteredStudentReqBodySchema>;
export type DownloadCsvByIdsRequestBody = z.infer<typeof downloadCsvReqBodySchema>;
export type DownloadCsvRequestBody = z.infer<typeof downloadCsvReqBodySchema>;

// Support Tokens
export type GetSupportTokensRequestBody = z.infer<typeof getSupportTokensReqBodySchema>;
export type GetSupportTokensResponse = z.infer<typeof getSupportTokensResBodySchema>;

export interface CourseSnapshot {
  id: string;
  title: string;
  code: string;
  courseModules?: CourseModuleItem[];
  modules?: Module[];
}

export interface CourseModule {
  id: string;
  title: string;
  code: string;
  faculty?: FacultyMember[];
}

export interface FacultyMember {
  userId: string;
  role: string;
  assignedAt: string;
}

export interface CourseModuleItem {
  cModuleId: string;
  cModule: CourseModule;
  semesterNumber?: number;
}

interface Module {
  id: string;
  title?: string;
  code?: string;
  moduleAssessments?: ModuleAssessment[];
}

interface ModuleAssessment {
  assessment?: Assessment;
}

export interface Assessment {
  id: string;
  nameOrTitle?: string; // Primary field in your data
  name?: string; // Keep for backward compatibility
  title?: string; // Keep for backward compatibility
  description?: string;
  type?: string;
  weight?: number;
  dueDate?: string | Date;
  maxScore?: number;
  passingScore?: number;
  status?: string;
  assessmentCategory?: string;
  assessmentCode?: string;
  timeLimit?: number;
  attempts?: number;
  availableStartDate?: string | Date;
  availableEndDate?: string | Date;
  lateSubmissions?: boolean;
  totalPointsOrWeight?: number;
}

interface Module {
  id: string;
  moduleAssessments?: ModuleAssessment[];
}
