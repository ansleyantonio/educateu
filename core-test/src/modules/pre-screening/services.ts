/*
 * Pre-screening Module Service Layer
 *
 * This module provides business logic for the pre-screening process in the admission workflow.
 * Pre-screening is a crucial step where applications are evaluated before proceeding to
 * full admission review, allowing early filtering based on basic criteria.
 *
 * Features:
 * - Pre-screening outcome recording with template support
 * - Audit trail maintenance for pre-screening decisions
 * - Integration with admission workflow stages
 *
 * Author: EducateU Development Team
 * Version: 1.0.0
 */

import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { PreScreeningGetApplicationsRequestBody } from "./types";

/*
 * Records the outcome of a pre-screening evaluation for an application.
 *
 * This function creates a historical record of the pre-screening decision,
 * including the outcome (PASS/FAIL), template used for evaluation, and
 * the evaluator's details for audit purposes.
 *
 * Parameters:
 * - applicationId: The unique identifier of the application being screened
 * - data: The screening outcome data including result and template
 * - userRoleId: The ID of the user performing the pre-screening
 * Returns: Promise<PreScreeningHistory> The created pre-screening history record
 */

const getApplications = async (reqBody: PreScreeningGetApplicationsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        generalFileCheckStatus: "APPROVED",
      },
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
        ...(reqBody.dateFrom && {
          createdAt: {
            gte: reqBody.dateFrom,
          },
        }),
        ...(reqBody.dateTo && {
          createdAt: {
            lte: reqBody.dateTo,
          },
        }),
        ...(reqBody.interviewOutcome && {
          interviewOutcome: {
            contains: reqBody.interviewOutcome,
            mode: "insensitive",
          },
        }),
        ...(reqBody.preScreeningOutcome && {
          preScreeningHistories: {
            some: {
              outcome: {
                contains: reqBody.preScreeningOutcome,
                mode: "insensitive",
              },
            },
          },
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
        interviewOutcome: true,
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            mobileNumber: true,
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
        preScreeningHistories: {
          select: {
            outcome: true,
            template: true,
            createdAt: true,
            updatedAt: true,
            createdBy: {
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
        interviews: {
          select: {
            interviewDate: true,
            startTime: true,
            endTime: true,
            platform: true,
          },
          orderBy: {
            interviewDate: "desc",
          },
        },
      },
    }),

    prisma.application.count({
      where,
    }),
  ]);

  const paginationData = {
    count: applications.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  const formattedApplications = applications.map((app) => {
    const preScreeningHistories = app.preScreeningHistories.map((preScreeningHistory) => {
      return {
        ...preScreeningHistory,
        createdBy:
          preScreeningHistory.createdBy.userPortalCategory.user.firstName +
          " " +
          preScreeningHistory.createdBy.userPortalCategory.user.lastName,
      };
    });

    return {
      ...app,
      preScreeningHistories,
    };
  });

  return { applications: formattedApplications, pagination: paginationData };
};

const setPreScreeningOutcome = async (
  applicationId: string,
  data: {
    outcome: string;
    template: string;
  },
  userRoleId: string,
) => {
  const preScreeningHistory = await prisma.preScreeningHistory.create({
    data: {
      applicationId: applicationId,
      outcome: data.outcome,
      template: data.template,
      createdById: userRoleId,
    },
  });

  return preScreeningHistory;
};

const getPreScreeningHistory = async (applicationId: string) => {
  const preScreeningHistory = await prisma.preScreeningHistory.findMany({
    where: {
      applicationId: applicationId,
    },
  });

  return preScreeningHistory;
};

/*
 * Pre-screening service object containing all pre-screening related operations.
 */
export const PreScreeningService = {
  getApplications,
  setPreScreeningOutcome,
  getPreScreeningHistory,
};
