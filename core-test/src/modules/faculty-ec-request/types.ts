import { z } from "zod";
import { SupportRequestStatus, SupportRequestStage } from "@prisma/client";

export enum TicketScope {
  ALL = "all",
  OWN = "own",
}

export const getECRequestTicketReqBodySchema = z
  .object({
    status: z.nativeEnum(SupportRequestStatus).default(SupportRequestStatus.PENDING),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
  })
  .strict();

export const getECRequestTicketResBodySchema = z
  .object({
    supportTickets: z.array(
      z.object({
        id: z.string().uuid(),
        tokenNo: z.string().uuid(),
        status: z.nativeEnum(SupportRequestStatus),
        stage: z.nativeEnum(SupportRequestStage),
        moduleId: z.string().uuid().nullable(),
        studentCourseId: z.string().uuid(),
        subject: z.string().min(1),
        message: z.string().min(1),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
      }),
    ),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalCount: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
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

export const rejectECRequestTicketBodySchema = z
  .object({
    tokenId: z.string().uuid(),
  })
  .strict();

export type GetECRequestTicketsRequestBody = z.infer<typeof getECRequestTicketReqBodySchema>;
export type GetECRequestTicketsResponse = z.infer<typeof getECRequestTicketResBodySchema>;

export interface CourseSnapshot {
  id: string;
  title: string;
  code: string;
  courseModules?: CourseModuleItem[];
  modules?: Module[];
}

export interface CourseModuleItem {
  cModuleId: string;
  cModule: CourseModule;
  semesterNumber?: number;
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

export interface ECAssessmentListType {
  tokenNo: string;
  studentId: string;
  moduleId: string;
  assessmentId: string;
  time?: string;
  createdAt: Date;
}
