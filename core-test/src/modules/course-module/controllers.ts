import { RequestWithUser } from "../../types";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import z from "zod";
import {
  AdvancedCourseModuleCreateSchema,
  AdvancedCourseModuleUpdateSchema,
  assignAssessmentToCourseModuleSchema,
  assignLessonToCourseModuleSchema,
  CourseCourseModuleGetReqBodySchema,
  CourseModuleGetReqBodySchema,
  ProfessionalOrCpdCourseModuleCreateSchema,
  ProfessionalOrCpdCourseModuleUpdateSchema,
  updateAssessmentIndexSchema,
  updateLessonsIndexSchema,
} from "./types";
import prisma from "../../prismaClient";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { CourseModuleService } from "./services";
import createAuditLog from "../../utils/auditlog";
import { AppError } from "../../utils/AppError";

const getCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, CourseModuleGetReqBodySchema);

  const { courseModules, pagination } = await CourseModuleService.getCourseModule(reqBody);

  sendSuccessResponse(res, { courseModules }, undefined, undefined, pagination);
};

const getCourseModuleById = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = req.params;

  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      CourseModule: {
        include: {
          course: true,
        },
      },
      awardingBody: true,
      moduleLessons: {
        include: {
          lesson: true,
        },
      },
    },
  });

  sendSuccessResponse(res, { courseModule });
};

