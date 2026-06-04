/*
 * Admission Module Service Layer
 *
 * This module provides comprehensive business logic for the admission system, handling
 * application management, officer assignments, note creation, file checking, and various
 * admission workflow operations. It serves as the core service layer between controllers
 * and the database, implementing complex business rules and data transformations.
 *
 * Features:
 * - Application retrieval with complex filtering based on module context
 * - Admission officer assignment and management
 * - Application note system with type-specific validation
 * - File check operations with status tracking
 * - Interview booking management
 * - Application outcome processing
 * - Comprehensive audit logging
 */

import { NoteType, Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import {
  AdmissionOfficerRequestQuery,
  ApplicationNote,
  AdmissionGetApplicationsRequestBody,
  admissionGetApplicationsReqBodySchema,
  UpdateGeneralFileChecks,
} from "./types";
import { AppError } from "../../utils/AppError";
import { create } from "node:domain";
import { AdmissionController } from "./controllers";
import app from "../../app";
import { RequestWithUser } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";

// Retrieves applications based on module context with complex filtering logic.
//
// This function implements sophisticated business rules for filtering applications
// based on the requesting module (admission, pre-screening, interview, additional-file-check).
// Each module has specific criteria for which applications should be visible.
const getApplications = async (reqBody: AdmissionGetApplicationsRequestBody, reqUserId: string) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        NOT: {
          status: "DRAFT",
        },
      },
      ...(reqBody.ownership && reqBody.ownership === "OWN"
        ? [
            {
              userPortalCategoryRoleApplications: {
                some: {
                  userPortalCategoryRoleId: reqUserId,
                  userPortalCategoryRole: {
                    role: {
                      name: "admission-officer",
                    },
                  },
                },
              },
            },
          ]
        : []),
      // {
      //   userPortalCategoryRoleApplications: {
      //     some: {
      //       userPortalCategoryRoleId: reqUserId,
      //     },
      //   },
      // },
      {
        ...(reqBody.searchTerm && {
          OR: [
            {
              id: {
                contains: reqBody.searchTerm,
                mode: "insensitive",
              },
            },
            {
              personalInformation: {
                firstName: {
                  contains: reqBody.searchTerm,
                  mode: "insensitive",
                },
              },
            },
            {
              personalInformation: {
                lastName: {
                  contains: reqBody.searchTerm,
                  mode: "insensitive",
                },
              },
            },
          ],
        }),
        ...(reqBody.agentId && {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRoleId: reqBody.agentId,
            },
          },
        }),
        ...(reqBody.subAgentId && {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRoleId: reqBody.subAgentId,
            },
          },
        }),
        ...(reqBody.admissionOfficerId && {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRoleId: reqBody.admissionOfficerId,
            },
          },
        }),
        ...(reqBody.awardingBodyId && {
          courseSelection: {
            awardingBodyId: reqBody.awardingBodyId,
          },
        }),
        ...(reqBody.courseId && {
          courseSelection: {
            courseId: reqBody.courseId,
          },
        }),
        ...(reqBody.sessionId && {
          courseSelection: {
            sessionId: reqBody.sessionId,
          },
        }),
        ...(reqBody.year && {
          courseSelection: {
            session: {
              year: reqBody.year,
            },
          },
        }),
        ...(reqBody.applicationStatus && {
          status: reqBody.applicationStatus,
        }),
        ...(reqBody.dateFrom && {
          courseSelection: {
            session: {
              startDate: {
                gte: reqBody.dateFrom,
              },
            },
          },
        }),
        ...(reqBody.dateTo && {
          courseSelection: {
            session: {
              endDate: {
                lte: reqBody.dateTo,
              },
            },
          },
        }),
        ...(reqBody.nationality && {
          personalInformation: {
            currentNationality: reqBody.nationality,
          },
        }),
        ...(reqBody.interviewOutcome && {
          interviewOutcome: {
            contains: reqBody.interviewOutcome,
            mode: "insensitive",
          },
        }),
        ...(reqBody.additionalFileCheckStatus && {
          additionalFileCheckStatus: reqBody.additionalFileCheckStatus,
        }),
      },
    ],
  };

  // Execute database query with comprehensive includes for related data
  const [applications, count] = await prisma.$transaction([
    prisma.application.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        status: true,
        stage: true,
        additionalFileCheckStatus: true,
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courseSelection: {
          select: {
            course: {
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
        userPortalCategoryRoleApplications: {
          select: {
            userPortalCategoryRole: {
              select: {
                userPortalCategory: {
                  select: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    }),

    prisma.application.count({
      where,
    }),
  ]);

  // Format applications to include agent and admission officer information
  const formattedApplications = applications.map((app) => {
    const application: Record<string, unknown> = {
      ...app,
    };

    // Extract agent information from role assignments
    const appAgent = app.userPortalCategoryRoleApplications.find(
      (upcra) => upcra.userPortalCategoryRole.role.name === "agent",
    );

    if (appAgent) {
      application.agentOrSource =
        appAgent.userPortalCategoryRole.userPortalCategory.user.firstName +
        " " +
        appAgent.userPortalCategoryRole.userPortalCategory.user.lastName;
    }

    // Extract admission officer information from role assignments
    const appAdmissionOfficer = app.userPortalCategoryRoleApplications.find(
      (upcra) => upcra.userPortalCategoryRole.role.name === "admission-officer",
    );

    if (appAdmissionOfficer) {
      application.admissionOfficer =
        appAdmissionOfficer.userPortalCategoryRole.userPortalCategory.user.firstName +
        " " +
        appAdmissionOfficer.userPortalCategoryRole.userPortalCategory.user.lastName;
    }

    // Remove raw role data to clean up response
    delete application.userPortalCategoryRoleApplications;

    return application;
  });

  const paginationData = {
    count: applications.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    applications: { applications: formattedApplications },
    pagination: paginationData,
  };
};

// Retrieves a single application by ID with all related information.
const getApplicationById = async (applicationId: string) => {
  const application = await prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      personalInformation: true,
      personalStatement: true,
      academicBackground: true,
      courseSelection: true,
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: true,
      criminalBackground: true,
      supportingDocument: true,
    },
  });

  return { application };
};

// Updates an application with the provided data.
async function updateApplication(data: Prisma.ApplicationUpdateInput, applicationId: string) {
  const application = await prisma.application.update({
    where: { id: applicationId },
    data: data,
    include: {
      personalInformation: true,
      personalStatement: true,
      academicBackground: true,
      courseSelection: true,
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: true,
      criminalBackground: true,
      supportingDocument: true,
    },
  });

  return { application };
}

// Retrieves the assignment history for a specific application.
//
// This function fetches all assignment logs for an application and enriches them
// with detailed information about who assigned and who was assigned to the application.
const getApplicationAssignments = async (applicationId: string) => {
  const applicationAssignments = await prisma.applicationAssignmentLog.findMany({
    where: {
      applicationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Enrich assignment logs with detailed user information
  const formattedApplicationAssignments = await Promise.all(
    applicationAssignments.map(async (applicationAssignment) => {
      return {
        ...applicationAssignment,
        assignedBy: await prisma.userPortalCategoryRole.findUnique({
          where: {
            id: applicationAssignment.assignedById,
          },
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
            role: true,
          },
        }),
        assignedTo: await prisma.userPortalCategoryRole.findUnique({
          where: {
            id: applicationAssignment.assignedToId,
          },
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
            role: true,
          },
        }),
      };
    }),
  );

  return { formattedApplicationAssignments };
};

// Assigns an application to a specific admission officer.
//
// This function handles the business logic for assigning applications to admission officers,
// including validation, updating existing assignments, and creating audit logs.
const assignApplicationToAdmissionOfficer = async (
  userId: string,
  applicationId: string,
  userPortalCategoryRoleId: string,
) => {
  // Validate that the provided role ID corresponds to an admission officer
  const userPortalCategoryRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      id: userPortalCategoryRoleId,
      role: {
        name: "admission-officer",
      },
    },
    include: {
      userPortalCategory: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!userPortalCategoryRole) {
    throw new AppError("Invalid User Portal Category Role", "BAD_REQUEST", 400);
  }

  // Check if application is already assigned to this admission officer
  const roleApplication = await prisma.userPortalCategoryRoleApplication.findFirst({
    where: {
      userPortalCategoryRoleId: userPortalCategoryRoleId,
      applicationId: applicationId,
    },
  });

  if (roleApplication) {
    throw new AppError("Already assigned to admission officer", "BAD_REQUEST", 400);
  }

  // Find the specific userPortalCategoryRole for "admission-officer" role
  const admissionOfficerRole = await prisma.userPortalCategoryRole.findFirst({
    where: {
      role: {
        name: {
          equals: "admission-officer",
        },
      },
    },
  });

  if (!admissionOfficerRole) {
    throw new AppError("Admission officer role not found", "BAD_REQUEST", 400);
  }

  // Update existing admission officer assignment for this application
  const userPortalCategoryRoleApplication = await prisma.userPortalCategoryRoleApplication.upsert({
    where: {
      userPortalCategoryRoleId_applicationId: {
        userPortalCategoryRoleId: admissionOfficerRole.id,
        applicationId: applicationId,
      },
    },
    update: {
      userPortalCategoryRoleId: userPortalCategoryRoleId,
    },
    create: {
      applicationId: applicationId,
      userPortalCategoryRoleId: userPortalCategoryRoleId,
    },
  });

  // Create audit log entry for the assignment
  const applicationAssignmentLog = await prisma.applicationAssignmentLog.create({
    data: {
      applicationId: applicationId,
      assignedById: userId,
      assignedToId: userPortalCategoryRoleId,
    },
  });

  return { application: { userPortalCategoryRoleApplication } };
};

// Retrieves admission officers with search and pagination capabilities.
//
// This function fetches admission officers based on search criteria,
// supporting search across first and last names with case-insensitive matching.
const getAdmissionOfficers = async (reqQuery: AdmissionOfficerRequestQuery) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // Build search criteria for admission officers
  const where: Prisma.UserPortalCategoryRoleWhereInput = {
    AND: [
      {
        role: {
          name: "admission-officer",
        },
      },
      {
        // Support multi-word search terms by splitting and matching each word
        OR: reqQuery.searchTerm?.split(" ").map((searchTerm) => ({
          userPortalCategory: {
            user: {
              OR: [
                {
                  firstName: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
                {
                  lastName: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              ],
            },
          },
        })),
      },
    ],
  };

  const [admissionOfficers, count] = await prisma.$transaction([
    prisma.userPortalCategoryRole.findMany({
      where,
      skip: offset,
      take: limit,
      select: {
        id: true,
        userPortalCategory: {
          select: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
            portalCategory: {
              select: {
                name: true,
              },
            },
          },
        },
        role: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.userPortalCategoryRole.count({
      where,
    }),
  ]);

  const paginationData = {
    count: admissionOfficers.length,
    total: count,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    admissionOfficers: { admissionOfficers },
    pagination: paginationData,
  };
};

// Retrieves application notes with filtering and pagination.
//
// This function fetches notes for a specific application with support for
// filtering by type and visibility. Private notes are restricted to their creators.
const getApplicationNotes = async (
  reqQuery: {
    applicationId: string;
    type: "ALL" | "GENERAL" | "UPDATE_REQUEST" | "FILE_UPDATE_REQUEST" | "CHECK" | "ADDITIONAL_CHECK";
    visibility: "PUBLIC" | "PRIVATE";
    page: number;
    pageSize: number;
  },
  reqUserId: string,
) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // Execute query with access control for private notes
  const [applicationNotes, applicationNotesCount] = await prisma.$transaction([
    prisma.applicationNote.findMany({
      where: {
        applicationId: reqQuery.applicationId,
        visibility: reqQuery.visibility,
        // Restrict private notes to their creators
        ...(reqQuery.visibility === "PRIVATE" && { createdById: reqUserId }),
        // Filter by note type if specified
        ...(reqQuery.type !== "ALL" && { type: reqQuery.type }),
      },
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        createdBy: {
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
            role: true,
          },
        },
        note: true,
      },
    }),

    prisma.applicationNote.count({
      where: {
        applicationId: reqQuery.applicationId,
        visibility: reqQuery.visibility,
        ...(reqQuery.visibility === "PRIVATE" && { createdById: reqUserId }),
        ...(reqQuery.type !== "ALL" && { type: reqQuery.type }),
      },
    }),
  ]);

  const paginationData = {
    count: applicationNotes.length,
    total: applicationNotesCount,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(applicationNotesCount / limit),
  };

  // Format notes with creator information and conditional fields
  const formattedApplicationNotes = applicationNotes.map((note) => {
    return {
      note: note.note.data,
      type: note.type,
      visibility: note.visibility,
      createdBy:
        note.createdBy.userPortalCategory.user.firstName + " " + note.createdBy.userPortalCategory.user.lastName,
      role: note.createdBy.role.name as NoteType,
      // Include optional fields only when present
      ...(note.fieldName && { fieldName: note.fieldName }),
      ...(note.attachmentName && { attachmentName: note.attachmentName }),
      ...(note.paths && { paths: note.paths }),
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  });

  return { applicationNotes: formattedApplicationNotes, pagination: paginationData };
};

// Creates a new application note with type-specific validation and processing.
//
// This function handles the creation of different types of notes, including
// file update requests that require attachment path resolution.
const createApplicationNote = async (
  userPortalCategoryRoleId: string,
  applicationId: string,
  reqBody: ApplicationNote,
) => {
  // Create the base note record
  const note = await prisma.note.create({
    data: {
      data: reqBody.note,
    },
  });

  let paths;

  // Special handling for file update request notes
  if (reqBody.type === "FILE_UPDATE_REQUEST") {
    const application = await prisma.application.findUnique({
      where: {
        id: applicationId,
      },
      include: {
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

    // Find the specific attachment referenced in the note
    const documentInApplication = application?.supportingDocument?.supportingDocumentAttachments.find((attachment) => {
      if (attachment.name === reqBody.attachmentName) {
        return true;
      } else {
        return false;
      }
    });

    if (!documentInApplication) {
      throw new AppError("No supporting document attachment found", "BAD_REQUEST", 400);
    }

    // Store the file paths for reference
    paths = documentInApplication.attachment.paths;
  }

  // Create the application note with all relevant metadata
  const applicationNote = await prisma.applicationNote.create({
    data: {
      applicationId: applicationId,
      noteId: note.id,
      type: reqBody.type,
      ...(reqBody.visibility && { visibility: reqBody.visibility }),
      createdById: userPortalCategoryRoleId,
      // Include conditional fields based on note type
      ...(reqBody.fieldName && { fieldName: reqBody.fieldName }),
      ...(reqBody.attachmentName && { attachmentName: reqBody.attachmentName }),
      ...(paths && { paths: paths }),
    },
    include: {
      note: true,
    },
  });

  return { applicationNote };
};

// Retrieves general file checks for an application with optional status filtering.
const getGeneralFileChecks = async (applicationId: string, fileCheckStatus: string) => {
  const generalFileChecks = await prisma.supportingDocument.findFirst({
    where: {
      applicationId: applicationId,
      // Apply status filter if provided
      ...(fileCheckStatus && {
        supportingDocumentAttachments: {
          some: {
            status: fileCheckStatus,
          },
        },
      }),
    },
    include: {
      supportingDocumentAttachments: {
        include: {
          attachment: true,
        },
      },
    },
  });

  return {
    generalFileChecks,
  };
};

// Updates general file check statuses with comprehensive audit logging.
//
// This function processes bulk file check updates, creating notes for items requiring
// information and maintaining detailed audit logs of all check activities.
const updateGeneralFileChecks = async (
  applicationId: string,
  reqBody: UpdateGeneralFileChecks,
  userPortalCategoryRoleId: string,
  checkType: "check" | "additional-check",
) => {
  // Verify that supporting documents exist for this application
  const supportingDocument = await prisma.supportingDocument.findFirst({
    where: {
      applicationId: applicationId,
    },
  });

  if (!supportingDocument) {
    throw new AppError("No supporting document found", "BAD_REQUEST", 400);
  }

  // Process each file check update
  for (const fileCheck of reqBody) {
    // Find the specific attachment to update
    const supportingDocumentAttachment = await prisma.supportingDocumentAttachment.findFirst({
      where: {
        supportingDocumentId: supportingDocument.id,
        name: fileCheck.attachmentName,
      },
      include: {
        attachment: true,
      },
    });

    if (!supportingDocumentAttachment) {
      throw new AppError("No supporting document attachment found", "BAD_REQUEST", 400);
    }

    // Update the attachment status
    await prisma.supportingDocumentAttachment.update({
      where: {
        id: supportingDocumentAttachment.id,
      },
      data: {
        status: fileCheck.status,
      },
    });

    // Create application notes for items requiring information
    if (
      (fileCheck.status === "INFORMATION_REQUIRED" || fileCheck.status === "INFORMATION_REQUIRED_ADDITIONAL") &&
      fileCheck.note
    ) {
      AdmissionService.createApplicationNote(userPortalCategoryRoleId, applicationId, {
        note: fileCheck.note,
        type: checkType === "check" ? "CHECK" : "ADDITIONAL_CHECK",
        attachmentName: fileCheck.attachmentName,
      });
    }

    // Create comprehensive audit log entry
    await prisma.fileCheckLog.create({
      data: {
        applicationId: applicationId,
        name: fileCheck.attachmentName,
        type: checkType === "check" ? "CHECK" : "ADDITIONAL_CHECK",
        status: fileCheck.status,
        // Get the checker's full name for audit purposes
        createdBy: Object.values(
          (
            await prisma.userPortalCategoryRole.findUnique({
              where: {
                id: userPortalCategoryRoleId,
              },
              include: {
                userPortalCategory: {
                  include: {
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                      },
                    },
                  },
                },
              },
            })
          )?.userPortalCategory.user as { firstName: string; lastName: string },
        ).join(" "),
        paths: supportingDocumentAttachment.attachment.paths as string,
      },
    });
  }

  return;
};

// Retrieves file check logs for a specific application and check type.
const getFileChecks = async (applicationId: string, type: "CHECK" | "ADDITIONAL_CHECK") => {
  const fileChecks = await prisma.fileCheckLog.findMany({
    where: {
      applicationId: applicationId,
      type: type,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return { fileChecks };
};

// Retrieves interview bookings for a specific application.
const getApplicationBookings = async (applicationId: string) => {
  const applicationBookings = await prisma.interview.findMany({
    where: {
      applicationId: applicationId,
    },
    include: {
      application: {
        include: {
          personalInformation: true,
          preScreeningHistories: true,
        },
      },
      interviewer: {
        include: {
          userPortalCategory: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  });
  return { applicationBookings };
};

// Submits an application by updating its stage to SUBMIT.
const submitApplication = async (applicationId: string) => {
  const application = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      stage: "SUBMIT",
    },
  });

  return { application };
};

// Updates the final outcome of an application.
const updateApplicationOutcome = async (
  applicationId: string,
  outcome: "APPROVED_CONDITIONAL" | "APPROVED_UNCONDITIONAL" | "REJECTED",
) => {
  const application = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      outcome,
    },
  });

  return { application };
};

export const AdmissionService = {
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
};
