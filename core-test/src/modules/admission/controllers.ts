/*
 * Admission Module Controllers
 *
 * This module defines HTTP request handlers for the admission system, managing
 * application processing, officer assignments, note management, and file checking
 * operations. Controllers handle request validation, business logic delegation,
 * and response formatting.
 *
 * Features:
 * - Application CRUD operations with module-specific filtering
 * - Admission officer assignment and management
 * - Application note creation and retrieval
 * - File check operations with status tracking
 * - Interview booking management
 * - Application outcome processing
 */

import { RequestWithUser } from "../../types";
import { Response } from "express";
import { AdmissionService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  applicationNoteSchema,
  getAdmissionOfficersReqQuerySchema,
  admissionGetApplicationsReqBodySchema,
  updateGeneralFileChecksSchema,
} from "./types";
import z from "zod";

import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { applicationSchema } from "../../prisma/zodSchema/application";
import { sendNotesEmail } from "../student-management/mail/config";
import { sendApplicationOutcomeEmail } from "../student-management/mail/courseFeeEmail";
import { sendApplicationDecisionRequestEmail } from "../../payments/mail/services";
import {
  sendApplicationDecisionRequestNotification,
  sendApplicationOutcomeNotification,
  sendNotesNotification,
  sendRealTimeData,
  getUserIdFromApplication,
  getUserIdFromUserPortalCategoryRole,
} from "../../utils/notificationService";
import { getUserNameFromUserPortalCategoryRoleId } from "../../utils/userinfo";
import app from "../../app";
import { send } from "process";

// Retrieves applications based on the requesting module context.
//
// This controller determines the module context from the URL path and applies
// appropriate filtering logic to return relevant applications.
const getApplications = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const reqBody = zodSafeParse(req.body, admissionGetApplicationsReqBodySchema);

  const { applications, pagination } = await AdmissionService.getApplications(reqBody, req.user.id);

  sendSuccessResponse(res, applications, undefined, undefined, pagination);
};

// Retrieves a single application by its unique identifier.
const getApplicationById = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.query, z.object({ applicationId: z.string().uuid() }));

  const application = await AdmissionService.getApplicationById(applicationId);

  sendSuccessResponse(res, application);
};

// Updates an application with nested object handling for related data.
//
// This controller handles complex application updates by formatting nested objects
// for Prisma upsert operations, allowing creation or updates of related entities.
async function updateApplication(req: RequestWithUser, res: Response) {
  const { applicationId } = zodSafeParse(req.query, z.object({ applicationId: z.string().uuid() }));

  const body = zodSafeParse(req.body, applicationSchema);

  // Transform nested objects for Prisma upsert operations
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

  const application = await AdmissionService.updateApplication(formattedDataToInsertIntoDB, applicationId);

  sendSuccessResponse(res, application);
}

const getApplicationAssignments = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.query, z.object({ applicationId: z.string().uuid() }));

  const applicationAssignments = await AdmissionService.getApplicationAssignments(applicationId);
  sendSuccessResponse(res, applicationAssignments);
};

// Assigns multiple applications to a specific admission officer.
//
// This controller handles bulk assignment operations, processing multiple
// applications and updating their stages to reflect the assignment.
const assignApplicationToAdmissionOfficer = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId, userPortalCategoryRoleId } = zodSafeParse(
    req.body,
    z.object({ applicationId: z.array(z.string().uuid()).min(1), userPortalCategoryRoleId: z.string().uuid() }),
  );

  // Process each application assignment
  for (const id of applicationId) {
    const application = await AdmissionService.assignApplicationToAdmissionOfficer(
      req.user.id,
      id,
      userPortalCategoryRoleId,
    );

    // Update application stage to reflect assignment
    await prisma.application.update({
      where: {
        id: id,
      },
      data: {
        stage: "ASSIGN",
      },
    });
  }

  const assignedUserName = await getUserNameFromUserPortalCategoryRoleId(userPortalCategoryRoleId);

  // Get all applicant user IDs to include in notification
  const applicantUserIds = await Promise.all(applicationId.map((id: string) => getUserIdFromApplication(id)));

  sendRealTimeData({
    userIds: [
      req.user?.userPortalCategory?.userId || "",
      ...applicantUserIds.flat(),
      await getUserIdFromUserPortalCategoryRole(userPortalCategoryRoleId),
    ].filter(Boolean) as string[],
    title: "Application Assigned",
    message: `An application has been assigned to ${assignedUserName.firstName} ${assignedUserName.lastName}. Please check your dashboard for details.`,
  });
  sendSuccessResponse(res, undefined, "Assignment completed");
};

