import { CModuleType, Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import { AppError } from "../../utils/AppError";
import {
  AssignAssessmentToCourseModule,
  AssignLessonToCourseModule,
  CourseModuleGetReqBody,
  UpdateAssessmentIndex,
  UpdateLessonsIndex,
} from "./types";

const getCourseModule = async (reqBody: CourseModuleGetReqBody) => {
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.CModuleWhereInput = {
    AND: [
      ...(reqBody.courseType ? [{ courseType: reqBody.courseType }] : []),
      ...(reqBody.searchTerm
        ? [
            {
              OR: [
                {
                  title: {
                    contains: reqBody.searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
                {
                  id: {
                    contains: reqBody.searchTerm,
                    mode: Prisma.QueryMode.insensitive,
                  },
                },
              ],
            },
          ]
        : []),
      // ...(reqBody.searchTerm
      //   ? [
      //       {
      //         title: {
      //           contains: reqBody.searchTerm,
      //           mode: Prisma.QueryMode.insensitive,
      //         },
      //       },
      //     ]
      //   : []),
      ...(reqBody.title ? [{ title: { contains: reqBody.title, mode: Prisma.QueryMode.insensitive } }] : []),
      ...(reqBody.moduleType ? [{ moduleType: reqBody.moduleType }] : []),
      ...(reqBody.status ? [{ status: reqBody.status }] : []),
      ...(reqBody.credit ? [{ credit: reqBody.credit }] : []),
      ...(reqBody.estimatedTimeToComplete ? [{ estimatedTimeToComplete: reqBody.estimatedTimeToComplete }] : []),
      ...(reqBody.awardingBodyId ? [{ awardingBodyId: reqBody.awardingBodyId }] : []),
      ...(reqBody.moduleCode ? [{ code: reqBody.moduleCode }] : []),
      ...(reqBody.facultyId ? [{ facultyId: reqBody.facultyId }] : []),
    ],
  };

  const [courseModules, count] = await prisma.$transaction([
    prisma.cModule.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        CourseModule: true,
        awardingBody: true,
        moduleLessons: true,
      },
    }),

    prisma.cModule.count({
      where,
    }),
  ]);

  const paginationData = {
    count: courseModules.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return {
    courseModules,
    pagination: paginationData,
  };
};

const assignLessonToCourseModule = async (reqBody: AssignLessonToCourseModule) => {
  // Check if the lesson is already assigned to any course module
  const existingAssignment = await prisma.moduleLesson.findFirst({
    where: {
      lessonId: reqBody.lessonId,
      cModuleId: reqBody.moduleId,
    },
  });

  if (existingAssignment) {
    throw new AppError("Lesson is already assigned to this course module", "BAD_REQUEST", 400);
  }

  const courseModuleLength = await prisma.moduleLesson.count({
    where: {
      cModuleId: reqBody.moduleId,
    },
  });

  const courseModule = await prisma.cModule.update({
    where: {
      id: reqBody.moduleId,
    },
    data: {
      moduleLessons: {
        create: {
          lessonId: reqBody.lessonId,
          index: courseModuleLength + 1,
        },
      },
    },
  });

  const contentsOrder = courseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder)) {
    contentsOrder.push(reqBody.lessonId);
  }

  const courseModuleWithContentsOrder = await prisma.cModule.update({
    where: {
      id: reqBody.moduleId,
    },
    data: {
      contentsOrder: contentsOrder,
    },
  });

  return { courseModule: courseModuleWithContentsOrder };
};

const assignAssessmentToCourseModule = async (reqBody: AssignAssessmentToCourseModule) => {
  // Check if the assessment is already assigned to any course module
  const existingAssignment = await prisma.moduleAssessment.findFirst({
    where: {
      assessmentId: reqBody.assessmentId,
      cModuleId: reqBody.moduleId,
    },
  });

  if (existingAssignment) {
    throw new AppError("Assessment is already assigned to this course module", "BAD_REQUEST", 400);
  }

  const courseModule = await prisma.cModule.update({
    where: {
      id: reqBody.moduleId,
    },
    data: {
      moduleAssessments: {
        create: {
          assessmentId: reqBody.assessmentId,
        },
      },
    },
  });

  const contentsOrder = courseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder)) {
    contentsOrder.push(reqBody.assessmentId);
  }

  const courseModuleWithContentsOrder = await prisma.cModule.update({
    where: {
      id: reqBody.moduleId,
    },
    data: {
      contentsOrder: contentsOrder,
    },
  });

  return { courseModule: courseModuleWithContentsOrder };
};

