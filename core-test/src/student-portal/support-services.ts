import { nanoid } from "nanoid";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import {
  CourseSnapshot,
  CreateSupportRequestInput,
  CreateSupportRequestResponse,
  GetFAQsResponse,
  GetSupportTicketsResponse,
} from "./types";
import { SupportRequestStatus } from "@prisma/client";

// Service function to create a support request for a student
export const createSupportRequestService = async (
  studentId: string,
  inputData: CreateSupportRequestInput,
): Promise<CreateSupportRequestResponse> => {
  // First, verify that the student course belongs to the authenticated student
  const studentCourse = await prisma.studentCourse.findUnique({
    where: {
      id: inputData.studentCourseId,
      studentId: studentId, // Ensure the student course belongs to the authenticated student
    },
  });

  if (!studentCourse) {
    throw new AppError(
      "Student course not found or does not belong to the authenticated student",
      "STUDENT_COURSE_NOT_FOUND",
      404,
    );
  }

  // Create the support request in the database
  const supportRequest = await prisma.supportRequest.create({
    data: {
      message: inputData.message,
      tokenNo: nanoid(10),
      studentCourseId: inputData.studentCourseId,
      ...(inputData.moduleId && { moduleId: inputData.moduleId }),
      subject: inputData.subject,
    },
  });

  return {
    supportRequest: {
      id: supportRequest.id,
      message: supportRequest.message,
      tokenNo: supportRequest.tokenNo ?? "",
      status: supportRequest.status,
      // stage: supportRequest.stage,
      studentCourseId: supportRequest.studentCourseId,
      ...(supportRequest.moduleId && { moduleId: supportRequest.moduleId }),
      subject: supportRequest.subject,
      createdAt: supportRequest.createdAt.toISOString(),
      updatedAt: supportRequest.updatedAt.toISOString(),
    },
  };
};

// Service function to get all support tickets for a student
export const getSupportTicketsService = async (
  studentId: string,
  status: SupportRequestStatus | undefined,
  search: string,
  page: number,
  pageSize: number = 10,
): Promise<GetSupportTicketsResponse> => {
  // Fetch all support tickets from the database
  // const supportTickets = await prisma.supportRequest.findMany({
  //   where: {
  //     studentCourse: {
  //       studentId: studentId,
  //     },
  //     ...(search && { message: { contains: search }, subject: { contains: search } }),
  //     ...(status && { status }),
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   skip: (page - 1) * pageSize,
  //   take: pageSize,
  // });
  const supportTickets = await prisma.supportRequest.findMany({
    where: {
      studentCourse: {
        studentId,
      },
      ...(search && {
        OR: [
          { message: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
        ],
      }),
      ...(status && { status }),
    },
    include: {
      studentCourse: {
        include: {
          sessionCourse: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Transform the database objects to the response format
  const transformedSupportTickets = supportTickets.map((supportTicket) => {
    const snapshot = supportTicket.studentCourse.sessionCourse.courseSnapshot as CourseSnapshot | null;

    const matchedModule =
      supportTicket.moduleId && snapshot?.courseModules
        ? snapshot.courseModules.find((m) => m.cModule.id === supportTicket.moduleId)
        : undefined;
    return {
      id: supportTicket.id,
      message: supportTicket.message,
      status: supportTicket.status,
      tokenNo: supportTicket.tokenNo ?? "",
      studentId: supportTicket.studentCourse.studentId,
      courseName: snapshot?.title ?? "",
      moduleName: matchedModule?.cModule.title ?? "",
      studentCourseId: supportTicket.studentCourseId,
      ...(supportTicket.moduleId && { moduleId: supportTicket.moduleId }),
      subject: supportTicket.subject,
      createdAt: supportTicket.createdAt.toISOString(),
      updatedAt: supportTicket.updatedAt.toISOString(),
    };
  });
  // const transformedSupportTickets = supportTickets.map((supportTicket) => ({
  //   id: supportTicket.id,
  //   message: supportTicket.message,
  //   status: supportTicket.status,
  //   tokenNo: supportTicket.tokenNo ?? "",
  //   studentId: supportTicket.studentCourse.studentId,
  //   courseName: supportTicket.studentCourse.sessionCourse.courseSnapshot?.title ?? "",
  //   moduleName: supportTicket.studentCourse.sessionCourse.courseSnapshot?.courseModules?.[0]?.cModule?.title ?? "",
  //   studentCourseId: supportTicket.studentCourseId,
  //   json: supportTicket.studentCourse,
  //   ...(supportTicket.moduleId && { moduleId: supportTicket.moduleId }),
  //   subject: supportTicket.subject,
  //   createdAt: supportTicket.createdAt.toISOString(),
  //   updatedAt: supportTicket.updatedAt.toISOString(),
  // }));

  return {
    supportTickets: transformedSupportTickets,
    pagination: {
      page,
      pageSize,
      totalCount: supportTickets.length,
    },
  };
};

// Service function to get all FAQs
export const getFAQsService = async (): Promise<GetFAQsResponse> => {
  // Fetch all FAQs from the database
  const faqs = await prisma.faq.findMany({
    orderBy: {
      createdAt: "asc", // Order FAQs by creation date, oldest first
    },
  });

  // Transform the database objects to the response format
  const transformedFAQs = faqs.map((faq) => ({
    id: faq.id,
    question: faq.question,
    answer: faq.answer,
    createdAt: faq.createdAt.toISOString(),
    updatedAt: faq.updatedAt.toISOString(),
  }));

  return { faqs: transformedFAQs };
};