const getAdmissionOfficers = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getAdmissionOfficersReqQuerySchema);

  const { admissionOfficers, pagination } = await AdmissionService.getAdmissionOfficers(reqQuery);
  sendSuccessResponse(res, admissionOfficers, undefined, undefined, pagination);
};

const getApplicationNotes = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const reqQuery = zodSafeParse(
    req.query,
    z.object({
      applicationId: z.string().uuid(),
      type: z.enum(["ALL", "GENERAL", "UPDATE_REQUEST", "FILE_UPDATE_REQUEST", "CHECK", "ADDITIONAL_CHECK"]).optional(),
      visibility: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
      page: z.coerce.number().optional(),
      pageSize: z.coerce.number().optional(),
    }),
  );

  const { applicationNotes, pagination } = await AdmissionService.getApplicationNotes(reqQuery, req.user.id);

  sendSuccessResponse(res, { applicationNotes }, undefined, undefined, pagination);
};

const createApplicationNote = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId } = zodSafeParse(req.query, z.object({ applicationId: z.string().uuid() }));

  const reqBody = zodSafeParse(req.body, applicationNoteSchema);

  const applicationNote = await AdmissionService.createApplicationNote(req.user.id, applicationId, reqBody);

  if (reqBody.visibility === "PUBLIC") {
    const userMail = await prisma.user.findUnique({
      where: { id: req.user?.userPortalCategory?.userId },
      select: { email: true, agentEmail: true, facultyEmail: true },
    });

    const applicantEmail = await prisma.application.findUnique({
      where: { id: applicationId },
      select: { personalInformation: { select: { email: true, firstName: true, lastName: true } } },
    });

    // Pick the first existing email from userMail
    const senderEmail = userMail?.email || userMail?.agentEmail || userMail?.facultyEmail;

    if (!senderEmail) {
      throw new Error("No valid sender email found for this user.");
    }

    const recipientEmails = [applicantEmail?.personalInformation?.email, senderEmail].filter(Boolean);

    const fullName =
      `${applicantEmail?.personalInformation?.firstName || ""} ${applicantEmail?.personalInformation?.lastName || ""}`.trim();

    // await sendNotesEmail(recipientEmails as string[], fullName, reqBody.note);
    sendNotesNotification({
      emails: recipientEmails as string[],
      name: fullName,
      noteContent: reqBody.note,
    });
  }

  sendRealTimeData({
    userIds: [req.user?.userPortalCategory?.userId || "", ...(await getUserIdFromApplication(applicationId))].filter(
      Boolean,
    ) as string[],
    title: "New Application Note",
    message: "A new note has been added in application. Please check your dashboard for details.",
  });
  sendSuccessResponse(res, applicationNote);
};

const getGeneralFileChecks = async (req: RequestWithUser, res: Response) => {
  const { applicationId, fileCheckStatus } = zodSafeParse(
    req.query,
    z.object({
      applicationId: z.string().uuid(),
      fileCheckStatus: z
        .enum([
          "PENDING",
          "INFORMATION_REQUIRED",
          "INFORMATION_REQUIRED_ADDITIONAL",
          "NO_INFORMATION_REQUIRED_ADDITIONAL",
          "NO_INFORMATION_REQUIRED",
        ])
        .default("PENDING")
        .optional(),
    }),
  );

  const generalFileChecks = await AdmissionService.getGeneralFileChecks(applicationId, fileCheckStatus);

  sendSuccessResponse(res, generalFileChecks);
};

