import { Prisma, SessionStatus, Stage } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { CreateSessionRequestBody, UpdateSessionRequestBody } from "./types";
import { JsonValue } from "@prisma/client/runtime/react-native.js";
import createAuditLog from "../../utils/auditlog";
import { AppError } from "../../utils/AppError";
import { RequestWithUser } from "../../types";

const createSession = async (reqBody: CreateSessionRequestBody) => {
  // Extract courseIds from reqBody and exclude it from the session creation data
  const { courseIds, ...sessionData } = reqBody;

  const session = await prisma.session.create({
    data: sessionData,
  });

  return session;
};

const getSessions = async (reqQuery: {
  page: number;
  search?: string;
  pageSize: number;
  stage: Stage;
  status?: string | string[];
  intakePeriod?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);
  const { stage, search, status, intakePeriod, startDate, endDate } = reqQuery;
  // Normalize status parameter to always be an array
  const statuses = reqQuery.status ? (Array.isArray(reqQuery.status) ? reqQuery.status : [reqQuery.status]) : undefined;

  // Convert string statuses to SessionStatus enum values
  const sessionStatuses = statuses?.filter((status) =>
    Object.values(SessionStatus).includes(status as SessionStatus),
  ) as SessionStatus[] | undefined;

  const where: Prisma.SessionWhereInput = {
    AND: [
      ...[{ stage: stage }],
      ...(reqQuery.search
        ? [
            {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  id: {
                    contains: search,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          ]
        : []),
      ...(sessionStatuses && sessionStatuses.length > 0 ? [{ status: { in: sessionStatuses } }] : []),
      ...(intakePeriod ? [{ intakePeriod: intakePeriod }] : []),
      ...(startDate ? [{ startDate: { gte: startDate } }] : []),
      ...(endDate ? [{ endDate: { lte: endDate } }] : []),
    ],
  };

  const [sessions, count] = await prisma.$transaction([
    prisma.session.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.session.count({
      where,
    }),
  ]);

  // const modifiedSessions = sessions.map((session) => {
  //   for (const course of session.courses) {
  //     if (!course.courseAndModule?.modules || !course.courseAndModule?.modulesId) continue;
  //     course.courseAndModule.modules = course.courseAndModule!.modules as string;
  //     course.courseAndModule.modulesId = course.courseAndModule!.modulesId as string;
  //   }
  //   //
  //   return session;
  // });

  const paginationData = {
    count: sessions.length,
    total: count,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    sessions,
    pagination: paginationData,
  };
};

const updateSession = async (sessionId: string, reqBody: UpdateSessionRequestBody) => {
  const session = await prisma.session.update({
    where: {
      id: sessionId,
    },
    data: reqBody,
  });

  return session;
};

/*
 * Ensures only one session is active at a time
 * If a session is being set to ACTIVE, any existing active session is closed
 * TEMPORARILY_ACTIVE sessions are not affected by this rule
 */
const ensureSingleActiveSession = async (sessionId: string) => {
  // Close all other ACTIVE sessions (not TEMPORARILY_ACTIVE)
  const otherActiveSessions = await prisma.session.findMany({
    where: {
      status: "ACTIVE", // Only affects ACTIVE sessions
      NOT: { id: sessionId },
    },
    select: { id: true, name: true },
  });

  // Update all other ACTIVE sessions to CLOSED
  for (const activeSession of otherActiveSessions) {
    await prisma.session.update({
      where: { id: activeSession.id },
      data: { status: "CLOSED" },
    });

    // Create audit log for the status change
    await createAuditLog({
      userId: "system", // System-generated log
      action: `Session "${activeSession.name}" status automatically updated from ACTIVE to CLOSED due to new active session`,
      actionType: "course_management",
    });
  }
};

const createCourseSnapshot = async (courseId: string) => {
  // Get the course with all its related data
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      awardingBody: true,
      courseModules: {
        include: {
          cModule: {
            include: {
              awardingBody: true,
              courseFaculty: true,
              faculty: true,
              moduleLessons: {
                include: {
                  lesson: {
                    include: {
                      lessonContents: {
                        include: {
                          content: true,
                        },
                      },
                    },
                  },
                },
              },
              moduleAssessments: {
                include: {
                  assessment: {
                    include: {
                      quizQuestions: true,
                      assignmentQuestions: {
                        include: {
                          rubricCriteria: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          index: "asc",
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  // Create a snapshot object with all the course data
  const snapshot = {
    ...course,
    modules: course.courseModules.map((courseModule) => {
      const module = { ...courseModule.cModule };
      // Ensure contentsOrder is preserved in the snapshot
      if (module.contentsOrder) {
        // contentsOrder is already present, no need to reassign
      }
      return {
        ...module,
        index: courseModule.index,
        semesterNumber: courseModule.semesterNumber,
      };
    }),
  };

  // Remove the courseModules field as we've flattened it into modules
  // We need to cast to unknown and then to the appropriate type to avoid TypeScript issues
  const snapshotWithoutCourseModules = snapshot as unknown as Omit<typeof snapshot, "courseModules"> & {
    modules: (typeof snapshot.courseModules)[number]["cModule"][];
  };

  return snapshotWithoutCourseModules;
};

const assignCoursesToSession = async (req: RequestWithUser, sessionId: string, courseIds: string[]) => {
  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  const assignedCourses = [];
  const errors = [];

  // Process each course ID
  for (const courseId of courseIds) {
    try {
      // Check if course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        errors.push({ courseId, error: "Course not found" });
        continue;
      }

      // Validate course is published
      if (course.status !== "PUBLISHED") {
        errors.push({ courseId, error: `Cannot assign unpublished course. Course status is: ${course.status}` });
        continue;
      }

      // Validate course content structure
      // Check if course has modules
      const courseModules = await prisma.courseModule.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          cModule: {
            include: {
              moduleLessons: {
                include: {
                  lesson: {
                    include: {
                      lessonContents: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (courseModules.length === 0) {
        errors.push({ courseId, error: "Cannot assign course without modules" });
        continue;
      }

      // Check if all modules have lessons
      let hasValidationError = false;
      for (const courseModule of courseModules) {
        if (courseModule.cModule.moduleLessons.length === 0) {
          errors.push({ courseId, error: `Module "${courseModule.cModule.title}" has no lessons` });
          hasValidationError = true;
          break;
        }

        // Check if all lessons have contents
        for (const moduleLesson of courseModule.cModule.moduleLessons) {
          if (moduleLesson.lesson.lessonContents.length === 0) {
            errors.push({ courseId, error: `Lesson "${moduleLesson.lesson.title}" has no contents` });
            hasValidationError = true;
            break;
          }
        }

        if (hasValidationError) break;
      }

      if (hasValidationError) continue;

      // Check if course is already assigned to session
      const existingSessionCourse = await prisma.sessionCourse.findUnique({
        where: {
          sessionId_courseId: {
            sessionId,
            courseId,
          },
        },
      });

      if (existingSessionCourse) {
        errors.push({ courseId, error: "Course already assigned to session" });
        continue;
      }

      // Get the highest index for this session's courses to assign the new course to the end
      const sessionCourses = await prisma.sessionCourse.findMany({
        where: {
          sessionId: sessionId,
        },
        orderBy: {
          index: "asc",
        },
      });

      const newIndex = sessionCourses.length > 0 ? Math.max(...sessionCourses.map((sc) => sc.index || 0)) + 1 : 1;

      // Create course snapshot
      const courseSnapshot = await createCourseSnapshot(courseId);

      // Assign course to session with snapshot and auto-index
      const sessionCourse = await prisma.sessionCourse.create({
        data: {
          sessionId,
          courseId,
          courseSnapshot,
          index: newIndex,
        },
      });

      assignedCourses.push(sessionCourse);

      if (req.user) {
        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: `Assigned course: ${course.title || ""} to session: ${session.name || ""} with index: ${newIndex}`,
          actionType: "course_management",
          courseId: courseId,
        });
      }
    } catch (error) {
      errors.push({ courseId, error: error instanceof Error ? error.message : "Unknown error" });
    }
  }

  return {
    assignedCourses,
    errors,
    summary: {
      total: courseIds.length,
      assigned: assignedCourses.length,
      failed: errors.length,
    },
  };
};

export const SessionService = {
  createSession,
  getSessions,
  updateSession,
  ensureSingleActiveSession,
  createCourseSnapshot,
  assignCoursesToSession,
};
