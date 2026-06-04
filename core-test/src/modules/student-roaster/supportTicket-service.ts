import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import { GetSupportTokensRequestBody, GetSupportTokensResponse, CourseSnapshot, CourseModuleItem } from "./types";
import createAuditLog from "../../utils/auditlog";
import userDetails from "../../utils/userinfo";
import { sendRealTimeData } from "../../utils/notificationService";
import { Prisma } from "@prisma/client";

// Reusable function to check if user has access to a module
async function checkUserModuleAccess(userId: string, moduleNames: string | string[]): Promise<boolean> {
  const moduleList = Array.isArray(moduleNames) ? moduleNames : [moduleNames];

  const access = await prisma.roleModule.findFirst({
    where: {
      role: {
        userPortalCategoryRoles: {
          some: {
            userPortalCategory: {
              userId: userId,
              status: "ACTIVE",
            },
          },
        },
      },
      module: {
        name: {
          in: moduleList,
        },
      },
    },
    select: { id: true },
  });

  return !!access;
}

// Get portal name based on stage
const STAGE_PORTAL_MAP: Record<string, string> = {
  EC_REQUEST: "faculty-ec-request",
  WITHDRAWAL: "withdrawal-request",
  SUPPORT: "support",
};

export const getPortalName = (stage: string): string => STAGE_PORTAL_MAP[stage] ?? stage;