const unassignLessonOfCourseModule = async (reqBody: AssignLessonToCourseModule) => {
  const existingCourseModule = await prisma.cModule.findUnique({
    where: {
      id: reqBody.moduleId,
    },
  });

  if (!existingCourseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const courseModule = await prisma.moduleLesson.deleteMany({
    where: {
      cModuleId: reqBody.moduleId,
      lessonId: reqBody.lessonId,
    },
  });

  const contentsOrder = existingCourseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder) && contentsOrder.length > 0) {
    contentsOrder.splice(contentsOrder.indexOf(reqBody.lessonId), 1);

    await prisma.cModule.update({
      where: {
        id: reqBody.moduleId,
      },
      data: {
        contentsOrder: contentsOrder,
      },
    });
  }

  return { courseModule };
};

const unassignAssessmentOfCourseModule = async (reqBody: AssignAssessmentToCourseModule) => {
  const existingCourseModule = await prisma.cModule.findUnique({
    where: {
      id: reqBody.moduleId,
    },
  });

  if (!existingCourseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const courseModule = await prisma.moduleAssessment.deleteMany({
    where: {
      cModuleId: reqBody.moduleId,
      assessmentId: reqBody.assessmentId,
    },
  });

  const contentsOrder = existingCourseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder) && contentsOrder.length > 0) {
    contentsOrder.splice(contentsOrder.indexOf(reqBody.assessmentId), 1);

    await prisma.cModule.update({
      where: {
        id: reqBody.moduleId,
      },
      data: {
        contentsOrder: contentsOrder,
      },
    });
  }

  return { courseModule };
};

const getAssignedLessons = async (moduleId: string) => {
  const assignedLessons = await prisma.lesson.findMany({
    where: {
      moduleLessons: {
        some: {
          cModuleId: moduleId,
        },
      },
    },
    include: {
      lessonContents: {
        include: {
          content: true,
        },
      },
      moduleLessons: {
        where: {
          cModuleId: moduleId,
        },
      },
    },
  });

  const sortedAssignedLessons = assignedLessons.sort((a, b) => {
    if (!a.moduleLessons[0].index || !b.moduleLessons[0].index) {
      return 0;
    }
    return a.moduleLessons[0].index - b.moduleLessons[0].index;
  });

  const sortedAssignedLessonsWithIndex = sortedAssignedLessons.map((lesson) => {
    const { moduleLessons, ...lessonData } = lesson;
    return {
      ...lessonData,
      index: lesson.moduleLessons[0].index,
    };
  });

  return { assignedLessons: sortedAssignedLessonsWithIndex };
};

const getAssignedContents = async (moduleId: string) => {
  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  // Type guard to ensure contentsOrder is an array of strings
  let contentsOrder: string[] = [];
  if (courseModule.contentsOrder && Array.isArray(courseModule.contentsOrder)) {
    contentsOrder = courseModule.contentsOrder.filter((id): id is string => typeof id === "string");
  }

  let assignedContents: unknown[] = [];

  if (contentsOrder.length > 0) {
    // Get all lessons and assessments assigned to this module in a single query
    const [moduleLessons, moduleAssessments] = await Promise.all([
      prisma.moduleLesson.findMany({
        where: {
          cModuleId: moduleId,
        },
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
      }),
      prisma.moduleAssessment.findMany({
        where: {
          cModuleId: moduleId,
        },
        include: {
          assessment: {
            include: {
              quizQuestions: true,
              assignmentQuestions: true,
            },
          },
        },
      }),
    ]);

    // Create maps for quick lookup
    const lessonMap = new Map(moduleLessons.map((ml) => [ml.lessonId, ml.lesson]));
    const assessmentMap = new Map(moduleAssessments.map((ma) => [ma.assessmentId, ma.assessment]));

    // Construct the final array in the order specified by contentsOrder
    for (const contentId of contentsOrder) {
      if (lessonMap.has(contentId)) {
        assignedContents.push(lessonMap.get(contentId));
      } else if (assessmentMap.has(contentId)) {
        assignedContents.push(assessmentMap.get(contentId));
      }
    }
  } else {
    // Fallback: fetch all assigned lessons and assessments if contentsOrder is empty or invalid
    const [allLessons, allAssessments] = await Promise.all([
      prisma.lesson.findMany({
        where: {
          moduleLessons: {
            some: {
              cModuleId: moduleId,
            },
          },
        },
        include: {
          lessonContents: {
            include: {
              content: true,
            },
          },
          moduleLessons: {
            where: {
              cModuleId: moduleId,
            },
          },
        },
      }),
      prisma.assessment.findMany({
        where: {
          moduleAssessments: {
            some: {
              cModuleId: moduleId,
            },
          },
        },
        include: {
          quizQuestions: true,
          assignmentQuestions: true,
        },
      }),
    ]);

    assignedContents = [...allLessons, ...allAssessments];
  }

  return { assignedContents };
};

const getAvailableLessons = async (moduleId: string, searchTerm: string | undefined) => {
  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      awardingBody: true,
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

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const moduleType = courseModule.moduleType as CModuleType;

  const availableLessons = await prisma.lesson.findMany({
    where: {
      type: moduleType,
      awardingBodyId: courseModule.awardingBodyId,
      ...(searchTerm && { title: { contains: searchTerm, mode: "insensitive" } }),
    },
  });

  return { availableLessons };
};

