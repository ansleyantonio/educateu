import { NoteType, Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { sendRegisterEmail, sendWellbeingEmail } from "../student-management/mail/config";
import { sendWellbeingNotification } from "../../utils/notificationService";
import { WellbeingGetApplicationsRequestBody } from "./types";

const getApplications = async (reqBody: WellbeingGetApplicationsRequestBody) => {
  const { offset, limit } = getPagination(reqBody.page, reqBody.pageSize);
  console.log("offset", reqBody);

  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        NOT: {
          status: "DRAFT",
        },
      },
      {
        OR: [
          {
            AND: [
              {
                NOT: {
                  disabilityAndAccessibility: null,
                },
              },
              {
                NOT: {
                  disabilityAndAccessibility: {
                    disabilityAndAccessibility: {
                      array_contains: "NO_KNOWN_DISABILITY",
                    },
                  },
                },
              },
            ],
          },
          {
            criminalBackground: {
              OR: [
                {
                  offenseOrPenalty: "YES",
                },
                {
                  disqualificationOrSanction: "YES",
                },
                // {
                //   policeClearance: "NO",
                // },
              ],
            },
          },
        ],
      },

      // Filters for wellbeing applications
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
        ...(reqBody.applicationStatus && {
          // wellbeingCheckStatus: reqBody.applicationStatus,
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
        ...(reqBody.admissionOfficer && {
          userPortalCategoryRoleApplications: {
            some: {
              userPortalCategoryRole: {
                id: reqBody.admissionOfficer,
                role: {
                  name: "admission-officer",
                },
              },
            },
          },
        }),

        ...(reqBody.year && {
          courseSelection: {
            session: {
              year: reqBody.year,
            },
          },
        }),

        ...(reqBody.nationality && {
          personalInformation: {
            currentNationality: reqBody.nationality,
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
        status: true,
        id: true,
        wellbeingCheckStatus: true,
        personalInformation: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        courseSelection: {
          select: {
            session: {
              select: {
                intakePeriod: true,
              },
            },
            course: {
              select: {
                course: {
                  select: {
                    awardingBody: {
                      select: {
                        name: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        disabilityAndAccessibility: {
          select: {
            disabilityAndAccessibility: true,
            disabilityAndAccessibilityOther: true,
          },
        },
        criminalBackground: {
          select: {
            offenseOrPenalty: true,
            disqualificationOrSanction: true,
            policeClearance: true,
          },
        },
        // applicationNotes: {
        //   include: {
        //     note: true,
        //     createdBy: {
        //       include: {
        //         role: true,
        //         userPortalCategory: {
        //           include: {
        //             user: true,
        //           },
        //         },
        //       },
        //     },
        //   },
        // },
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

  return {
    applications: { applications },
    pagination: paginationData,
  };
};

const getWellbeingDocuments = async (applicationId: string) => {
  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      {
        id: applicationId,
      },
      {
        OR: [
          {
            supportingDocument: {
              supportingDocumentAttachments: {
                some: {
                  name: {
                    in: ["policeClearance"],
                  },
                },
              },
            },
          },
        ],
      },
      {
        NOT: {
          AND: [
            {
              disabilityAndAccessibility: null,
            },
            {
              criminalBackground: null,
            },
          ],
        },
      },
    ],
  };

  const wellbeingDocuments = await prisma.application.findMany({
    where,
    include: {
      supportingDocument: {
        include: {
          supportingDocumentAttachments: {
            where: {
              name: {
                in: ["policeClearance"],
              },
            },
            include: {
              attachment: true,
            },
          },
        },
      },
    },
  });
  return { wellbeingDocuments };
};

const updateWellbeingCheckStatus = async (
  applicationId: string,
  status: Prisma.ApplicationUpdateInput["wellbeingCheckStatus"],
) => {
  const application = await prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      wellbeingCheckStatus: status,
    },
    include: {
      personalInformation: true,
      userPortalCategoryRoleApplications: {
        select: {
          userPortalCategoryRole: {
            select: {
              userPortalCategory: {
                select: {
                  user: true,
                },
              },
            },
          },
        },
      },
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

  // Also send email for backward compatibility (until email system is fully deprecated)
  sendWellbeingNotification({
    emails: [
      application?.personalInformation?.email ?? "",
      application.userPortalCategoryRoleApplications?.[0]?.userPortalCategoryRole.userPortalCategory.user.agentEmail ??
        "",
    ],
    applicantName:
      `${application?.personalInformation?.firstName ?? ""} ${application?.personalInformation?.lastName ?? ""}`.trim(),
    status: application?.wellbeingCheckStatus ?? "",
  });

  // Return the updated application
  return { application };
};

export const WellbeingService = {
  getApplications,
  getWellbeingDocuments,
  updateWellbeingCheckStatus,
};