const createCourseModule = async (req: RequestWithUser, res: Response) => {
  const courseModuleType = zodSafeParse(
    req.body,
    z.object({
      moduleType: z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL_CERTIFICATE"]),
    }),
  );

  let courseModule;

  if (courseModuleType.moduleType === "DEGREE" || courseModuleType.moduleType === "DIPLOMA") {
    const reqBody = zodSafeParse(req.body, AdvancedCourseModuleCreateSchema);

    // For DEGREE/DIPLOMA modules, check that credit constraint is satisfied at creation
    if (reqBody.credit) {
      // Calculate total estimated time for lessons that would be assigned to this module
      // For now, we just check if credit * 10 is at least 0, as no lessons are assigned yet
      // The actual validation will happen when lessons are added
      if (reqBody.credit < 0) {
        throw new AppError("Credit value cannot be negative", "BAD_REQUEST", 400);
      }
    }

    courseModule = await prisma.cModule.create({
      data: {
        ...reqBody,
      },
    });
  } else if (courseModuleType.moduleType === "CPD" || courseModuleType.moduleType === "PROFESSIONAL_CERTIFICATE") {
    const reqBody = zodSafeParse(req.body, ProfessionalOrCpdCourseModuleCreateSchema);

    // For CPD/PROFESSIONAL_CERTIFICATE modules, check that estimated time constraint is satisfied at creation
    if (reqBody.estimatedTimeToComplete) {
      if (reqBody.estimatedTimeToComplete < 0) {
        throw new AppError("Estimated time to complete cannot be negative", "BAD_REQUEST", 400);
      }
    }

    courseModule = await prisma.cModule.create({
      data: reqBody,
    });
  }

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Created module: ${courseModule?.title || ""} module type: ${courseModuleType.moduleType}`,
      actionType: "course_management",
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const updateCourseModule = async (req: RequestWithUser, res: Response) => {
  const courseModuleType = zodSafeParse(
    req.body,
    z.object({
      moduleType: z.enum(["DEGREE", "DIPLOMA", "CPD", "PROFESSIONAL_CERTIFICATE"]),
    }),
  );

  // Get existing course module
  const existingCourseModule = await prisma.cModule.findUnique({
    where: {
      id: req.body.id,
    },
    include: {
      CourseModule: true, // Include course modules to check if any courses are assigned
      moduleLessons: {
        include: {
          lesson: true,
        },
      }, // Include module lessons to check if any lessons are assigned
    },
  });

  if (!existingCourseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  let courseModule;

  if (courseModuleType.moduleType === "DEGREE" || courseModuleType.moduleType === "DIPLOMA") {
    const reqBody = zodSafeParse(req.body, AdvancedCourseModuleUpdateSchema);

    // Check if awardingBodyId is being updated and if there are existing course or lesson assignments
    if (req.body.awardingBodyId && req.body.awardingBodyId !== existingCourseModule?.awardingBodyId) {
      // If course module is assigned to courses, prevent awarding body change
      if (existingCourseModule?.CourseModule && existingCourseModule.CourseModule.length > 0) {
        throw new AppError("Cannot update awarding body when course module is assigned to courses", "BAD_REQUEST", 400);
      }

      // If course module has assigned lessons, prevent awarding body change
      if (existingCourseModule?.moduleLessons && existingCourseModule.moduleLessons.length > 0) {
        throw new AppError("Cannot update awarding body when course module has assigned lessons", "BAD_REQUEST", 400);
      }
    }

    // Check if credit is being updated and if module total credits is less than the new value
    if (reqBody.credit) {
      const existingCourseModuleAssignedLessonsTotalHours = existingCourseModule?.moduleLessons.reduce((acc, curr) => {
        return acc + curr.lesson.estimatedTimeToComplete;
      }, 0);

      if (reqBody.credit * 10 < existingCourseModuleAssignedLessonsTotalHours) {
        throw new AppError(
          `Cannot update credits when lessons total hours (${existingCourseModuleAssignedLessonsTotalHours}) is less than the new value (${reqBody.credit * 10})`,
          "BAD_REQUEST",
          400,
        );
      }
    }

    courseModule = await prisma.cModule.update({
      where: {
        id: reqBody.id,
      },
      data: {
        ...reqBody,
      },
    });
  } else if (courseModuleType.moduleType === "CPD" || courseModuleType.moduleType === "PROFESSIONAL_CERTIFICATE") {
    const reqBody = zodSafeParse(req.body, ProfessionalOrCpdCourseModuleUpdateSchema);

    // Check if estimated time to complete is being updated and if module total minutes is less than the new value
    if (reqBody.estimatedTimeToComplete) {
      const existingCourseModuleAssignedLessonsTotalMinutes = existingCourseModule?.moduleLessons.reduce(
        (acc, curr) => {
          return acc + curr.lesson.estimatedTimeToComplete;
        },
        0,
      );

      if (reqBody.estimatedTimeToComplete < existingCourseModuleAssignedLessonsTotalMinutes) {
        throw new AppError(
          `Cannot update estimated time to complete when lessons total minutes (${existingCourseModuleAssignedLessonsTotalMinutes}) is less than the new value (${reqBody.estimatedTimeToComplete})`,
          "BAD_REQUEST",
          400,
        );
      }
    }

    courseModule = await prisma.cModule.update({
      where: {
        id: reqBody.id,
      },
      data: reqBody,
    });
  }
  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated course: ${courseModule?.title || ""} module type: ${courseModuleType.moduleType}`,
      actionType: "course_management",
      moduleId: req.body.id || "",
      courseId: req.body.courseId || "",
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const assignLessonToCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignLessonToCourseModuleSchema);

  const module = await prisma.cModule.findUnique({
    where: {
      id: reqBody.moduleId,
    },
    include: {
      moduleLessons: {
        include: {
          lesson: true,
        },
      },
    },
  });

  if (!module) {
    throw new AppError("Module not found", "NOT_FOUND", 404);
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: reqBody.lessonId,
    },
    include: {
      lessonContents: true,
    },
  });

  if (!lesson) {
    throw new AppError("Lesson not found", "NOT_FOUND", 404);
  }

  // Check if lesson has content
  if (!lesson.lessonContents || lesson.lessonContents.length === 0) {
    throw new AppError("Cannot assign lesson without content to a course module", "BAD_REQUEST", 400);
  }

  // Check if lesson type matches module type
  if (lesson.type !== module.moduleType) {
    throw new AppError(`Cannot assign ${lesson.type} lesson to ${module.moduleType} module`, "BAD_REQUEST", 400);
  }

  // Get module allowed total
  const moduleAllowedTotal = module.estimatedTimeToComplete;

  // Get lesson total
  const lessonTotal = module.moduleLessons.reduce((acc, curr) => {
    return acc + curr.lesson.estimatedTimeToComplete;
  }, lesson.estimatedTimeToComplete);

  // Check if the lesson total exceeds the module total
  if (lessonTotal > moduleAllowedTotal) {
    if (module.moduleType === "DEGREE" || module.moduleType === "DIPLOMA") {
      throw new AppError(
        `Lesson total hours (${lessonTotal}) exceeds module total hours (${moduleAllowedTotal})`,
        "BAD_REQUEST",
        400,
      );
    }
    if (module.moduleType === "CPD" || module.moduleType === "PROFESSIONAL_CERTIFICATE") {
      throw new AppError(
        `Lesson total minutes (${lessonTotal}) exceeds module total minutes (${moduleAllowedTotal})`,
        "BAD_REQUEST",
        400,
      );
    }
  }

  const { courseModule } = await CourseModuleService.assignLessonToCourseModule(reqBody);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Assigned lesson: ${lesson.title || ""} to course: ${courseModule.title || ""}`,
      actionType: "course_management",
      moduleId: courseModule.id || "",
      //  working on this
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const assignAssessmentToCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignAssessmentToCourseModuleSchema);

  const module = await prisma.cModule.findUnique({
    where: {
      id: reqBody.moduleId,
    },
    include: {
      moduleAssessments: {
        include: {
          assessment: true,
        },
      },
    },
  });

  if (!module) {
    throw new AppError("Module not found", "NOT_FOUND", 404);
  }

  const assessment = await prisma.assessment.findUnique({
    where: {
      id: reqBody.assessmentId,
    },
    include: {
      quizQuestions: true,
      assignmentQuestions: true,
    },
  });

  if (!assessment) {
    throw new AppError("Assessment not found", "NOT_FOUND", 404);
  }

  // Check if assessment has quiz questions or assignment questions
  if (assessment.status === "DRAFT") {
    throw new AppError("Assessment is not published", "BAD_REQUEST", 400);
  }

  // Check if assessment type matches module type
  if (assessment.assessmentType !== module.moduleType) {
    throw new AppError(
      `Cannot assign ${assessment.assessmentType} assessment to ${module.moduleType} module`,
      "BAD_REQUEST",
      400,
    );
  }

  // Check if assessment is already assigned to this module
  const isAlreadyAssigned = module.moduleAssessments.some((ma) => ma.assessmentId === reqBody.assessmentId);

  if (isAlreadyAssigned) {
    throw new AppError("Assessment is already assigned to this module", "BAD_REQUEST", 400);
  }

  // Check if assessment weight is valid
  if (assessment.weight === null || assessment.weight === 0) {
    throw new AppError(`Assessment weight cannot be ${assessment.weight}`, "BAD_REQUEST", 400);
  }

  // Check if assessment total weight exceeds 100
  const currentTotalWeight = module.moduleAssessments.reduce((acc, curr) => {
    return acc + (curr.assessment.weight || 0);
  }, 0);

  const newTotalWeight = currentTotalWeight + (assessment.weight || 0);

  if (newTotalWeight > 100) {
    throw new AppError(
      `Total assessment weight (${newTotalWeight}) exceeds module total weight (100)`,
      "BAD_REQUEST",
      400,
    );
  }

  const { courseModule } = await CourseModuleService.assignAssessmentToCourseModule(reqBody);

  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Assigned Assessment: ${assessment.nameOrTitle || ""} to course: ${courseModule.title || ""}`,
      actionType: "course_management",
      moduleId: courseModule.id || "",
      //  working on this
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const unassignLessonOfCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignLessonToCourseModuleSchema);

  const { courseModule } = await CourseModuleService.unassignLessonOfCourseModule(reqBody);

  if (req.user) {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: reqBody.lessonId,
      },
      select: {
        title: true,
      },
    });

    const module = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
      },
    });
    const course = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
        id: true,
      },
    });
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Unassigned lesson: ${lesson?.title || ""} from module: ${module?.title || ""}`,
      actionType: "course_management",
      moduleId: reqBody.moduleId || "",
      courseId: course?.id || "",
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const unassignAssessmentOfCourseModule = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, assignAssessmentToCourseModuleSchema);

  const { courseModule } = await CourseModuleService.unassignAssessmentOfCourseModule(reqBody);

  if (req.user) {
    const assessment = await prisma.assessment.findUnique({
      where: {
        id: reqBody.assessmentId,
      },
      select: {
        nameOrTitle: true,
      },
    });

    const module = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
      },
    });
    const course = await prisma.cModule.findUnique({
      where: {
        id: reqBody.moduleId,
      },
      select: {
        title: true,
        id: true,
      },
    });
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Unassigned assessment: ${assessment?.nameOrTitle || ""} from module: ${module?.title || ""}`,
      actionType: "course_management",
      moduleId: reqBody.moduleId || "",
      courseId: course?.id || "",
    });
  }

  sendSuccessResponse(res, { courseModule });
};

