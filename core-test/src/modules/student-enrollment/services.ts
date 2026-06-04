/*
 * Student enrollment service layer
 *
 * This service handles business logic for student enrollment operations including
 * retrieving paginated enrollment data, migration operations, and enrollment
 * management. It provides an abstraction layer between controllers and database
 * operations.
 *
 * Author: EducateU Development Team
 * Version: 1.0.0
 */

import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { EnrollmentsRequestBody, MigrateEnrollmentsRequestBody } from "./types";
import { AppError } from "../../utils/AppError";
import { CourseType, Prisma } from "@prisma/client";

/*
 * Retrieves paginated list of student enrollments with filtering
 *
 * This function fetches student enrollments based on course type filtering
 * and returns paginated results. It includes related application data,
 * course information, awarding body details, and personal information.
 *
 * The function specifically filters for ADVANCED_COURSE type courses
 * and applies additional filtering based on the requested course type.
 *
 * Parameters:
 * - {EnrollmentsRequestBody} reqBody - Query parameters including page and courseType
 * Returns: {Promise<{enrollments: any[], pagination: object}>} Paginated enrollment data
 *
 * Example:
 * const result = await getStudentEnrollments({
 *   page: 1,
 *   courseType: "NURSING"
 * });
 */
const getStudentEnrollments = async (reqBody: EnrollmentsRequestBody) => {
  // Calculate pagination offset and limit based on requested page
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  // Construct where clause for database query with complex filtering and relations
  const where: Prisma.StudentEnrollmentsWhereInput = {
    AND: [
      ...(reqBody.migrationStatus !== undefined ? [{ migrated: reqBody.migrationStatus }] : []),
      ...(reqBody.courseType || reqBody.courseId || reqBody.awardingBodyId || reqBody.sessionId || reqBody.moduleId
        ? [
            {
              application: {
                paymentRecords: {
                  some: {
                    paymentHistories: {
                      some: {
                        payment_status: true,
                      },
                    },
                  },
                },
                courseSelection: {
                  course: {
                    AND: [
                      ...(reqBody.courseType
                        ? [
                            {
                              course: {
                                courseType: reqBody.courseType,
                              },
                            },
                          ]
                        : []),
                      ...(reqBody.awardingBodyId
                        ? [
                            {
                              course: {
                                awardingBodyId: reqBody.awardingBodyId,
                              },
                            },
                          ]
                        : []),
                      ...(reqBody.courseId ? [{ id: reqBody.courseId }] : []),
                      ...(reqBody.sessionId ? [{ sessionId: reqBody.sessionId }] : []),
                    ],
                  },
                },
              },
            },
          ]
        : []),
    ],
  };

  // Execute database transaction to get enrollments and total count atomically
  const [enrollments, count] = await prisma.$transaction([
    // Fetch paginated enrollments with complex filtering and relations
    prisma.studentEnrollments.findMany({
      where,
      take: limit, // Limit number of results
      skip: offset, // Skip records for pagination
      orderBy: {
        createdAt: "desc", // Order by creation date, newest first
      },
      include: {
        application: {
          include: {
            personalInformation: true,
            paymentRecords: {
              select: {
                paymentHistories: {
                  where: { payment_status: true },
                },
              },
            },

            courseSelection: {
              include: {
                course: {
                  include: {
                    course: {
                      include: {
                        awardingBody: true,
                      },
                    },
                    session: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    // Get total count for pagination metadata
    prisma.studentEnrollments.count({
      where,
    }),
  ]);

  // Format enrollments for frontend
  const formattedEnrollments = enrollments.map((enrollment) => {
    return {
      id: enrollment.id,
      fullName: `${enrollment.application?.personalInformation?.firstName} ${enrollment.application?.personalInformation?.lastName}`,
      email: enrollment.application?.personalInformation?.email,
      mobileNumber: enrollment.application?.personalInformation?.mobileNumber,
      awardingBody: enrollment.application?.courseSelection?.course?.course?.awardingBody?.name ?? "",
      yearOfEntry: enrollment.application?.courseSelection?.yearOfCourse ?? "",
      course: enrollment.application?.courseSelection?.course?.course?.title ?? "",
      finance: "Finance",
      // financeStatus: enrollment.application?.paymentRecords?.[0]?.paymentHistories?.some((ph) => ph.payment_status)
      //   ? "PAID"
      //   : "PENDING",
      financeStatus: "PAID",
      courseType: enrollment.application?.courseSelection?.course?.course?.courseType as CourseType,
      academicSession: enrollment.application?.courseSelection?.course?.session?.name ?? "",
      offerOfAcceptance: "Offer of Acceptance",
      migrationStatus: enrollment.migrated,
    };
  });

  // Construct pagination metadata for client consumption
  const paginationData = {
    count: enrollments.length, // Number of items in current page
    total: count, // Total number of enrollments
    page: reqBody.page, // Current page number
    perPage: limit, // Items per page
    totalPages: Math.ceil(count / limit), // Total number of pages
  };

  return { enrollments: formattedEnrollments, pagination: paginationData };
};

// const getStudentEnrollments = async (reqBody: EnrollmentsRequestBody) => {
//   const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

//   /**
//    * Build dynamic Prisma WHERE clause
//    */
//   const where: Prisma.PaymentHistoryWhereInput = {
//     payment_status: true,
//     // status: PaymentHistoryStatus.PAID,

//     ...(reqBody.migrationStatus !== undefined && {
//       paymentRecord: {
//         application: {
//           StudentEnrollments: {
//             migrated: reqBody.migrationStatus,
//           },
//         },
//       },
//     }),

//     ...(reqBody.courseType || reqBody.courseId || reqBody.awardingBodyId || reqBody.sessionId
//       ? {
//           paymentRecord: {
//             application: {
//               courseSelection: {
//                 course: {
//                   AND: [
//                     ...(reqBody.courseType
//                       ? [
//                           {
//                             course: {
//                               courseType: reqBody.courseType,
//                             },
//                           },
//                         ]
//                       : []),

//                     ...(reqBody.awardingBodyId
//                       ? [
//                           {
//                             course: {
//                               awardingBodyId: reqBody.awardingBodyId,
//                             },
//                           },
//                         ]
//                       : []),

//                     ...(reqBody.courseId ? [{ id: reqBody.courseId }] : []),

//                     ...(reqBody.sessionId ? [{ sessionId: reqBody.sessionId }] : []),
//                   ],
//                 },
//               },
//             },
//           },
//         }
//       : {}),
//   };

//   /**
//    * Fetch enrollments
//    */
//   const enrollments = await prisma.paymentHistory.findMany({
//     where,
//     skip: offset,
//     take: limit,
//     orderBy: { createdAt: "desc" },
//     select: {
//       paymentRecord: {
//         select: {
//           application: {
//             select: {
//               id: true,
//               applicationId: true,
//               StudentEnrollments: {
//                 select: { migrated: true },
//               },
//               personalInformation: {
//                 select: {
//                   firstName: true,
//                   lastName: true,
//                   email: true,
//                   mobileNumber: true,
//                 },
//               },
//               courseSelection: {
//                 select: {
//                   yearOfCourse: true,
//                   session: { select: { name: true } },
//                   awardingBody: { select: { name: true } },
//                   course: {
//                     select: {
//                       course: {
//                         select: {
//                           title: true,
//                           courseType: true,
//                         },
//                       },
//                     },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//   });

//   /**
//    * Format response
//    */
//   const formattedEnrollments = enrollments
//     .map((item) => {
//       const app = item.paymentRecord?.application;
//       const pi = app?.personalInformation;
//       const cs = app?.courseSelection;

//       if (!app || !pi || !cs) return null;

//       return {
//         id: app.id,
//         applicationId: app.applicationId ?? "",
//         fullName: `${pi.firstName} ${pi.lastName}`,
//         email: pi.email,
//         mobileNumber: pi.mobileNumber,
//         awardingBody: cs.awardingBody?.name ?? "",
//         yearOfEntry: cs.yearOfCourse ?? "",
//         course: cs.course?.course?.title ?? "",
//         courseType: cs.course?.course?.courseType ?? "",
//         academicSession: cs.session?.name ?? "",
//         migrationStatus: app.StudentEnrollments?.migrated ?? false,
//         finance: "Finance",
//         financeStatus: "PAID",
//       };
//     })
//     .filter(Boolean);

//   /**
//    * Count (same filters!)
//    */
//   const total = await prisma.paymentHistory.count({ where });

//   /**
//    * Return result
//    */
//   return {
//     enrollments: formattedEnrollments,
//     pagination: {
//       count: formattedEnrollments.length,
//       total,
//       page: reqBody.page,
//       perPage: limit,
//       totalPages: Math.ceil(total / limit),
//     },
//   };
// };
/*
 * Migrates multiple student enrollment records
 *
 * Parameters:
 * - {string[]} studentEnrollmentIds - Array of enrollment IDs to migrate
 * Returns: {Promise<any[]>} Array of updated enrollment records
 */
const migrateEnrollments = async (reqBody: MigrateEnrollmentsRequestBody) => {
  // Find all enrollments that match the given IDs
  const enrollments = await prisma.studentEnrollments.findMany({
    where: { id: { in: reqBody.studentEnrollmentIds } },
    include: {
      application: {
        include: {
          courseSelection: true,
        },
      },
    },
  });

  if (!enrollments.length) {
    throw new AppError("No student enrollments found", "NOT FOUND", 404);
  }

  const courseId = enrollments[0].application?.courseSelection?.courseId;

  if (enrollments.length > 1 && courseId) {
    enrollments.forEach((enrollment) => {
      if (enrollment.application?.courseSelection?.courseId !== courseId) {
        throw new AppError("All enrollments must belong to the same course", "CONFLICT", 409);
      }
    });
  }

  //check if any of the enrollments are already migrated
  for (const enrollment of enrollments) {
    if (enrollment.migrated) {
      throw new AppError("Some of the submitted enrollments are already migrated", "CONFLICT", 409);
    }
  }

  // for (const enrollment of enrollments) {
  //   if (enrollment.migrated == true) {
  //     throw new AppError("Some of the submitted enrollments are already migrated", "CONFLICT", 409);
  //   }
  // }
  // const alreadyMigrated = enrollments.some((enrollment) => enrollment.migrated == true);
  // if (alreadyMigrated) {
  //   throw new AppError("Some of the submitted enrollments are already migrated", "CONFLICT", 409);
  // }

  // Bulk update migration status
  await prisma.studentEnrollments.updateMany({
    where: { id: { in: reqBody.studentEnrollmentIds } },
    data: { migrated: true },
  });

  // Register each student in RegisteredStudent table
  const registeredStudents = await Promise.all(
    enrollments.map(async (enrollment) => {
      if (!enrollment.applicationId) return null;
      try {
        return await prisma.registeredStudent.create({
          data: {
            applicationId: enrollment.applicationId,
            studentEnrollmentId: enrollment.id,
          },
        });
      } catch (err) {
        // Handle duplicate registration or other errors gracefully
        return null;
      }
    }),
  );

  // Optionally, return the updated enrollments
  const updatedEnrollments = await prisma.studentEnrollments.findMany({
    where: { id: { in: reqBody.studentEnrollmentIds } },
  });

  return { updatedEnrollments, registeredStudents };
};

/*
 * Student enrollment service object containing all enrollment-related business logic
 *
 * This service provides a clean interface for enrollment operations and can be
 * easily extended with additional enrollment management functions.
 *
 * Exports: StudentEnrollmentService
 */
export const StudentEnrollmentService = {
  getStudentEnrollments,
  migrateEnrollments,
};
