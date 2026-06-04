import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  createSessionReqBodySchema,
  getSessionCoursesReqBodySchema,
  RoleDataType,
  updateSessionReqBodySchema,
} from "./types";
import { SessionService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { getPagination } from "../../utils/paginationUtils";
import z from "zod";
import createAuditLog from "../../utils/auditlog";
import { AppError } from "../../utils/AppError";
import prisma from "../../prismaClient";
import { Prisma } from "@prisma/client";

// Create session
const createSession = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, createSessionReqBodySchema);

  try {
    const session = await SessionService.createSession(reqBody);

    // If the session is created with ACTIVE status, ensure only one session is active
    if (reqBody.status === "ACTIVE") {
      await SessionService.ensureSingleActiveSession(session.id);
    }

    // If courseIds are provided, assign courses to the session
    let courseAssignmentResult = null;
    if (reqBody.courseIds && reqBody.courseIds.length > 0) {
      courseAssignmentResult = await SessionService.assignCoursesToSession(req, session.id, reqBody.courseIds);
    }

    if (req.user) {
      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Created session: ${session.name || ""}`,
        actionType: "course_management",
      });
    }

    sendSuccessResponse(res, {
      session,
      ...(courseAssignmentResult && { courseAssignment: courseAssignmentResult }),
    });
  } catch (error) {
    // Check if the error is due to the unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target;
      if (
        Array.isArray(target) &&
        target.includes("name") &&
        target.includes("intakePeriod") &&
        target.includes("year")
      ) {
        throw new AppError(
          `A session with the name "${reqBody.name}", intake period "${reqBody.intakePeriod}", and year ${reqBody.year} already exists.`,
          "CONFLICT",
          409,
        );
      }
    }
    throw error;
  }
};

// Get sessions
const getSessions = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getSessionCoursesReqBodySchema);

  const { sessions, pagination } = await SessionService.getSessions(reqQuery);

  sendSuccessResponse(res, { sessions }, undefined, undefined, pagination);
};

// Update session
const updateSession = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));

  const reqBody = zodSafeParse(req.body, updateSessionReqBodySchema);

  const sessionCourses = await prisma.session.findFirst({
    where: {
      id: sessionId,
    },
    select: {
      status: true,
      stage: true,
      SessionCourse: {
        select: {
          courseId: true,
          course: {
            select: {
              title: true,
            },
          },
          courseFees: {
            select: {
              id: true,
            },
          },
        },
      },
    },
  });

  if (!sessionCourses) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  try {
    // If courseIds are provided, assign courses to the session
    let courseAssignmentResult = null;
    if (reqBody.courseIds && reqBody.courseIds.length > 0) {
      // existing course ids from session
      const existingCourseIds = sessionCourses?.SessionCourse.map((sessionCourse) => sessionCourse.courseId);
      // check if incoming course ids are different
      const isDifferent =
        JSON.stringify([...existingCourseIds].sort()) !== JSON.stringify([...reqBody.courseIds].sort());

      if (sessionCourses.stage === "COMPLETED" && isDifferent) {
        throw new AppError("Cannot assign courses to a completed session", "INVALID_SESSION_STAGE", 400);
      }
      courseAssignmentResult = await SessionService.assignCoursesToSession(req, sessionId, reqBody.courseIds);
      delete reqBody.courseIds;
    }

    // If the stage is being updated to COMPLETED
    if (reqBody.stage === "COMPLETED") {
      const missingFeeCourses = sessionCourses.SessionCourse.filter((sc) => sc.courseFees.length === 0);

      if (missingFeeCourses.length > 0) {
        const courseTitles = missingFeeCourses.map((sc) => sc.course.title);

        throw new AppError(`Course fees are not set for: ${courseTitles.join(", ")}`, "BAD_REQUEST", 400);
      }
    }

    // If the status is being updated to ACTIVE, ensure only one session is active
    if (reqBody.status === "ACTIVE") {
      if (sessionCourses.stage !== "COMPLETED") {
        throw new AppError("Session stage must be COMPLETED before setting status to ACTIVE", "BAD_REQUEST", 400);
      }

      // First update the session
      const session = await SessionService.updateSession(sessionId, reqBody);

      // Then ensure only one session is active
      await SessionService.ensureSingleActiveSession(sessionId);

      // Get the updated session data
      const updatedSession = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      const existingSession = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      if (!existingSession) {
        throw new AppError("Session not found", "NOT_FOUND", 404);
      }
      if (req.user) {
        let actionMessage = `Updated session: ${session.name || ""}`;
        console.log("reqBody.status", reqBody.status);

        if (reqBody.status) {
          actionMessage += ` — Session status changed from ${existingSession.status} to ${reqBody.status}`;
        }

        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: actionMessage,
          actionType: "course_management",
        });
      }
      // if (req.user) {
      //   await createAuditLog({
      //     userId: req.user?.userPortalCategory?.userId || "",
      //     action: `Updated session: ${session.name || ""}`,
      //     actionType: "course_management",
      //     // courseId: courseId,

      //   });
      // }

      sendSuccessResponse(res, {
        session: updatedSession,
        ...(courseAssignmentResult && { courseAssignment: courseAssignmentResult }),
      });
    } else {
      // For non-ACTIVE status updates, proceed normally
      const session = await SessionService.updateSession(sessionId, reqBody);
      const existingSession = await prisma.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      if (!existingSession) {
        throw new AppError("Session not found", "NOT_FOUND", 404);
      }
      if (req.user) {
        let actionMessage = `Updated session: ${session.name || ""}`;
        console.log("reqBody.status", reqBody.status);

        if (reqBody.status) {
          actionMessage += ` — Session status changed from ${existingSession.status} to ${reqBody.status}`;
        }

        await createAuditLog({
          userId: req.user?.userPortalCategory?.userId || "",
          action: actionMessage,
          actionType: "course_management",
        });
      }
      // if (req.user) {
      //   await createAuditLog({
      //     userId: req.user?.userPortalCategory?.userId || "",
      //     action: `Updated session: ${session.name || ""}`,
      //     actionType: "course_management",
      //     // courseId: courseId,

      //   });
      // }

      sendSuccessResponse(res, {
        session,
        ...(courseAssignmentResult && { courseAssignment: courseAssignmentResult }),
      });
    }
  } catch (error) {
    // Check if the error is due to the unique constraint violation
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target;
      if (
        Array.isArray(target) &&
        target.includes("name") &&
        target.includes("intakePeriod") &&
        target.includes("year")
      ) {
        const sessionDetails = [];
        if (reqBody.name) sessionDetails.push(`name "${reqBody.name}"`);
        if (reqBody.intakePeriod) sessionDetails.push(`intake period "${reqBody.intakePeriod}"`);
        if (reqBody.year) sessionDetails.push(`year ${reqBody.year}`);
        throw new AppError(`A session with the ${sessionDetails.join(", ")} already exists.`, "CONFLICT", 409);
      }
    }
    throw error;
  }
};

// Assign course to session
const assignCourseToSession = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));
  const { courseIds } = zodSafeParse(req.body, z.object({ courseIds: z.array(z.string().uuid()).min(1) }));

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }
  if (session.stage === "COMPLETED") {
    throw new AppError("Courses cannot be assigned once the session stage is COMPLETED.", "BAD_REQUEST", 400);
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
      const courseSnapshot = await SessionService.createCourseSnapshot(courseId);

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

  const result = {
    assignedCourses,
    errors,
    summary: {
      total: courseIds.length,
      assigned: assignedCourses.length,
      failed: errors.length,
    },
  };

  sendSuccessResponse(res, result);
};

// Unassign course from session
const unassignCourseFromSession = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  // Check if session course exists
  const sessionCourse = await prisma.sessionCourse.findUnique({
    where: {
      sessionId_courseId: {
        sessionId,
        courseId,
      },
    },
  });

  if (!sessionCourse) {
    throw new AppError("Course not assigned to session", "NOT_FOUND", 404);
  }

  // Get the course details for audit log
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: {
      title: true,
    },
  });

  // Delete the session course record
  await prisma.sessionCourse.delete({
    where: {
      sessionId_courseId: {
        sessionId,
        courseId,
      },
    },
  });

  // Re-index remaining session courses
  const remainingSessionCourses = await prisma.sessionCourse.findMany({
    where: {
      sessionId: sessionId,
    },
    orderBy: {
      index: "asc",
    },
  });

  // Update indices to be sequential
  for (let i = 0; i < remainingSessionCourses.length; i++) {
    await prisma.sessionCourse.update({
      where: {
        id: remainingSessionCourses[i].id,
      },
      data: {
        index: i + 1,
      },
    });
  }

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Unassigned course: ${course?.title || ""} from session: ${session.name || ""}`,
      actionType: "course_management",
      courseId: courseId,
    });
  }

  sendSuccessResponse(res, { message: "Course successfully unassigned from session" });
};

