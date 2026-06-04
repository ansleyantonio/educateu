import prisma from "../../prismaClient";
import { EnrollmentStatus, Prisma } from "@prisma/client";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import { GetWithdrawalRequestTicketsRequestBody, GetWithdrawalRequestTicketsResponse } from "./types";
import createAuditLog from "../../utils/auditlog";
import userDetails from "../../utils/userinfo";
// import { getUserAssignedCourseModuleIds } from "../../helpers/user-assigned-cModules";
import { sendRealTimeData } from "../../utils/notificationService";

// Service function to get support tokens
const getWithdrawalRequestTickets = async (
  userId: string,
  reqBody: GetWithdrawalRequestTicketsRequestBody,
): Promise<GetWithdrawalRequestTicketsResponse> => {
  const { search, page, pageSize } = reqBody;
  const { limit, offset } = getPagination(page, pageSize);
  // Get EC_REQUEST accessible module IDs
  // let moduleIds: string[] = [];
  // moduleIds = await getUserAssignedCourseModuleIds(userId);

  const data = await prisma.supportRequest.findMany({
    where: {
      stage: "WITHDRAWAL",

      // Scope filter (own vs all)
      OR: [
        { status: { in: ["RESOLVED", "REJECTED"] }, userId: userId },
        { status: { notIn: ["RESOLVED", "REJECTED"] } },
      ],

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

// Resolve Withdraw Support Tokens
const resolveWithdrawSupportTicket = async (userId: string, reqBody: { tokenId: string }) => {
  const { tokenId } = reqBody;

  // Get support token
  const supportTicket = await prisma.supportRequest.findFirst({
    where: {
      id: tokenId,
      status: "PENDING",
      stage: "WITHDRAWAL",
    },
  });

  if (!supportTicket) {
    throw new AppError("Support token already processed or not found", "BAD_REQUEST", 400);
  }

  // Update the support token with the assigned user ID and status
  const updatedToken = await prisma.$transaction(async (tx) => {
    // Update the support request
    const request = await tx.supportRequest.update({
      where: { id: tokenId },
      data: {
        status: "RESOLVED",
        userId: userId,
      },
    });

    // Update the related student course
    await tx.studentCourse.update({
      where: { id: request.studentCourseId },
      data: {
        enrollmentStatus: EnrollmentStatus.WITHDRAWN,
      },
    });

    // Explicitly return the supportRequest
    return request;
  });

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `${userDetails(userId)} resolved withdrawal-request ticket-:${tokenId}`,
    moduleId: supportTicket.moduleId ?? "",
  });
  const studentId = await prisma.studentCourse.findUnique({
    where: {
      id: supportTicket.studentCourseId,
    },
    select: {
      student: {
        select: {
          id: true,
        },
      },
    },
  });
  sendRealTimeData({
    userIds: [studentId?.student.id ?? ""],
    title: "withdrawal-request",
    message: `${(await userDetails(userId)).username} resolved withdrawal-request ticket-:${tokenId}`,

    //  type: "withdrawal-request",
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
  if (supportTicket.stage !== "WITHDRAWAL") {
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

export const WithdrawalRequestService = {
  getWithdrawalRequestTickets,
  resolveWithdrawSupportTicket,
  rejectECRequestTicket,
};
