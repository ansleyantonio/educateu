import z from "zod";
import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { ApplicationService, getAgentAuditLogsService } from "./services";
// import { getApplicationsReqQuerySchema } from "./types";
import { Response } from "express";
// import { ValidatingUtils } from "./utils/validation";
import { AppError } from "../../utils/AppError";
import { applicationSchema } from "../../prisma/zodSchema/application";
import { ValidatingUtils } from "./utils/validation";
import { create } from "node:domain";
import app from "../../app";
import prisma from "../../prismaClient";
import { generateApplicationId } from "../../utils/applicationIdGenerator";
import createAuditLog from "../../utils/auditlog";
import { formatChanges } from "./log";
import { emailVerification, sendEmail } from "./emailConfig";
import axios from "axios";
import {
  getAllAdmissionUsers,
  getUserIdFromApplication,
  sendApplicationSummaryNotification,
  sendEmailVerification,
  sendEmailVerificationNotification,
  sendRealTimeData,
} from "../../utils/notificationService";

async function getApplications(req: RequestWithUser, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized: User in request not found", "UNAUTHORIZED", 401);
  }

  // const queryData = await ValidatingUtils.validateReqQueryBasedOnUserRole(req.query, req.user);

  const { applications, pagination } = await ApplicationService.getAllApplications(req.user, req.query);

  sendSuccessResponse(res, { applications }, undefined, undefined, pagination);
}

