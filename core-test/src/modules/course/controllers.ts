import { Response } from "express";
import z from "zod";
import prisma from "../../prismaClient";
import { RequestWithUser } from "../../types";
import { AppError } from "../../utils/AppError";
import createAuditLog from "../../utils/auditlog";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { getFieldChanges } from "../../utils/showValues";
import { zodSafeParse } from "../../utils/zodUtils";
import { AssessmentService } from "../assessment/services";
import { CourseService } from "./services";
import {
  AdvancedCourseCreateSchema,
  AdvancedCourseUpdateSchema,
  assignCourseModuleSchema,
  CreateCpdCourseSchema,
  getCoursesReqBodySchema,
  ProfessionalCourseCreateSchema,
  ProfessionalCourseUpdateSchema,
  UpdateCpdCourseSchema,
  updateModuleIndexSchema,
  updateModuleSemesterSchema,
} from "./types";
import { getCourseTotalCreditsAndModulesTotalCredits, validateModuleAssessments } from "./utils";

const getCourses = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, getCoursesReqBodySchema);

  const { courses, pagination } = await CourseService.getCourses(reqBody);

  sendSuccessResponse(res, { courses }, undefined, undefined, pagination);
};

const getCourseById = async (req: RequestWithUser, res: Response) => {
  const { courseId } = req.params;

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseModules: {
        include: {
          cModule: true,
        },
      },
      awardingBody: true,
      sessionCourses: {
        include: {
          session: true,
        },
      },
    },
  });

  sendSuccessResponse(res, { course });
};

