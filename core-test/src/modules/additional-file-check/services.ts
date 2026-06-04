import { Prisma } from "@prisma/client";
import { getPagination } from "../../utils/paginationUtils";
import { AdditionalFileCheckGetApplicationsRequestBody } from "./types";
import prisma from "../../prismaClient";

const getApplications = async (reqBody: AdditionalFileCheckGetApplicationsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        NOT: {
          status: "DRAFT",
        },
      },
      {
        interviewOutcome: {
          contains: "PASS",
          mode: "insensitive",
        },
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
          createdAt: {
            gte: reqBody.dateFrom,
          },
        }),
        ...(reqBody.dateTo && {
          createdAt: {
            lte: reqBody.dateTo,
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
      },
    ],
  };

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

  return { applications: { applications: formattedApplications }, pagination: paginationData };
};

export const AdditionalFileCheckService = {
  getApplications,
};