const getAvailableAssessments = async (moduleId: string, searchTerm: string | undefined) => {
  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
    include: {
      awardingBody: true,
      moduleAssessments: {
        include: {
          assessment: {
            include: {
              quizQuestions: true,
              assignmentQuestions: true,
            },
          },
        },
      },
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const moduleType = courseModule.moduleType as CModuleType;

  const availableAssessments = await prisma.assessment.findMany({
    where: {
      status: "PUBLISHED",
      assessmentType: moduleType === "PROFESSIONAL_CERTIFICATE" ? "PROFESSIONAL" : moduleType,
      ...((moduleType === "DEGREE" || moduleType === "DIPLOMA") && {
        awardingBodyId: courseModule.awardingBodyId,
      }),
      ...(searchTerm && { nameOrTitle: { contains: searchTerm, mode: "insensitive" } }),
    },
  });

  return { availableAssessments };
};

// const getConnectedCourses = async (moduleId: string) => {
//   const connectedCourses = await prisma.courseAndModule.findMany({
//     where: {
//       modules: {
//         path: []
//       },
//     },
//   });
//
//   return { connectedCourses };
// };

const updateLessonsIndex = async (moduleId: string, reqBody: UpdateLessonsIndex) => {
  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const contentsOrder = courseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder)) {
    // Use a transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.cModule.findUnique({
        where: {
          id: moduleId,
        },
      });

      if (!updatedModule) {
        throw new AppError("Course module not found", "NOT_FOUND", 404);
      }

      const updatedContentsOrder = updatedModule.contentsOrder || [];

      if (Array.isArray(updatedContentsOrder)) {
        const currentIndex = updatedContentsOrder.indexOf(reqBody.lessonId);
        if (currentIndex === -1) {
          throw new AppError("Lesson not found in module contents", "NOT_FOUND", 404);
        }

        updatedContentsOrder.splice(currentIndex, 1);
        updatedContentsOrder.splice(reqBody.index, 0, reqBody.lessonId);

        await tx.cModule.update({
          where: {
            id: moduleId,
          },
          data: {
            contentsOrder: updatedContentsOrder,
          },
        });
      }
    });
  }

  // for (const lesson of reqBody) {
  //   await prisma.moduleLesson.updateMany({
  //     where: {
  //       cModuleId: moduleId,
  //       lessonId: lesson.lessonId,
  //     },
  //     data: {
  //       index: lesson.index,
  //     },
  //   });
  // }
  return;
};

const updateAssessmentIndex = async (moduleId: string, reqBody: UpdateAssessmentIndex) => {
  const courseModule = await prisma.cModule.findUnique({
    where: {
      id: moduleId,
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  const contentsOrder = courseModule.contentsOrder || [];

  if (Array.isArray(contentsOrder)) {
    // Use a transaction to ensure atomic update
    await prisma.$transaction(async (tx) => {
      const updatedModule = await tx.cModule.findUnique({
        where: {
          id: moduleId,
        },
      });

      if (!updatedModule) {
        throw new AppError("Course module not found", "NOT_FOUND", 404);
      }

      const updatedContentsOrder = updatedModule.contentsOrder || [];

      if (Array.isArray(updatedContentsOrder)) {
        const currentIndex = updatedContentsOrder.indexOf(reqBody.assessmentId);
        if (currentIndex === -1) {
          throw new AppError("Assessment not found in module contents", "NOT_FOUND", 404);
        }

        updatedContentsOrder.splice(currentIndex, 1);
        updatedContentsOrder.splice(reqBody.index, 0, reqBody.assessmentId);

        await tx.cModule.update({
          where: {
            id: moduleId,
          },
          data: {
            contentsOrder: updatedContentsOrder,
          },
        });
      }
    });
  }

  // for (const lesson of reqBody) {
  //   await prisma.moduleLesson.updateMany({
  //     where: {
  //       cModuleId: moduleId,
  //       lessonId: lesson.lessonId,
  //     },
  //     data: {
  //       index: lesson.index,
  //     },
  //   });
  // }
  return;
};

const getConnectedCourses = async (moduleId: string, page: number, pageSize: number) => {
  const { limit, offset } = getPagination(page, pageSize);

  const [connectedCourses, count] = await prisma.$transaction([
    prisma.course.findMany({
      where: {
        courseModules: {
          some: {
            cModuleId: moduleId,
          },
        },
      },
      take: limit,
      skip: offset,
    }),
    prisma.course.count({
      where: {
        courseModules: {
          some: {
            cModuleId: moduleId,
          },
        },
      },
    }),
  ]);

  const paginationData = {
    count: count,
    total: count,
    page: page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { connectedCourses, pagination: paginationData };
};

export const CourseModuleService = {
  getCourseModule,
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
};