// Get session courses
const getSessionCourses = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));
  const reqQuery = zodSafeParse(
    req.query,
    z.object({
      awardingBodyId: z.string().uuid().optional(),
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).default(10),
      hasFees: z
        .string()
        .optional()
        .transform((val) => {
          if (val === undefined) return undefined;
          if (val === "true") return true;
          if (val === "false") return false;
          throw new AppError("Invalid value for hasFees", "BAD_REQUEST", 400);
        }),
      courseType: z.enum(["DEGREE_COURSE", "DIPLOMA_COURSE"]).optional(),
    }),
  );

  const { offset, limit } = getPagination(reqQuery.page, reqQuery.pageSize);

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  const where: Prisma.SessionCourseWhereInput = {
    sessionId,
    ...(reqQuery.courseType
      ? {
          course: {
            courseType: reqQuery.courseType,
          },
        }
      : {
          course: {
            courseType: {
              in: ["DEGREE_COURSE", "DIPLOMA_COURSE"],
            },
          },
        }),
    ...(reqQuery.awardingBodyId && {
      courseSnapshot: {
        path: ["awardingBodyId"],
        equals: reqQuery.awardingBodyId,
      },
    }),
    ...(reqQuery.hasFees !== undefined && {
      courseFees: reqQuery.hasFees ? { some: {} } : { none: {} },
    }),
  };

  const [sessionCourses, count] = await prisma.$transaction([
    prisma.sessionCourse.findMany({
      where,
      include: {
        course: true,
      },
      orderBy: {
        index: "asc",
      },
      skip: offset,
      take: limit,
    }),
    prisma.sessionCourse.count({ where }),
  ]);

  const pagination = {
    count: sessionCourses.length,
    total: count,
    page: reqQuery.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  sendSuccessResponse(res, { sessionCourses }, undefined, undefined, pagination);
};