const createCourse = async (req: RequestWithUser, res: Response) => {
  const courseType = zodSafeParse(
    req.body.courseType,
    z.enum(["PROFESSIONAL_COURSE", "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE"]),
  );

  let course = {};

  if (courseType === "DEGREE_COURSE" || courseType === "DIPLOMA_COURSE") {
    const reqBody = zodSafeParse(req.body, AdvancedCourseCreateSchema);

    const awardingBodyId = reqBody.awardingBodyId;
    delete (reqBody as Partial<typeof reqBody>).awardingBodyId;
    delete (reqBody as Partial<typeof reqBody>).sessionId;

    course = await prisma.course.create({
      data: {
        ...reqBody,
        awardingBody: {
          connect: {
            id: awardingBodyId,
          },
        },
      },
    });
  } else if (courseType === "PROFESSIONAL_COURSE") {
    const reqBody = zodSafeParse(req.body, ProfessionalCourseCreateSchema);

    const notUniqueCourse = await prisma.course.findFirst({
      where: {
        title: reqBody.title,
        courseType: reqBody.courseType,
      },
    });
    if (notUniqueCourse) {
      throw new AppError("Course with same title already exists", "BAD_REQUEST", 400);
    }

    course = await prisma.course.create({
      data: reqBody,
    });
  } else if (courseType === "CPD_COURSE") {
    const reqBody = zodSafeParse(req.body, CreateCpdCourseSchema);

    const notUniqueCourse = await prisma.course.findFirst({
      where: {
        title: reqBody.title,
        courseType: reqBody.courseType,
      },
    });
    if (notUniqueCourse) {
      throw new AppError("Course with same title already exists", "BAD_REQUEST", 400);
    }

    course = await prisma.course.create({
      data: reqBody,
    });
  }

  if ("title" in course) {
    if (req.user) {
      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Created course: ${course.title || ""}`,
        actionType: "course_management",
        previousValue: JSON.stringify(course),
        ...("id" in course ? { courseId: course.id as string } : {}),
      });
    }
  }

  sendSuccessResponse(res, { course });
};

const updateCourse = async (req: RequestWithUser, res: Response) => {
  const { id: courseId } = zodSafeParse(req.body, z.object({ id: z.string().uuid() }));

  const existingCourse = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      awardingBody: true,
      courseFees: true, // ADD THIS
      courseModules: {
        include: {
          cModule: {
            include: {
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
            },
          },
        },
      },
      sessionCourses: {
        include: {
          session: true,
        },
      },
    },
  });

  if (!existingCourse) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  console.log("existingCourse", existingCourse.courseFees);

  const courseType = zodSafeParse(
    req.body.courseType,
    z.enum(["PROFESSIONAL_COURSE", "DEGREE_COURSE", "DIPLOMA_COURSE", "CPD_COURSE"]),
  );

  // if ("status" in req.body && req.body.status === "PUBLISHED") {
  //   if (existingCourse?.courseModules) {
  //     // Check if course has any modules
  //     if (existingCourse.courseModules.length == 0) {
  //       throw new AppError("Cannot update course status to PUBLISHED when course has no modules", "BAD_REQUEST", 400);
  //     }
  //
  //     for (const courseModule of existingCourse.courseModules) {
  //       const moduleLessons = courseModule.cModule.moduleLessons;
  //       // Check if all modules have lessons
  //       if (moduleLessons.length === 0) {
  //         throw new AppError(
  //           "Cannot update course status to PUBLISHED when course has modules with no lessons",
  //           "BAD_REQUEST",
  //           400,
  //         );
  //       }
  //       if (moduleLessons.length > 0) {
  //         // Check if all lessons have contents
  //         for (const moduleLesson of moduleLessons) {
  //           if (moduleLesson.lesson.lessonContents.length === 0) {
  //             throw new AppError(
  //               "Cannot update course status to PUBLISHED when course has modules with no lessons",
  //               "BAD_REQUEST",
  //               400,
  //             );
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  let course = {};

  if (courseType === "DEGREE_COURSE" || courseType === "DIPLOMA_COURSE") {
    const reqBody = zodSafeParse(req.body, AdvancedCourseUpdateSchema);

    // Check if awardingBodyId is being updated and if there are existing modules
    if (req.body.awardingBodyId && req.body.awardingBodyId !== existingCourse?.awardingBodyId) {
      // If course has modules, prevent awarding body change
      if (existingCourse?.courseModules && existingCourse.courseModules.length > 0) {
        throw new AppError("Cannot update awarding body when course has assigned modules", "BAD_REQUEST", 400);
      }
    }

    // Get existing course total credits and modules total credits
    const { courseTotalCredits, modulesTotalCredits } = await getCourseTotalCreditsAndModulesTotalCredits(courseId, 0);

    if (reqBody.totalCredits && reqBody.totalCredits < modulesTotalCredits) {
      throw new AppError(
        `Total credits ${reqBody.totalCredits} is less than modules total credits ${modulesTotalCredits}`,
        "BAD_REQUEST",
        400,
      );
    }

    // Check if course total credits and modules total credits are equal
    if ("status" in reqBody && reqBody.status === "PUBLISHED") {
      //TODO: courseFees should not be empty (flow issue)
      // if (existingCourse.courseFees.length <= 0) {
      //   throw new AppError("Cannot Publish course with no fees", "BAD_REQUEST", 400);
      // }
      if (existingCourse.courseModules.length <= 0) {
        throw new AppError("Cannot Publish course with no modules", "BAD_REQUEST", 400);
      }
      if (courseTotalCredits && courseTotalCredits !== modulesTotalCredits) {
        throw new AppError(
          `Course total credits ${courseTotalCredits} is not equal to modules total credits ${modulesTotalCredits}`,
          "BAD_REQUEST",
          400,
        );
      }

      // Validate assessment weights in modules
      await AssessmentService.validateModuleAssessmentWeights(courseId);
    }

    course = await prisma.course.update({
      where: {
        id: req.body.id,
      },
      data: reqBody,
      include: {
        awardingBody: { select: { name: true } },
        sessionCourses: {
          include: {
            session: { select: { name: true } },
          },
        },
      },
    });
  } else if (courseType === "PROFESSIONAL_COURSE") {
    const reqBody = zodSafeParse(req.body, ProfessionalCourseUpdateSchema);

    const courseTotalMinutes = existingCourse.durationLength;

    const modulesTotalMinutes = existingCourse.courseModules.reduce((acc, curr) => {
      return acc + curr.cModule.estimatedTimeToComplete;
    }, 0);

    // Check if total credits is being updated and if total minutes is less than the new value
    if (reqBody.durationLength) {
      if (reqBody.durationLength < modulesTotalMinutes) {
        throw new AppError(
          `Total minutes ${courseTotalMinutes} exceeds modules total minutes ${modulesTotalMinutes}`,
          "BAD_REQUEST",
          400,
        );
      }
    }

    if (reqBody.status && reqBody.status === "PUBLISHED") {
      if (existingCourse.courseModules.length <= 0) {
        throw new AppError("Cannot Publish course with no modules", "BAD_REQUEST", 400);
      }
      if (courseTotalMinutes !== modulesTotalMinutes) {
        throw new AppError(
          `Total minutes ${courseTotalMinutes} does not equal modules total minutes ${modulesTotalMinutes}`,
          "BAD_REQUEST",
          400,
        );
      }

      // Validate assessment weights in modules
      await AssessmentService.validateModuleAssessmentWeights(courseId);
    }

    course = await prisma.course.update({
      where: {
        id: req.body.id,
      },
      data: reqBody,
    });
  } else if (courseType === "CPD_COURSE") {
    const reqBody = zodSafeParse(req.body, UpdateCpdCourseSchema);

    const courseTotalMinutes = existingCourse.durationLength;

    const modulesTotalMinutes = existingCourse.courseModules.reduce((acc, curr) => {
      return acc + curr.cModule.estimatedTimeToComplete;
    }, 0);

    // Check if total credits is being updated and if total minutes is less than the new value
    if (reqBody.durationLength) {
      if (reqBody.durationLength < modulesTotalMinutes) {
        throw new AppError(
          `Total minutes ${courseTotalMinutes} exceeds modules total minutes ${modulesTotalMinutes}`,
          "BAD_REQUEST",
          400,
        );
      }
    }

    if (reqBody.status && reqBody.status === "PUBLISHED") {
      if (existingCourse.courseModules.length <= 0) {
        throw new AppError("Cannot Publish course with no modules", "BAD_REQUEST", 400);
      }
      if (courseTotalMinutes !== modulesTotalMinutes) {
        throw new AppError(
          `Total minutes ${courseTotalMinutes} does not equal modules total minutes ${modulesTotalMinutes}`,
          "BAD_REQUEST",
          400,
        );
      }

      // Validate assessment weights in modules
      await AssessmentService.validateModuleAssessmentWeights(courseId);
    }

    course = await prisma.course.update({
      where: {
        id: req.body.id,
      },
      data: reqBody,
    });
  }

  if ("title" in course) {
    if (req.user) {
      // Compare old and new values to detect changes
      const changes = getFieldChanges(existingCourse as Record<string, unknown>, course);

      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Updated course: ${course!.title || ""}${changes}`,
        actionType: "course_management",
        previousValue: JSON.stringify(existingCourse),
        newValue: JSON.stringify(course),
        courseId: req.body.id,
      });
    }
  }

  sendSuccessResponse(res, { course });
};

const assignCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignCourseModuleSchema);

  const course = await prisma.course.findUnique({
    where: {
      id: reqBody.courseId,
    },
    include: {
      courseModules: {
        include: {
          cModule: true,
        },
      },
    },
  });

  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  const moduleToAssign = await prisma.cModule.findUnique({
    where: {
      id: reqBody.moduleId,
    },
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
  });

  if (!moduleToAssign) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  // Check if course module has any lessons with content
  const hasLessonsWithContent = moduleToAssign.moduleLessons.some(
    (moduleLesson) => moduleLesson.lesson.lessonContents && moduleLesson.lesson.lessonContents.length > 0,
  );

  if (!hasLessonsWithContent) {
    throw new AppError("Cannot assign course module without lessons or lessons without content", "BAD_REQUEST", 400);
  }

  // Validate module assessments
  await validateModuleAssessments(reqBody.moduleId);

  if (course.courseType === "DEGREE_COURSE" || course.courseType === "DIPLOMA_COURSE") {
    const { courseTotalCredits, modulesTotalCredits } = await getCourseTotalCreditsAndModulesTotalCredits(
      reqBody.courseId,
      moduleToAssign.credit as number,
    );

    if (courseTotalCredits && courseTotalCredits < modulesTotalCredits) {
      throw new AppError(
        `Modules total credits ${modulesTotalCredits} exceeds course total credits ${courseTotalCredits}`,
        "BAD_REQUEST",
        400,
      );
    }
  }

  if (course.courseType === "PROFESSIONAL_COURSE" || course.courseType === "CPD_COURSE") {
    if (course.durationLength) {
      const courseTotalMinutes = course.durationLength;

      const moduleTotalMinutes = course.courseModules.reduce((acc, curr) => {
        return acc + curr.cModule.estimatedTimeToComplete;
      }, moduleToAssign.estimatedTimeToComplete);

      if (courseTotalMinutes < moduleTotalMinutes) {
        throw new AppError(
          `Course total minutes ${courseTotalMinutes} exceeds module total minutes ${moduleTotalMinutes}`,
          "BAD_REQUEST",
          400,
        );
      }
    }
  }

  const { courseModule } = await CourseService.assignCourseModule(reqBody);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Assigned module: ${moduleToAssign.title || ""} to course: ${course.title || ""}`,
      actionType: "course_management",
      moduleId: moduleToAssign.id || "",
      courseId: course.id || "",
      previousValue: JSON.stringify(courseModule),
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const unassignCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignCourseModuleSchema);

  const { courseModule } = await CourseService.unassignCourseModule(reqBody);

  if (req.user) {
    const course = await prisma.course.findUnique({
      where: {
        id: reqBody.courseId,
      },
      select: {
        title: true,
        id: true,
      },
    });

    const module = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
        id: true,
      },
    });
    if (!module || !course) {
      throw new AppError("Course or module not found", "NOT_FOUND", 404);
    }

    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Unassigned module: ${module.title || ""} from course: ${course.title || ""}`,
      actionType: "course_management",
      moduleId: module.id || "",
      courseId: course.id || "",
      previousValue: JSON.stringify(courseModule),
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const getAssignedModules = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));

  const { assignedModules } = await CourseService.getAssignedModules(courseId);

  // Get course with modules
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseModules: {
        include: {
          cModule: true,
        },
      },
      awardingBody: true,
      sessionCourses: {
        include: {
          session: true,
        },
      },
    },
  });

  // Check if course exists
  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  // Calculate assigned total credits/minutes
  let assignedTotal = 0;

  if (course.courseModules && course.courseModules.length > 0) {
    const parsedCourse = zodSafeParse(
      course.courseModules,
      z.array(
        z.object({
          cModule: z
            .object({
              credit: z.coerce.number(),
              estimatedTimeToComplete: z.coerce.number().min(1),
            })
            .partial(),
        }),
      ),
    );

    if (course.courseType === "DEGREE_COURSE" || course.courseType === "DIPLOMA_COURSE") {
      assignedTotal = parsedCourse.reduce((acc: number, curr: { cModule: { credit: number } }) => {
        return acc + curr.cModule.credit;
      }, 0);
    }

    if (course.courseType === "CPD_COURSE" || course.courseType === "PROFESSIONAL_COURSE") {
      assignedTotal = parsedCourse.reduce((acc: number, curr: { cModule: { estimatedTimeToComplete: number } }) => {
        return acc + curr.cModule.estimatedTimeToComplete;
      }, 0);
    }
  }

  sendSuccessResponse(res, { assignedModules }, undefined, undefined, undefined, {
    ...(course.courseType === "DEGREE_COURSE" || course.courseType === "DIPLOMA_COURSE"
      ? { courseTotalCredits: course.totalCredits, courseAssignedTotalCredits: assignedTotal }
      : {}),
    ...(course.courseType === "CPD_COURSE" || course.courseType === "PROFESSIONAL_COURSE"
      ? {
          courseTotalMinutes: course.durationLength,
          courseAssignedTotalMinutes: assignedTotal,
        }
      : {}),
  });
};