const updateGeneralFileChecks = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new Error("Unauthorized: User not found");
  }

  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      generalFileCheckStatus: true,
      additionalFileCheckStatus: true,
      userPortalCategoryRoleApplications: {
        select: {
          userPortalCategoryRoleId: true,
        },
      },
    },
  });

  const firstSlug = req.originalUrl.split("/").filter(Boolean)[0];

  if (firstSlug === "admission" && application?.generalFileCheckStatus === "APPROVED") {
    throw new AppError("Cannot update general file check status after approval", "BAD_REQUEST", 400);
  } else if (firstSlug === "additional-file-check") {
    if (application?.additionalFileCheckStatus === "APPROVED") {
      throw new AppError("Cannot update additional file check status after approval", "BAD_REQUEST", 400);
    }
    const sameAdmissionOfficer = application?.userPortalCategoryRoleApplications.some(
      (app) => app.userPortalCategoryRoleId === req.user?.id,
    );
    if (sameAdmissionOfficer) {
      throw new AppError("Additional file check cannot be updated by the same admission officer", "BAD_REQUEST", 400);
    }
  }

  const reqBody = zodSafeParse(req.body, updateGeneralFileChecksSchema);

  const checkType = firstSlug === "admission" ? "check" : "additional-check";

  const generalFileChecks = await AdmissionService.updateGeneralFileChecks(
    applicationId,
    reqBody,
    req.user.id,
    checkType,
  );

  // Get the applicant's user ID to include in notification
  const applicantUserId = await getUserIdFromApplication(applicationId);

  sendRealTimeData({
    userIds: [req.user?.userPortalCategory?.userId || "", ...applicantUserId].filter(Boolean) as string[],
    title: "file check update",
    message: `The ${checkType} status of  ${applicationId} application  ${reqBody.body}. Please check your dashboard for details.`,
    relatedEntity: `${process.env.FRONTEND_URL}/agent/application-management/${applicationId}/document`,
    type: "DOCUMENT_REQUEST",
  });
  sendSuccessResponse(res, {});
};

const getFileChecks = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const { type } = zodSafeParse(req.query, z.object({ type: z.enum(["CHECK", "ADDITIONAL_CHECK"]) }));

  const fileChecks = await AdmissionService.getFileChecks(applicationId, type);

  sendSuccessResponse(res, fileChecks);
};

const getApplicationBookings = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const applicationBookings = await AdmissionService.getApplicationBookings(applicationId);
  sendSuccessResponse(res, applicationBookings);
};

const submitApplication = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const app = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    select: {
      wellbeingCheckStatus: true,
      disabilityAndAccessibility: {
        select: {
          disabilityAndAccessibility: true,
        },
      },
      criminalBackground: {
        select: {
          offenseOrPenalty: true,
          disqualificationOrSanction: true,
        },
      },
    },
  });

  if (!app) {
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }
  // Allow if: explicitly APPROVED OR no wellbeing issues found
  const disability = (
    app.disabilityAndAccessibility as { disabilityAndAccessibility?: string[] } | undefined
  )?.disabilityAndAccessibility?.[0]?.toLowerCase();

  const criminal = app.criminalBackground;

  // Allow if: APPROVED OR no issues
  const isClear =
    !disability ||
    disability === "no_known_disability" ||
    (criminal?.offenseOrPenalty === "NO" && criminal?.disqualificationOrSanction === "NO");

  if (app.wellbeingCheckStatus !== "APPROVED" && !isClear) {
    throw new AppError("Wellbeing requirements are not satisfied", "BAD_REQUEST", 400);
  } // if (app.wellbeingCheckStatus !== "APPROVED") {
  //   throw new AppError("Wellbeing check not approved", "BAD_REQUEST", 400);
  // }

  const application = await AdmissionService.submitApplication(applicationId);

  await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      stage: "SUBMIT",
    },
  });
  sendSuccessResponse(res, application);
};