const getAssignedLessons = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));

  const { assignedLessons } = await CourseModuleService.getAssignedLessons(moduleId);

  let assignedLessonsTotal = 0;

  // Calculate assigned lessons total
  if (assignedLessons.length > 0) {
    assignedLessonsTotal = assignedLessons.reduce((acc, curr) => {
      return acc + curr.estimatedTimeToComplete;
    }, 0);
  }

  // Get module
  const module = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!module) {
    throw new AppError("Module not found", "NOT_FOUND", 404);
  }

  // Module total
  const moduleTotal = module.estimatedTimeToComplete;

  sendSuccessResponse(res, { assignedLessons }, undefined, undefined, undefined, {
    moduleTotal,
    assignedLessonsTotal,
  });
};

const getAssignedContents = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));

  const { assignedContents } = await CourseModuleService.getAssignedContents(moduleId);

  let assignedLessonsTotal = 0;

  // Calculate assigned lessons total
  if (assignedContents.length > 0) {
    assignedLessonsTotal = assignedContents.reduce((acc, curr) => {
      if (typeof curr === "object" && (curr as { estimatedTimeToComplete?: number }).estimatedTimeToComplete)
        return ((acc as number) + (curr as { estimatedTimeToComplete: number }).estimatedTimeToComplete) as number;
      else return (acc as number) + 0;
    }, 0) as number;
  }

  // Get module
  const module = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!module) {
    throw new AppError("Module not found", "NOT_FOUND", 404);
  }

  // Module total
  const moduleTotal = module.estimatedTimeToComplete;

  sendSuccessResponse(res, { assignedContents }, undefined, undefined, undefined, {
    moduleTotal,
    assignedLessonsTotal,
  });
};