const getCourseSemesters = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));

  const { semesters } = await CourseService.getCourseSemesters(courseId);

  // Get course with modules
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    include: {
      courseModules: {
        include: {
          cModule: true,
        },
      },
      awardingBody: true,
      sessionCourses: {
        include: {
          session: true,
        },
      },
    },
  });

  // Check if course exists
  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  // Calculate assigned total credits/minutes
  let assignedTotal = 0;

  if (course.courseModules && course.courseModules.length > 0) {
    const parsedCourse = zodSafeParse(
      course.courseModules,
      z.array(
        z.object({
          cModule: z.object({
            credit: z.coerce.number().min(1),
            estimatedTimeToComplete: z.coerce.number().min(1),
          }),
        }),
      ),
    );

    if (course.courseType === "DEGREE_COURSE" || course.courseType === "DIPLOMA_COURSE") {
      assignedTotal = parsedCourse.reduce((acc: number, curr: { cModule: { credit: number } }) => {
        return acc + curr.cModule.credit;
      }, 0);
    }

    if (course.courseType === "CPD_COURSE" || course.courseType === "PROFESSIONAL_COURSE") {
      assignedTotal = parsedCourse.reduce((acc: number, curr: { cModule: { estimatedTimeToComplete: number } }) => {
        return acc + curr.cModule.estimatedTimeToComplete;
      }, 0);
    }
  }

  sendSuccessResponse(res, { semesters }, undefined, undefined, undefined, {
    ...(course.courseType === "DEGREE_COURSE" || course.courseType === "DIPLOMA_COURSE"
      ? { courseTotalCredits: course.totalCredits, courseAssignedTotalCredits: assignedTotal }
      : {}),
    ...(course.courseType === "CPD_COURSE" || course.courseType === "PROFESSIONAL_COURSE"
      ? {
          courseTotalMinutes: course.totalCredits && course.totalCredits * 10 * 60,
          courseAssignedTotalMinutes: assignedTotal,
        }
      : {}),
  });
};