const updateApplicationOutcome = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const { outcome } = zodSafeParse(
    req.body,
    z.object({ outcome: z.enum(["APPROVED_CONDITIONAL", "APPROVED_UNCONDITIONAL", "REJECTED"]) }),
  );

  const application = await AdmissionService.updateApplicationOutcome(applicationId, outcome);

  await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      stage: "OUTCOME",
      status: outcome === "APPROVED_CONDITIONAL" || outcome === "APPROVED_UNCONDITIONAL" ? "APPROVED" : "REJECTED",
    },
  });

  if (outcome === "APPROVED_CONDITIONAL" || outcome === "APPROVED_UNCONDITIONAL") {
    // Check if the applicant's session is active before creating enrollment
    const applicationWithSession = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
        courseSelection: {
          include: {
            course: {
              include: {
                session: true,
              },
            },
          },
        },
      },
    });

    // Validate that the application has a course selection
    if (!applicationWithSession?.courseSelection?.course?.session) {
      throw new AppError("Application is not associated with a session", "BAD_REQUEST", 400);
    }

    // Validate that the session is active
    if (applicationWithSession.courseSelection.course.session.status !== "ACTIVE") {
      throw new AppError("Only applicants from active sessions can be enrolled", "BAD_REQUEST", 400);
    }

    await prisma.studentEnrollments.create({
      data: {
        applicationId: applicationId,
      },
    });
  }
  if (outcome === "APPROVED_CONDITIONAL" || outcome === "APPROVED_UNCONDITIONAL") {
    // Send notification via the notification service
    const now = new Date();

    const isApproved = outcome === "APPROVED_CONDITIONAL" || outcome === "APPROVED_UNCONDITIONAL";

    const expireAt = isApproved ? new Date(now.getTime()) : null;

    const updatedApplication = await prisma.application.update({
      where: {
        id: applicationId,
      },
      data: {
        outcome,
        offerExpired: expireAt,
      },
    });
    sendApplicationDecisionRequestNotification({ applicationId, outcome });

    // Also send email for backward compatibility (until email system is fully deprecated)
    // await sendApplicationDecisionRequestEmail(applicationId, outcome);
  } else {
    // Send notification via the notification service
    sendApplicationOutcomeNotification({ applicationId, outcome });

    // Also send email for backward compatibility (until email system is fully deprecated)
    // await sendApplicationOutcomeEmail(applicationId, outcome);
  }
  sendSuccessResponse(res, { application });
};

const resendApplicationOutcomeEmail = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const { outcome } = zodSafeParse(
    req.body,
    z.object({ outcome: z.enum(["APPROVED_CONDITIONAL", "APPROVED_UNCONDITIONAL"]) }),
  );
  const existApplication = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
  });
  if (!existApplication) {
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }

  // Send notification via the notification service
  // sendApplicationOutcomeNotification({ applicationId, outcome });
  sendApplicationDecisionRequestEmail(applicationId, outcome);

  // Also send email for backward compatibility (until email system is fully deprecated)
  // await sendApplicationOutcomeEmail(applicationId, outcome);

  sendSuccessResponse(res, {}, "Application outcome email resent successfully");
};
export const AdmissionController = {
  getApplications,
  getApplicationById,
  updateApplication,
  getApplicationAssignments,
  assignApplicationToAdmissionOfficer,
  getAdmissionOfficers,
  getApplicationNotes,
  createApplicationNote,
  getGeneralFileChecks,
  updateGeneralFileChecks,
  getFileChecks,
  getApplicationBookings,
  submitApplication,
  updateApplicationOutcome,
  resendApplicationOutcomeEmail,
};