const getAvailableLessons = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
  const { searchTerm } = zodSafeParse(req.query, z.object({ searchTerm: z.string().min(1).optional() }));

  const { availableLessons } = await CourseModuleService.getAvailableLessons(moduleId, searchTerm);

  sendSuccessResponse(res, { availableLessons });
};

const getAvailableAssessments = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
  const { searchTerm } = zodSafeParse(req.query, z.object({ searchTerm: z.string().min(1).optional() }));

  const { availableAssessments } = await CourseModuleService.getAvailableAssessments(moduleId, searchTerm);

  sendSuccessResponse(res, { availableAssessments });
};

const updateLessonsIndex = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
  const reqBody = zodSafeParse(req.body, updateLessonsIndexSchema);

  await CourseModuleService.updateLessonsIndex(moduleId, reqBody);
  const course = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
    },
  });
  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated lessons index for module`,
      actionType: "course_management",
      moduleId: moduleId || "",
      courseId: course?.id || " ",
    });
  }

  sendSuccessResponse(res, {});
};

const updateAssessmentIndex = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
  const reqBody = zodSafeParse(req.body, updateAssessmentIndexSchema);

  await CourseModuleService.updateAssessmentIndex(moduleId, reqBody);
  const course = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
    select: {
      id: true,
    },
  });
  if (req.user) {
    await createAuditLog({
      userId: req.user?.userPortalCategory?.userId || "",
      action: `Updated assessment's index for module`,
      actionType: "course_management",
      moduleId: moduleId || "",
      courseId: course?.id || " ",
    });
  }

  sendSuccessResponse(res, {});
};

const getConnectedCourses = async (req: RequestWithUser, res: Response) => {
  const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
  const { page, pageSize } = zodSafeParse(
    req.query,
    z.object({ page: z.coerce.number().min(1).default(1), pageSize: z.coerce.number().min(1).default(10) }),
  );

  const { connectedCourses, pagination } = await CourseModuleService.getConnectedCourses(moduleId, page, pageSize);

  sendSuccessResponse(res, { connectedCourses }, undefined, undefined, pagination);
};

// const getConnectedCourses = async (req: RequestWithUser, res: Response) => {
//   const { moduleId } = zodSafeParse(req.params, z.object({ moduleId: z.string().uuid() }));
//
//   // sendSuccessResponse(res, { courseAndModules });
// };

const getAuditLogs = async (req: RequestWithUser, res: Response) => {
  const moduleId = req.params.moduleId;
  if (!moduleId) {
    throw new AppError("Module ID is required", "BAD_REQUEST", 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        moduleId: moduleId,
      },
      select: {
        id: true,
        action: true,
        actionType: true,
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
        moduleId: moduleId,
      },
    }),
  ]);
  // const transformedAuditLogs = auditLogs.map((log) => ({
  //   ...log,
  //   action: `${log.user?.username ?? "Unknown"} ${log.action}`,
  // }));
  const pagination = {
    page,
    perPage: limit,
    total,
    totalPages: Math.ceil(total / limit),
    count: auditLogs.length,
  };

  sendSuccessResponse(res, { auditLogs }, "Audit logs fetched", 200, pagination);
};

export const CourseModuleController = {
  getCourseModule,
  getCourseModuleById,
  createCourseModule,
  updateCourseModule,
  assignLessonToCourseModule,
  assignAssessmentToCourseModule,
  unassignLessonOfCourseModule,
  unassignAssessmentOfCourseModule,
  getAssignedLessons,
  getAssignedContents,
  getAvailableLessons,
  getAvailableAssessments,
  updateLessonsIndex,
  updateAssessmentIndex,
  getConnectedCourses,
  getAuditLogs,
};