async function createApplication(req: RequestWithUser, res: Response) {
  if (!req.user) {
    throw new AppError("Unauthorized: User in request not found", "UNAUTHORIZED", 401);
  }

  const body = zodSafeParse(req.body, applicationSchema);

  if (body.courseSelection) {
    body.courseSelection.courseId = body.courseSelection.course;
    delete body.courseSelection.course;

    // Validate that the session is in UPCOMING, ACTIVE, or TEMPORARILY_ACTIVE status
    if (body.courseSelection.courseId) {
      const sessionCourse = await prisma.sessionCourse.findUnique({
        where: { id: body.courseSelection.courseId },
        include: {
          session: true,
        },
      });

      if (!sessionCourse) {
        throw new AppError("Selected course not found", "NOT_FOUND", 404);
      }

      const allowedStatuses = ["UPCOMING", "ACTIVE", "TEMPORARILY_ACTIVE"];
      if (!allowedStatuses.includes(sessionCourse.session.status)) {
        throw new AppError(
          `Applications can only be made for courses in upcoming, active, or temporarily active sessions. The selected session "${sessionCourse.session.name}" is currently in ${sessionCourse.session.status} status.`,
          "BAD_REQUEST",
          400,
        );
      }
    }
  }

  let rawSupportingDocumentsData;

  let formattedSupportingDocumentsData;

  if (body.supportingDocument) {
    rawSupportingDocumentsData = body.supportingDocument;
    delete body.supportingDocument;

    formattedSupportingDocumentsData = Object.entries(rawSupportingDocumentsData).map((value) => {
      return {
        name: value[0],
        attachment: {
          create: {
            paths: value[1],
          },
        },
      };
    });
  }

  // console.log(formattedSupportingDocumentsData);

  const formattedDataToInsertIntoDB = Object.fromEntries(
    Object.entries(body).map((value) => {
      if (
        typeof value[1] === "object" &&
        value[1] !== null &&
        !Array.isArray(value[1]) &&
        Object.prototype.toString.call(value[1]) === "[object Object]"
      ) {
        return [value[0], { create: value[1] }];
      } else {
        return value;
      }
    }),
  );

  if (formattedSupportingDocumentsData) {
    formattedDataToInsertIntoDB.supportingDocument = {
      create: {
        supportingDocumentAttachments: {
          create: formattedSupportingDocumentsData,
        },
      },
    };
  }

  const application = await ApplicationService.createApplication(formattedDataToInsertIntoDB, req.user);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Created application: ${application.id}`,
      actionType: "application_management",
      // previousValue: null,
      previousValue: JSON.stringify(application),
      courseId: application.id,
    });
  }

  sendSuccessResponse(res, { application });
}

async function updateApplication(req: RequestWithUser, res: Response) {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const body = zodSafeParse(req.body, applicationSchema);

  // const existingApplication = await prisma.application.findUnique({
  //   where: {
  //     id: applicationId,
  //   },
  // });
  const existingApplication = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      personalStatement: true,
      academicBackground: true,
      // courseSelection: true,
      courseSelection: {
        include: {
          session: true,
          awardingBody: true,
          course: {
            include: { course: true },
          },
        },
      },
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: true,
      criminalBackground: true,
      supportingDocument: true,
    },
  });

  if (!existingApplication) {
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }

  if (body.courseSelection) {
    body.courseSelection.courseId = body.courseSelection.course;
    delete body.courseSelection.course;
  }

  let rawSupportingDocumentsData;

  let formattedSupportingDocumentsData;

  if (body.supportingDocument) {
    rawSupportingDocumentsData = body.supportingDocument;
    delete body.supportingDocument;

    formattedSupportingDocumentsData = Object.entries(rawSupportingDocumentsData).map((value) => {
      return value;
    });
  }
  if (body.references) {
    body.reference = body.references;
    delete body.references;
  }
  const formattedDataToInsertIntoDB = Object.fromEntries(
    Object.entries(body).map((value) => {
      if (
        typeof value[1] === "object" &&
        value[1] !== null &&
        !Array.isArray(value[1]) &&
        Object.prototype.toString.call(value[1]) === "[object Object]"
      ) {
        return [value[0], { upsert: { create: value[1], update: value[1] } }];
      } else {
        return value;
      }
    }),
  );

  // Generate application ID if not draft
  if (
    "applicationId" in existingApplication &&
    !existingApplication.applicationId &&
    body.status &&
    body.status !== "DRAFT"
  ) {
    // Generate application ID
    const appId = await generateApplicationId(applicationId);

    // Add applicationId to the data
    formattedDataToInsertIntoDB.applicationId = appId;
  }

  const application = await ApplicationService.updateApplication(formattedDataToInsertIntoDB, applicationId);

  if (formattedSupportingDocumentsData) {
    let supportingDocumentId = application.application?.supportingDocument?.id;

    if (!supportingDocumentId) {
      supportingDocumentId = (
        await prisma.supportingDocument.create({
          data: {
            applicationId: application.application.id,
          },
        })
      ).id as string;
    }

    for (const supportingDocument of formattedSupportingDocumentsData) {
      let attachmentId = (
        await prisma.attachment.findFirst({
          where: {
            // name: supportingDocument[0],
            supportingDocumentAttachments: {
              some: {
                name: supportingDocument[0],
                supportingDocumentId: supportingDocumentId,
              },
            },
          },
        })
      )?.id;

      if (!attachmentId) {
        attachmentId = (
          await prisma.attachment.create({
            data: {
              // name: supportingDocument[0],
              paths: supportingDocument[1] as string,
              supportingDocumentAttachments: {
                create: {
                  name: supportingDocument[0],
                  supportingDocumentId: supportingDocumentId,
                },
              },
            },
          })
        ).id;
      } else {
        await prisma.attachment.update({
          where: {
            id: attachmentId,
          },
          data: {
            paths: supportingDocument[1] as string,
          },
        });
      }
    }
  }

  const updatedApplication = await prisma.application.findUnique({
    where: { id: application.application.id },
    include: {
      personalInformation: true,
      personalStatement: true,
      academicBackground: true,
      courseSelection: {
        include: {
          session: true,
          awardingBody: true,
          course: { include: { course: true } },
        },
      },
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: true,
      criminalBackground: true,
      supportingDocument: {
        include: {
          supportingDocumentAttachments: {
            include: {
              attachment: true,
            },
          },
        },
      },
    },
  });

  if (!updatedApplication) {
    throw new AppError("Failed to fetch updated application", "NOT_FOUND", 404);
  }

  const readableChanges = formatChanges(existingApplication, updatedApplication);

  if (req.user && readableChanges.length > 0) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: readableChanges.join("\n"),
      actionType: "application_management",
      previousValue: JSON.stringify(existingApplication),
      newValue: JSON.stringify(updatedApplication),
      courseId: updatedApplication.id,
    });
  }

  if (updatedApplication.status === "PENDING") {
    sendEmailVerification({
      applicationId,
    });
    sendRealTimeData({
      userIds: await getAllAdmissionUsers(),
      title: "Application  Submitted",
      message: ` ${updatedApplication?.personalInformation?.firstName} and applicationId ${applicationId} application has been submitted`,
    });
  }

  sendSuccessResponse(res, { application: updatedApplication });
}

async function getApplicationById(req: RequestWithUser, res: Response) {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const application = await ApplicationService.getApplicationById(applicationId);

  sendSuccessResponse(res, application);
}

async function getStudentByEmail(req: RequestWithUser, res: Response) {
  const { email } = zodSafeParse(req.query, z.object({ email: z.string().email() }));

  const student = await ApplicationService.getStudentByEmail(email);

  sendSuccessResponse(res, { student });
}

// async function assignApplicationToAdmissionOfficer(req: RequestWithUser, res: Response) {
//   const { applicationId, admissionOfficerId } = zodSafeParse(
//     req.body,
//     z.object({ applicationId: z.string().uuid(), admissionOfficerId: z.string().uuid() }),
//   );
//
//   const userRoleApplication = await ApplicationService.assignApplicationToAdmissionOfficer(
//     applicationId,
//     admissionOfficerId,
//   );
//
//   sendSuccessResponse(res, userRoleApplication);
// }

const getAgentAuditLogs = async (req: RequestWithUser, res: Response) => {
  const agentId = req.params.agentId;

  if (!agentId) {
    throw new AppError("Agent ID is required", "BAD_REQUEST", 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const { auditLogs, pagination } = await getAgentAuditLogsService({
    agentId,
    page,
    limit,
  });

  return sendSuccessResponse(res, { auditLogs }, "Agent audit logs fetched", 200, pagination);
};

export const ApplicationController = {
  getApplications,
  createApplication,
  updateApplication,
  getApplicationById,
  getStudentByEmail,
  // assignApplicationToAdmissionOfficer,
  getAgentAuditLogs,
};
