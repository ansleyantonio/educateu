import prisma from "../../prismaClient";
import { Prisma } from "@prisma/client";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import {
  CourseSnapshot,
  ECAssessmentListType,
  GetECRequestTicketsRequestBody,
  GetECRequestTicketsResponse,
} from "./types";
import createAuditLog from "../../utils/auditlog";
import userDetails from "../../utils/userinfo";
import { getUserAssignedCourseModuleIds } from "../../helpers/user-assigned-cModules";
import { ensureFacultyCourseModuleAccess } from "../../helpers/ensure-faculty-cModule-access";

// Reusable function to check if user has access to a module

// Check if the student is enrolled in the module (Assessment Access Check)
export async function validateStudentModuleAccess(
  studentId: string,
  moduleId: string,
  assessmentId: string,
): Promise<boolean> {
  // Changed from void to boolean
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      studentId,
      enrollmentStatus: "ACTIVE",
    },
    select: {
      sessionCourse: {
        select: {
          courseSnapshot: true,
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student not actively enrolled or has withdrawn from this course", "ENROLLMENT_INACTIVE", 404);
  }

  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  if (!snapshot?.modules) {
    throw new AppError("Course data not found", "NOT_FOUND", 404);
  }

  const module = snapshot.modules.find((m) => m.id === moduleId);
  if (!module) {
    throw new AppError("Module not found in your course", "NOT_FOUND", 404);
  }

  const hasAssessment = module.moduleAssessments?.some((ma) => ma.assessment?.id === assessmentId);

  if (!hasAssessment) {
    throw new AppError("Assessment not found in this module", "NOT_FOUND", 404);
  }

  return true;
}

// Service function to get support tokens
const getECRequestTickets = async (
  userId: string,
  reqBody: GetECRequestTicketsRequestBody,
): Promise<GetECRequestTicketsResponse> => {
  const { search, page, pageSize } = reqBody;
  const { limit, offset } = getPagination(page, pageSize);
  // Get EC_REQUEST accessible module IDs
  let moduleIds: string[] = [];
  moduleIds = await getUserAssignedCourseModuleIds(userId);

  const data = await prisma.supportRequest.findMany({
    where: {
      stage: "EC_REQUEST",
      OR: [
        { status: { in: ["RESOLVED", "REJECTED"] }, userId: userId },
        { status: { notIn: ["RESOLVED", "REJECTED"] } },
      ],

      // Filter by faculty assigned moduleIds
      ...{ moduleId: { in: moduleIds } },

      // Search filter (on message/subject)
      ...(search
        ? {
            OR: [
              { message: { contains: search, mode: "insensitive" } },
              { subject: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      studentCourse: {
        select: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              studentNo: true,
              photo: true,
              accountStatus: true,
            },
          },
          sessionCourse: {
            select: {
              course: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit, // Limit number of results
    skip: offset, // Skip records for pagination
  });

  const supportTickets = data.map((token) => ({
    id: token.id,
    tokenNo: token.tokenNo,
    status: token.status,
    stage: token.stage,
    studentCourseId: token.studentCourseId,
    course: {
      title: token.studentCourse.sessionCourse.course.title,
    },
    student: {
      id: token.studentCourse.student.id,
      firstName: token.studentCourse.student.firstName,
      lastName: token.studentCourse.student.lastName,
      email: token.studentCourse.student.email,
      studentNo: token.studentCourse.student.studentNo,
      photo: token.studentCourse.student.photo,
      status: token.studentCourse.student.accountStatus,
    },
    moduleId: token.moduleId,
    subject: token.subject,
    message: token.message,
    createdAt: token.createdAt,
    updatedAt: token.updatedAt,
  }));

  return {
    supportTickets: supportTickets,
    pagination: {
      page: reqBody.page,
      pageSize: reqBody.pageSize,
      totalCount: supportTickets.length,
      totalPages: Math.ceil(supportTickets.length / limit),
    },
  };
};

// Resolve EC_REQUEST Ticket
const resolveECRequestTicket = async (
  userId: string,
  reqBody: { studentId: string; moduleId: string; assessmentId: string; time?: string; tokenId: string },
) => {
  const { tokenId, moduleId, assessmentId, time } = reqBody;

  // Get support token
  const supportTicket = await prisma.supportRequest.findFirst({
    where: {
      id: tokenId,
      status: "PENDING",
      stage: "EC_REQUEST",
    },
    include: {
      studentCourse: {
        select: {
          studentId: true,
          sessionCourseId: true,
        },
      },
    },
  });

  if (!supportTicket) {
    throw new AppError("Support token already processed or not found", "NOT_FOUND", 404);
  }

  if (!moduleId && !supportTicket.moduleId) {
    throw new AppError("Module ID is required", "BAD_REQUEST", 400);
  }

  const cModuleId = supportTicket.moduleId ?? moduleId;

  // Check if the resolving faculty user has access to the module (Particular cModule Access Check)
  if (cModuleId) {
    await ensureFacultyCourseModuleAccess(cModuleId, userId);
  } else {
    throw new AppError(`You are not enrolled in this module.`, "NOT_FOUND", 404);
  }

  await validateStudentModuleAccess(supportTicket.studentCourse.studentId, cModuleId, assessmentId);

  const updatedToken = await prisma.$transaction(async (tx) => {
    const course = await tx.sessionCourse.findUnique({
      where: { id: supportTicket.studentCourse.sessionCourseId },
      select: { ECAssessmentList: true },
    });

    const currentList = (course?.ECAssessmentList as unknown as ECAssessmentListType[]) || [];

    // Check if tokenNo already exists
    const tokenExists = currentList.some((item) => item.tokenNo === supportTicket.tokenNo);

    if (tokenExists) {
      throw new AppError("This request has already been processed", "CONFLICT", 409);
    }

    await tx.sessionCourse.update({
      where: { id: supportTicket.studentCourse.sessionCourseId },
      data: {
        ECAssessmentList: [
          ...((course?.ECAssessmentList as unknown as ECAssessmentListType[]) ?? []),
          {
            tokenNo: supportTicket.tokenNo,
            studentId: supportTicket.studentCourse.studentId,
            moduleId: cModuleId,
            assessmentId,
            time,
            createdAt: new Date().toISOString(),
          },
        ] as Prisma.InputJsonValue,
      },
    });

    await createAuditLog({
      userId,
      action: `${userDetails(userId)} resolved ${supportTicket.studentCourse.studentId} ec2-request ticket-:${tokenId}`,
      moduleId: cModuleId,
      targetUserId: supportTicket.studentCourse.studentId,
    });

    return tx.supportRequest.update({
      where: { id: tokenId },
      data: {
        status: "RESOLVED",
        userId: userId,
      },
    });
  });

  return {
    supportTicket: {
      id: updatedToken.id,
      status: updatedToken.status,
      stage: updatedToken.stage,
      moduleId: updatedToken.moduleId,
      studentCourseId: updatedToken.studentCourseId,
      subject: updatedToken.subject,
      message: updatedToken.message,
      createdAt: updatedToken.createdAt,
      updatedAt: updatedToken.updatedAt,
    },
  };
};

// Reject Support Ticket
const rejectECRequestTicket = async (userId: string, reqBody: { tokenId: string }) => {
  const { tokenId } = reqBody;

  // Get support token
  const supportTicket = await prisma.supportRequest.findFirst({
    where: {
      id: tokenId,
      status: {
        in: ["PENDING", "ASSIGNED"],
      },
    },
  });

  if (!supportTicket) {
    throw new AppError("Support token already processed or not found", "BAD_REQUEST", 400);
  }
  if (supportTicket.stage !== "EC_REQUEST") {
    throw new AppError("This is not EC_REQUEST", "WRONG_STAGE", 400);
  }

  // Update the support token with the assigned user ID and status
  const updatedToken = await prisma.supportRequest.update({
    where: {
      id: tokenId,
    },
    data: {
      status: "REJECTED",
      userId: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} rejected support token ${tokenId}`,
    moduleId: supportTicket.moduleId ?? "",
  });

  return {
    supportTicket: {
      id: updatedToken.id,
      status: updatedToken.status,
      stage: updatedToken.stage,
      moduleId: updatedToken.moduleId,
      studentCourseId: updatedToken.studentCourseId,
      subject: updatedToken.subject,
      message: updatedToken.message,
      createdAt: updatedToken.createdAt,
      updatedAt: updatedToken.updatedAt,
    },
  };
};

export const ECRequestTicketService = {
  getECRequestTickets,
  rejectECRequestTicket,
  resolveECRequestTicket,
};
