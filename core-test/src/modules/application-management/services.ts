// import { ApplicationStatus, Prisma } from "@prisma/client";
import { agentGetApplicationsReqQuerySchema } from "./types";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { ApplicationStatus, Prisma } from "@prisma/client";
import { UserPortalCategoryRole } from "../../types";
import { zodSafeParse } from "../../utils/zodUtils";
import prismaClient from "../../prismaClient";
import { generateApplicationId } from "../../utils/applicationIdGenerator";

interface GetAgentAuditLogsParams {
  agentId: string;
  page: number;
  limit: number;
}

async function getAllApplications(reqUser: UserPortalCategoryRole, reqQuery: Record<string, unknown>) {
  const query = zodSafeParse(reqQuery, agentGetApplicationsReqQuerySchema);
  const { offset, limit } = getPagination(query.page, query.pageSize);

  const searchConditions: Prisma.ApplicationWhereInput[] = [];
  const filterConditions: Prisma.ApplicationWhereInput[] = [];

  // Search functionality
  if (query.search) {
    const searchTerm = query.search.trim();
    if (searchTerm) {
      searchConditions.push({
        OR: [
          {
            personalInformation: {
              OR: [
                { firstName: { contains: searchTerm, mode: "insensitive" } },
                { lastName: { contains: searchTerm, mode: "insensitive" } },
                { email: { contains: searchTerm, mode: "insensitive" } },
                { currentNationality: { contains: searchTerm, mode: "insensitive" } },
                { countryOfResidence: { contains: searchTerm, mode: "insensitive" } },
                { mobileNumber: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
          {
            courseSelection: {
              OR: [
                { faculty: { contains: searchTerm, mode: "insensitive" } },
                { intake: { contains: searchTerm, mode: "insensitive" } },
                { yearOfCourse: { contains: searchTerm, mode: "insensitive" } },
                {
                  session: {
                    name: { contains: searchTerm, mode: "insensitive" },
                  },
                },
                {
                  awardingBody: {
                    name: { contains: searchTerm, mode: "insensitive" },
                  },
                },
              ],
            },
          },
          {
            academicBackground: {
              OR: [
                { highestLevelOfQualification: { contains: searchTerm, mode: "insensitive" } },
                { areaOfQualification: { contains: searchTerm, mode: "insensitive" } },
                { institutionName: { contains: searchTerm, mode: "insensitive" } },
                { countryOfIssue: { contains: searchTerm, mode: "insensitive" } },
              ],
            },
          },
          { applicationId: { contains: searchTerm, mode: "insensitive" } },
          { id: { contains: searchTerm, mode: "insensitive" } },
        ],
      });
    }
  }

  // Filter conditions
  // Application Status filter
  if (query.applicationStatus) {
    filterConditions.push({ status: query.applicationStatus as ApplicationStatus });
  }

  // Application Stage filter
  if (query.applicationStage) {
    filterConditions.push({ stage: query.applicationStage });
  }
  // Add this with your other filter conditions
  // Add the awarding body filter first

  // Sub-Agent filter
  if (query.subAgent) {
    filterConditions.push({
      userPortalCategoryRoleApplications: {
        some: {
          userPortalCategoryRoleId: query.subAgent,
        },
      },
    });
  }

  // Intake Period filter
  if (query.intakePeriod) {
    filterConditions.push({
      courseSelection: {
        intake: query.intakePeriod,
      },
    });
  }

  // Awarding Body filter
  if (query.awardingBody) {
    filterConditions.push({
      courseSelection: {
        is: {
          awardingBodyId: query.awardingBody,
        },
      },
    });
  }

  // Email Status filter
  if (query.emailStatus) {
    if (query.emailStatus === "VERIFIED") {
      filterConditions.push({
        personalInformation: {
          verifiedEmail: true,
        },
      });
    } else if (query.emailStatus === "UNVERIFIED") {
      filterConditions.push({
        personalInformation: {
          verifiedEmail: false,
        },
      });
    }
  }

  // Interview Status filter - Based on existence of interviews
  if (query.interviewStatus) {
    if (query.interviewStatus === "SCHEDULED") {
      filterConditions.push({
        interviews: {
          some: {
            interviewDate: { gt: new Date() },
          },
        },
      });
    } else if (query.interviewStatus === "COMPLETED") {
      filterConditions.push({
        interviews: {
          some: {
            interviewDate: { lt: new Date() },
          },
        },
      });
    } else if (query.interviewStatus === "NO_INTERVIEW") {
      filterConditions.push({
        interviews: {
          none: {},
        },
      });
    }
  }

  // Interview Outcome filter - This should map to application's interviewOutcome field
  if (query.interviewOutcome) {
    filterConditions.push({
      interviewOutcome: query.interviewOutcome,
    });
  }

  // Offer Response filter
  if (query.offerResponse) {
    filterConditions.push({
      outcome: query.offerResponse,
    });
  }

  // Build the final where clause with ALL conditions
  const where: Prisma.ApplicationFindManyArgs["where"] = {
    AND: [
      // Base condition: user has access to these applications
      {
        userPortalCategoryRoleApplications: {
          some: {
            userPortalCategoryRoleId: reqUser.id,
          },
        },
      },

      // Add search conditions (if any)
      ...(searchConditions.length > 0 ? [{ OR: searchConditions }] : []),

      // Add all filter conditions
      ...filterConditions,

      // Legacy filters (backward compatibility)
      ...(query["application-status"] ? [{ status: query["application-status"] }] : []),
      ...(query["application-stage"] ? [{ stage: query["application-stage"] }] : []),
      ...(query["intake-period"] ? [{ courseSelection: { intake: query["intake-period"] } }] : []),
      ...(query["sub-agent"]
        ? [
            {
              userPortalCategoryRoleApplications: {
                some: { userPortalCategoryRoleId: query["sub-agent"] },
              },
            },
          ]
        : []),
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
      include: {
        personalInformation: true,
        personalStatement: true,
        academicBackground: true,
        courseSelection: {
          include: {
            session: true,
            awardingBody: true,
            course: true,
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
        interviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    }),
    prisma.application.count({ where }),
  ]);

  const result = await prismaClient.$queryRaw`
    SELECT
      SUM(field_count) AS total_field_count
    FROM (
      SELECT
        COUNT(*) AS field_count
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN (
          'Application',
          'PersonalInformation',
          'AcademicBackground',
          'CourseSelection',
          'PersonalStatement',
          'DisabilityAndAccessibility',
          'NextOfKin',
          'Fund',
          'Reference',
          'CriminalBackground',
          'SupportingDocument'
        )
      GROUP BY table_name
    ) AS subquery;
  `;

  function countNonNullFields(obj: Record<string, unknown>): number {
    let nonNullCount = 0;

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === "object" && value !== null && !Array.isArray(value)) {
        for (const [k, v] of Object.entries(value)) {
          if (v !== null && v !== undefined) {
            nonNullCount++;
          }
        }
      } else if (value !== null && value !== undefined) {
        nonNullCount++;
      }
    }

    return nonNullCount;
  }

  let totalFieldCount = 0;

  if (result instanceof Array) {
    if ("total_field_count" in result[0]) {
      totalFieldCount = result[0].total_field_count;
    }
  }

  const appWithProgress = applications.map((app) => {
    const nonNullFields = countNonNullFields(app);
    return {
      ...app,
      progress: Math.round((nonNullFields / totalFieldCount) * 100).toFixed(2),
    };
  });

  const paginationData = {
    count: applications.length,
    total: count,
    page: query.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    applications: appWithProgress,
    pagination: paginationData,
  };
}

// async function getAllApplications(reqUser: UserPortalCategoryRole, reqQuery: Record<string, unknown>) {
//   // if (reqUser.role.name === "agent") {
//   const query = zodSafeParse(reqQuery, agentGetApplicationsReqQuerySchema);
//   // }

//   const { offset, limit } = getPagination(query.page);

//   const where: Prisma.ApplicationFindManyArgs["where"] = {
//     AND: [
//       {
//         userPortalCategoryRoleApplications: {
//           some: {
//             userPortalCategoryRoleId: reqUser.id,
//           },
//         },
//       },
//       ...(reqUser.role.name === "agent" && query["application-status"]
//         ? [{ status: query["application-status"] as ApplicationStatus }]
//         : []),
//       ...(reqUser.role.name === "agent" && query["application-stage"] ? [{ stage: query["application-stage"] }] : []),
//       ...(reqUser.role.name === "agent" && query["intake-period"]
//         ? [{ courseSelection: { intake: query["intake-period"] } }]
//         : []),
//       ...(reqUser.role.name === "agent" && query["sub-agent"]
//         ? [{ userPortalCategoryRoleApplications: { some: { userPortalCategoryRoleId: query["sub-agent"] } } }]
//         : []),
//     ],
//   };

//   const [applications, count] = await prisma.$transaction([
//     prisma.application.findMany({
//       where,
//       skip: offset,
//       take: limit,
//       orderBy: {
//         createdAt: "desc",
//       },
//       include: {
//         personalInformation: true,
//         personalStatement: true,
//         academicBackground: true,
//         courseSelection: true,
//         disabilityAndAccessibility: true,
//         nextOfKin: true,
//         fund: true,
//         reference: true,
//         criminalBackground: true,
//         supportingDocument: {
//           include: {
//             supportingDocumentAttachments: {
//               include: {
//                 attachment: true,
//               },
//             },
//           },
//         },
//       },
//     }),

//     prisma.application.count({
//       where,
//     }),
//   ]);

//   const result = await prismaClient.$queryRaw`
//     SELECT
//       SUM(field_count) AS total_field_count
//     FROM (
//       SELECT
//         COUNT(*) AS field_count
//       FROM information_schema.columns
//       WHERE table_schema = 'public'
//         AND table_name IN (
//           'Application',
//           'PersonalInformation',
//           'AcademicBackground',
//           'CourseSelection',
//           'PersonalStatement',
//           'DisabilityAndAccessibility',
//           'NextOfKin',
//           'Fund',
//           'Reference',
//           'CriminalBackground',
//           'SupportingDocument'
//         )
//       GROUP BY table_name
//     ) AS subquery;
//   `;

//   type NestedObject = {
//     [key: string]: string | number | boolean | null | NestedObject | undefined;
//   };

//   function countNonNullFields(obj: Record<string, unknown>): number {
//     let nonNullCount = 0;

//     for (const [key, value] of Object.entries(obj)) {
//       if (typeof value === "object" && value !== null && !Array.isArray(value)) {
//         for (const [k, v] of Object.entries(value)) {
//           if (v !== null && v !== undefined) {
//             nonNullCount++;
//           }
//         }
//       } else if (value !== null && value !== undefined) {
//         nonNullCount++;
//       }
//     }

//     // Iterate through each field in the object
//     // for (const key in obj) {
//     //   // eslint-disable-next-line no-prototype-builtins
//     //   if (obj.hasOwnProperty(key)) {
//     //     const value = obj[key];
//     //
//     //     for (const v in value as NestedObject) {
//     //       if (value !== null && value !== undefined) {
//     //         // If the value is not null or undefined, count it as a non-null field
//     //         nonNullCount++;
//     //       }
//     //     }
//     //
//     //     // If the value is an object, recursively count its non-null fields
//     //     //   if (value && typeof value === "object")
//     //     // {
//     //     //     nonNullCount += countNonNullFields(value as NestedObject); // Recursive call for nested objects
//     //     //   }
//     //   } else if (value !== null && value !== undefined) {
//     //     // If the value is not null or undefined, count it as a non-null field
//     //     nonNullCount++;
//     //   }
//     // }

//     return nonNullCount;
//   }

//   let totalFieldCount = 0;

//   if (result instanceof Array) {
//     if ("total_field_count" in result[0]) {
//       totalFieldCount = result[0].total_field_count;
//     }
//   }

//   const appWithProgress = applications.map((app) => {
//     const nonNullFields = countNonNullFields(app);
//     return {
//       ...app,
//       progress: Math.round((nonNullFields / totalFieldCount) * 100).toFixed(2),
//     };
//   });

//   const paginationData = {
//     count: applications.length,
//     total: count,
//     page: query.page,
//     perPage: limit,
//     totalPages: Math.ceil(count / limit),
//   };

//   return {
//     applications: appWithProgress,
//     pagination: paginationData,
//   };
// }

async function createApplication(data: Prisma.ApplicationCreateInput, reqUser: UserPortalCategoryRole) {
  const application = await prisma.application.create({
    data: {
      ...data,
      userPortalCategoryRoleApplications: {
        create: {
          userPortalCategoryRole: {
            connect: {
              id: reqUser.id,
            },
          },
        },
      },
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

  return application;
}

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

  return { application };
}

async function getApplicationById(applicationId: string) {
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
      supportingDocument: {
        include: {
          supportingDocumentAttachments: {
            include: {
              attachment: true,
            },
          },
        },
      },
      userPortalCategoryRoleApplications: {
        include: {
          userPortalCategoryRole: {
            include: {
              role: true,
              userPortalCategory: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  });

  return { application };
}

async function getStudentByEmail(email: string) {
  const application = await prisma.application.findFirst({
    where: {
      personalInformation: {
        email: email,
      },
    },
    include: {
      personalInformation: true,
      personalStatement: true,
      academicBackground: true,
      courseSelection: {
        include: {
          session: true,
          awardingBody: true,
          course: true,
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
      interviews: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  if (!application) {
    return null;
  }

  return application.personalInformation;
}

// async function getApplicationById(applicationId: string) {
//   const application = await prisma.application.findUnique({
//     where: { id: applicationId },
//     include: {
//       personalInformation: true,
//       academicBackground: true,
//       courseSelection: true,
//       disabilityAndAccessibility: true,
//       nextOfKin: true,
//       fund: true,
//       reference: true,
//       criminalBackground: true,
//       supportingDocument: true,
//     },
//   });
//
//   return application;
// }

// async function assignApplicationToAdmissionOfficer(applicationId: string, admissionOfficerId: string) {
//   const userRoleApplication = await prisma.userRoleApplication.create({
//     data: {
//       userRoleId: admissionOfficerId,
//       applicationId: applicationId,
//     },
//   });
//
//   return { userRoleApplication };
// }
export const getAgentAuditLogsService = async ({ agentId, page, limit }: GetAgentAuditLogsParams) => {
  const skip = (page - 1) * limit;

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        userId: agentId,
        actionType: "application_management",
      },
      select: {
        id: true,
        action: true,
        actionType: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            agentUser: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.auditLog.count({
      where: {
        userId: agentId,
        actionType: "application_management",
      },
    }),
  ]);

  const processedAuditLogs = auditLogs.map((log) => {
    const { user } = log;

    return {
      ...log,
      user: {
        username: user?.agentUser || "",
      },
    };
  });

  return {
    auditLogs: processedAuditLogs,
    pagination: {
      page,
      perPage: limit,
      total,
      totalPages: Math.ceil(total / limit),
      count: processedAuditLogs.length,
    },
  };
};

export const ApplicationService = {
  getAllApplications,
  createApplication,
  updateApplication,
  getApplicationById,
  getStudentByEmail,
  // assignApplicationToAdmissionOfficer,
};