const updateModuleIndex = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));
  const reqBody = zodSafeParse(req.body, updateModuleIndexSchema);

  const { courseModules } = await CourseService.updateModuleIndex(courseId, reqBody);

  if (req.user) {
    // Create audit logs for each updated module
    for (const moduleUpdate of reqBody) {
      const module = await prisma.cModule.findUnique({
        where: {
          id: moduleUpdate.moduleId,
        },
        select: {
          title: true,
        },
      });

      await createAuditLog({
        userId: req.user?.userPortalCategory?.userId || "",
        action: `Updated module: ${module?.title || ""} index: ${moduleUpdate.index}`,
        actionType: "course_management",
        moduleId: moduleUpdate.moduleId || "",
        courseId: courseId || "",
      });
    }
  }

  sendSuccessResponse(res, { courseModules });
};

const updateModuleSemester = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));
  const reqBody = zodSafeParse(req.body, updateModuleSemesterSchema);

  const { updatedCourseModule } = await CourseService.updateModuleSemester(courseId, reqBody);

  if (req.user) {
    const module = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
      },
    });
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated module: ${module?.title || ""} semester: ${reqBody.semesterNumber}`,
      actionType: "course_management",
      moduleId: reqBody.moduleId || "",
      courseId: courseId || "",
      previousValue: JSON.stringify(updatedCourseModule),
    });
  }

  sendSuccessResponse(res, { updatedCourseModule });
};

const getAvailableModules = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));

  const { searchTerm } = zodSafeParse(req.query, z.object({ searchTerm: z.string().min(1).optional() }));

  const { availableModules } = await CourseService.getAvailableModules(courseId, searchTerm);

  sendSuccessResponse(res, { availableModules });
};

const getCourseStudents = async (req: RequestWithUser, res: Response) => {
  const { courseId } = zodSafeParse(req.params, z.object({ courseId: z.string().uuid() }));
  const { page, pageSize } = zodSafeParse(
    req.query,
    z.object({ page: z.coerce.number().min(1).default(1), pageSize: z.coerce.number().min(1).default(10) }),
  );

  const { students, pagination } = await CourseService.getCourseStudents(page, courseId, pageSize);

  sendSuccessResponse(res, { students }, undefined, undefined, pagination);
};

const getAuditLogs = async (req: RequestWithUser, res: Response) => {
  const courseId = req.params.courseId;
  if (!courseId) {
    throw new AppError("Course ID is required", "BAD_REQUEST", 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        courseId: courseId,
      },
      select: {
        id: true,
        action: true,
        actionType: true,
        // newValue: true,
        userId: true,
        createdAt: true,
        user: {
          select: {
            username: true,
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
        moduleName: courseId,
      },
    }),
  ]);

  const pagination = {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: auditLogs.length,
  };

  sendSuccessResponse(res, { auditLogs }, "Audit logs fetched", 200, pagination);
};

export const CourseController = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  getAvailableModules,
  getAssignedModules,
  getCourseSemesters,
  unassignCourseModule,
  updateModuleIndex,
  updateModuleSemester,
  assignCourseModule,
  getCourseStudents,
  getAuditLogs,
};