// Update session course index
const updateSessionCourseIndex = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));
  const { courseId, newIndex } = zodSafeParse(
    req.body,
    z.object({
      courseId: z.string().uuid(),
      newIndex: z.number().int().min(1),
    }),
  );

  // Check if session exists
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  // Check if session course exists
  const sessionCourse = await prisma.sessionCourse.findUnique({
    where: {
      sessionId_courseId: {
        sessionId,
        courseId,
      },
    },
  });

  if (!sessionCourse) {
    throw new AppError("Course not assigned to session", "NOT_FOUND", 404);
  }

  // Update the index of the session course
  const updatedSessionCourse = await prisma.sessionCourse.update({
    where: {
      sessionId_courseId: {
        sessionId,
        courseId,
      },
    },
    data: {
      index: newIndex,
    },
  });

  // Re-index all session courses to ensure sequential ordering
  const sessionCourses = await prisma.sessionCourse.findMany({
    where: {
      sessionId: sessionId,
    },
    orderBy: {
      index: "asc",
    },
  });

  // Update indices to be sequential
  for (let i = 0; i < sessionCourses.length; i++) {
    await prisma.sessionCourse.update({
      where: {
        id: sessionCourses[i].id,
      },
      data: {
        index: i + 1,
      },
    });
  }

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated course index: ${courseId} in session: ${sessionId} to index: ${newIndex}`,
      actionType: "course_management",
      courseId: courseId,
    });
  }

  sendSuccessResponse(res, { updatedSessionCourse });
};

// Get matching awarding bodies by session
const getMatchingAwardingBodiesBySession = async (req: RequestWithUser, res: Response) => {
  const { sessionId } = zodSafeParse(req.params, z.object({ sessionId: z.string().uuid() }));

  const userId = req.user?.userPortalCategory?.userId;
  const roleName = req?.user?.role.name;

  // Get the user's agent awarding bodies
  const agentAwardingBodies = await prisma.userPortalCategory.findMany({
    where: { userId },
    select: {
      userPortalCategoryRoles: {
        select: {
          roleData: true,
        },
      },
    },
  });

  // Get the agent awarding body IDs from the user's agent awarding bodies
  const agentAwardingBodyIds = new Set(
    agentAwardingBodies.flatMap((c) =>
      c.userPortalCategoryRoles.flatMap((r) =>
        ((r.roleData as RoleDataType)?.awardingBodyTemplates ?? []).map((t) => t.awardingBodyId),
      ),
    ),
  );

  // Get the session
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      intakePeriod: true,
    },
  });

  if (!session) {
    throw new AppError("Session not found", "NOT_FOUND", 404);
  }

  // Get session courses and their awarding bodies
  const sessionCourses = await prisma.sessionCourse.findMany({
    where: {
      sessionId: sessionId,
    },
    include: {
      course: {
        select: {
          awardingBodyId: true,
        },
      },
    },
  });

  // Get unique awarding body IDs from session courses
  const awardingBodyIds = [
    ...new Set(sessionCourses.map((sc) => sc.course.awardingBodyId).filter(Boolean) as string[]),
  ];

  // Filter out awarding body IDs that are not agent awarding bodies
  const awardingBodiesSet = awardingBodyIds.filter((id) => agentAwardingBodyIds.has(id));

  // Get awarding bodies that have the session's intake period in their intakePeriod array (stored in othersInfo)
  const matchingAwardingBodies = await prisma.awardingBody.findMany({
    where: {
      id: {
        in: roleName === "admin" ? awardingBodyIds : awardingBodiesSet,
      },
      intakePeriods: {
        array_contains: [session.intakePeriod],
      },
      // Query the othersInfo JSON field to check if intakePeriod array contains the session's intake period
      // othersInfo: {
      //   path: ["intakePeriod"],
      //   array_contains: [session.intakePeriod],
      // },
    },
  });

  sendSuccessResponse(res, { awardingBodies: matchingAwardingBodies });
};

export const SessionController = {
  createSession,
  getSessions,
  updateSession,
  assignCourseToSession,
  unassignCourseFromSession,
  getSessionCourses,
  updateSessionCourseIndex,
  getMatchingAwardingBodiesBySession,
};