// Service function to get support tokens
const getSupportTokens = async (
  userId: string,
  reqBody: GetSupportTokensRequestBody,
): Promise<GetSupportTokensResponse> => {
  const { scope, search, page, pageSize, courseType, courseId } = reqBody;
  const { limit, offset } = getPagination(page, pageSize);

  const where: Prisma.SupportRequestWhereInput = {
    AND: [
      {
        stage: "SUPPORT",
      },
      // Scope filter (own vs all)
      {
        ...(scope === "own" ? { userId } : { status: "PENDING" }),
      },
      // Search filter (on message/subject/tokenNo/studentCourse)
      ...(search
        ? [
            {
              OR: [
                { tokenNo: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { message: { contains: search, mode: Prisma.QueryMode.insensitive } },
                { subject: { contains: search, mode: Prisma.QueryMode.insensitive } },
                {
                  studentCourse: {
                    student: {
                      OR: [
                        { firstName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { lastName: { contains: search, mode: Prisma.QueryMode.insensitive } },
                        { email: { contains: search, mode: Prisma.QueryMode.insensitive } },
                      ],
                    },
                  },
                },
              ],
            },
          ]
        : []),

      ...(courseType || courseId
        ? [
            {
              studentCourse: {
                sessionCourse: {
                  course: {
                    ...(courseType ? { courseType } : {}),
                    ...(courseId ? { id: courseId } : {}),
                  },
                },
              },
            },
          ]
        : []),
    ],
  };

  // Portal Name
  const data = await prisma.supportRequest.findMany({
    where,
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
                  id: true,
                  title: true,
                  courseType: true,
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
      id: token.studentCourse.sessionCourse.course.id,
      title: token.studentCourse.sessionCourse.course.title,
      courseType: token.studentCourse.sessionCourse.course.courseType,
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

// Transfer Support Tokens
const transferSupportTokens = async (
  userId: string,
  reqBody: { tokenId: string; stage: "EC_REQUEST" | "WITHDRAWAL" },
) => {
  const { tokenId, stage } = reqBody;

  // Check if the assignee user has access to the module
  const assigneeHasAccess = await checkUserModuleAccess(userId, "support");
  if (!assigneeHasAccess) {
    throw new AppError(`You don't have access on this module.`, "STAGE_ACCESS_DENIED", 422);
  }

  // Get support token
  const supportTicket = await prisma.supportRequest.findUnique({
    where: { id: tokenId, stage: "SUPPORT" },
  });

  if (stage === "EC_REQUEST" && (!supportTicket?.moduleId || supportTicket?.moduleId === null)) {
    throw new AppError("Ticket cannot be transferred to EC_REQUEST without moduleId", "MODULE_ID_REQUIRED", 400);
  }

  if (!supportTicket) throw new AppError("Support token not found", "NOT_FOUND", 404);
  if (supportTicket.status === "RESOLVED" || supportTicket.status === "REJECTED") {
    throw new AppError("This token is already Resolved or Rejected", "ALREADY_PROCESSED", 400);
  }
  if (supportTicket.stage !== "SUPPORT") {
    throw new AppError("This token is already transferred to another stage", "ALREADY_PROCESSED", 400);
  }

  // Update the support token with the assigned user ID and status
  const updatedToken = await prisma.supportRequest.update({
    where: {
      id: tokenId,
    },
    data: {
      status: "PENDING",
      stage,
    },
  });
  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} transferred support token: ${tokenId} to {stage}`,
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

// Assign Support Tokens
const assignSupportTokens = async (userId: string, reqBody: { tokenId: string; assignedToId?: string }) => {
  const { tokenId, assignedToId } = reqBody;

  // Get support token
  const supportTicket = await prisma.supportRequest.findUnique({
    where: { id: tokenId },
  });

  if (!supportTicket) throw new AppError("Support token not found", "NOT_FOUND", 404);

  // Portal Name
  const stage = supportTicket?.stage;
  const portalName = getPortalName(stage);

  const targetUserId = assignedToId ?? userId;

  // Check if the assignee user has access to the module
  const assigneeHasAccess = await checkUserModuleAccess(userId, portalName);
  if (!assigneeHasAccess) {
    throw new AppError(`You don't have ${stage} access`, "STAGE_ACCESS_DENIED", 422);
  }

  // Check if the assigning user has access to the module
  if (assignedToId) {
    const assigningHasAccess = await checkUserModuleAccess(assignedToId, portalName);
    if (!assigningHasAccess) {
      throw new AppError(`You don't have ${stage} access`, "STAGE_ACCESS_DENIED", 422);
    }
  }

  // Get course snapshot for the support token
  const data = await prisma.studentCourse.findUnique({
    where: {
      id: supportTicket.studentCourseId,
    },
    select: {
      sessionCourse: {
        select: {
          courseSnapshot: true,
        },
      },
    },
  });

  const snapshot = data?.sessionCourse?.courseSnapshot as CourseSnapshot | null;

  if (!snapshot) {
    throw new AppError("Course snapshot not found", "NOT_FOUND", 404);
  }

  // Get module name for audit log
  const moduleName =
    snapshot.courseModules?.find((m: CourseModuleItem) => m.cModule?.id === supportTicket.moduleId)?.cModule?.title ??
    "";

  // Update the support token with the assigned user ID and status
  const updatedToken = await prisma.supportRequest.update({
    where: {
      id: tokenId,
    },
    data: {
      userId: targetUserId,
      status: "ASSIGNED",
    },
  });

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} assigned support token ${tokenId} to ${userDetails(assignedToId ?? userId)}`,
    targetUserId,
    moduleId: supportTicket.moduleId ?? "",
    moduleName: moduleName,
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

// Resolve Support Tokens
const resolveSupportTokens = async (userId: string, reqBody: { tokenId: string }) => {
  const { tokenId } = reqBody;
  // Get support token
  const supportTicket = await prisma.supportRequest.findFirst({
    where: {
      id: tokenId,
      stage: "SUPPORT",
      status: {
        in: ["PENDING", "ASSIGNED"],
      },
    },
    include: {
      studentCourse: {
        select: {
          studentId: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!supportTicket) {
    throw new AppError("Support token already processed or not found", "BAD_REQUEST", 400);
  }

  if (supportTicket.userId === null) {
    throw new AppError("This support ticket is not assigned to any user", "TICKET_NOT_ASSIGNED", 409);
  }

  if (supportTicket.userId !== userId) {
    throw new AppError(`You are not authorized to resolve this support ticket`, "UNAUTHORIZED", 401);
  }

  // Update the support token with the assigned user ID and status
  const updatedToken = await prisma.supportRequest.update({
    where: {
      id: tokenId,
    },
    data: {
      status: "RESOLVED",
      userId: userId,
    },
  });

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} resolved support token ${tokenId}`,
    moduleId: supportTicket.moduleId ?? "",
  });

  // Send real time Notification
  sendRealTimeData({
    userIds: [userId, supportTicket?.studentCourse?.studentId].filter(Boolean) as string[],
    title: "Support Ticket Resolved",
    message:
      "The support ticket has been resolved for " +
      `${supportTicket?.studentCourse?.student?.firstName} ${supportTicket?.studentCourse?.student?.lastName}`,
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
const rejectSupportTicket = async (userId: string, reqBody: { tokenId: string }) => {
  const { tokenId } = reqBody;

  // Get support token
  const supportTicket = await prisma.supportRequest.findFirst({
    where: {
      id: tokenId,
      status: {
        in: ["PENDING", "ASSIGNED"],
      },
      stage: "SUPPORT",
    },
    include: {
      studentCourse: {
        select: {
          studentId: true,
          student: {
            select: {
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  if (!supportTicket) {
    throw new AppError("Support token already processed or not found", "BAD_REQUEST", 400);
  }

  if (supportTicket.stage === "SUPPORT" && supportTicket.userId === null) {
    throw new AppError("This support ticket is not assigned to any user", "TICKET_NOT_ASSIGNED", 409);
  }
  if (supportTicket.stage === "SUPPORT" && supportTicket.userId !== userId) {
    throw new AppError("You are not allowed to resolve this support ticket", "TICKET_RESOLVE_NOT_ALLOWED", 422);
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

  // Send real time Notification
  sendRealTimeData({
    userIds: [userId, supportTicket?.studentCourse?.studentId].filter(Boolean) as string[],
    title: "Support Ticket Rejected",
    message:
      "The support ticket has been rejected for " +
      `${supportTicket?.studentCourse?.student?.firstName} ${supportTicket?.studentCourse?.student?.lastName}`,
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

export const SupportTicketService = {
  getSupportTokens,
  transferSupportTokens,
  assignSupportTokens,
  resolveSupportTokens,
  rejectSupportTicket,
};
