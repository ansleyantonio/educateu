import { Prisma } from "@prisma/client";
import prisma from "../../prismaClient";
import { getPagination } from "../../utils/paginationUtils";
import {
  AdvancedCourseCreate,
  AdvancedCourseUpdate,
  AssignCourseModule,
  CreateCpdCourse,
  GetCoursesReqBody,
  ProfessionalCourseCreate,
  ProfessionalCourseUpdate,
  UpdateCpdCourse,
  UpdateModuleIndex,
  UpdateModuleSemester,
} from "./types";
import { AppError } from "../../utils/AppError";
import { AssessmentService } from "../assessment/services";

const getCourses = async (reqBody: GetCoursesReqBody) => {
  const { limit, offset } = getPagination(reqBody.page, reqBody.pageSize);

  const where: Prisma.CourseWhereInput = {
    AND: [
      ...(reqBody.courseType
        ? [
            typeof reqBody.courseType === "string"
              ? { courseType: reqBody.courseType }
              : { courseType: { in: reqBody.courseType } },
          ]
        : []),
      ...(reqBody.title ? [{ title: { contains: reqBody.title, mode: Prisma.QueryMode.insensitive } }] : []),
      ...(reqBody.status
        ? [
            {
              status: {
                in: reqBody.status,
              },
            },
          ]
        : []),
      ...(reqBody.numberOfSemesters ? [{ numberOfSemesters: reqBody.numberOfSemesters }] : []),
      // ...(reqBody.studyModes ? [{ studyModes: reqBody.studyModes }] : []),
      ...(reqBody.durationLength ? [{ durationLength: reqBody.durationLength }] : []),
      ...(reqBody.accreditationStatus ? [{ accreditationStatus: reqBody.accreditationStatus }] : []),
      ...(reqBody.hasFees !== undefined
        ? [
            {
              courseFees: reqBody.hasFees ? { some: {} } : { none: {} },
            },
          ]
        : []),
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
    ],
  };

  const [courses, count] = await prisma.$transaction([
    prisma.course.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        // id: true,
        // title: true,
        // totalCredits: true,
        // code: true,
        // status: true,
        // hesaCourseId: true,
        // courseType: true,
        // intendedAward: true,
        // courseDescription: true,
        // studyModes: true,
        // degreeType: true,
        // diplomaType: true,
        // startDate: true,
        // endDate: true,
        // numberOfSemesters: true,
        // minimumPassingCreditsPerYear: true,

        awardingBody: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        courseModules: true,
        // sessionCourses: {
        //   include: {
        //     session: true,
        //   },
        // },
      },
    }),
    prisma.course.count({
      where,
    }),
  ]);

  const paginationData = {
    count: courses.length,
    total: count,
    page: reqBody.page,
    perPage: limit,
    totalPages: Math.ceil(count / limit),
  };

  return { courses, pagination: paginationData };
};

const assignCourseModule = async (reqBody: AssignCourseModule) => {
  // Check if the module is already assigned to this course
  const existingCourseModule = await prisma.courseModule.findUnique({
    where: {
      courseId_cModuleId: {
        courseId: reqBody.courseId,
        cModuleId: reqBody.moduleId,
      },
    },
  });

  if (existingCourseModule) {
    throw new AppError("Course module already assigned to course", "BAD_REQUEST", 400);
  }

  // Get the highest index for this course's modules to assign the new module to the end
  const courseModules = await prisma.courseModule.findMany({
    where: {
      courseId: reqBody.courseId,
    },
    orderBy: {
      index: "asc",
    },
  });

  const newIndex = courseModules.length > 0 ? Math.max(...courseModules.map((cm) => cm.index || 0)) + 1 : 1;

  // Create the direct relationship
  const courseModule = await prisma.courseModule.create({
    data: {
      courseId: reqBody.courseId,
      cModuleId: reqBody.moduleId,
      index: newIndex,
    },
  });

  return { courseModule };

  // const sessionAwardingBodyCourseModule = await prisma.sesAbCourseModule.create({
  //   data: {
  //     sessionAbCourseId: reqBody.sessionAwardingBodyCourseId,
  //     awardingBodyModuleId: reqBody.awardingBodyModuleId,
  //   },
  // });
  //
  // return { sessionAwardingBodyCourseModule };
};

const unassignCourseModule = async (reqBody: AssignCourseModule) => {
  // Find and delete the direct relationship
  const courseModule = await prisma.courseModule.findUnique({
    where: {
      courseId_cModuleId: {
        courseId: reqBody.courseId,
        cModuleId: reqBody.moduleId,
      },
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not assigned to course", "NOT_FOUND", 404);
  }

  // Delete the relationship
  await prisma.courseModule.delete({
    where: {
      id: courseModule.id,
    },
  });

  // Re-index remaining modules
  const remainingCourseModules = await prisma.courseModule.findMany({
    where: {
      courseId: reqBody.courseId,
    },
    orderBy: {
      index: "asc",
    },
  });

  // Update indices to be sequential
  for (let i = 0; i < remainingCourseModules.length; i++) {
    await prisma.courseModule.update({
      where: {
        id: remainingCourseModules[i].id,
      },
      data: {
        index: i + 1,
      },
    });
  }

  return { courseModule };
};

const getAssignedModules = async (courseId: string) => {
  const courseModules = await prisma.courseModule.findMany({
    where: {
      courseId: courseId,
    },
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
        },
      },
    },
    orderBy: {
      index: "asc",
    },
  });

  const assignedModules = courseModules.map((cm) => ({
    ...cm.cModule,
    index: cm.index,
  }));

  return { assignedModules };
};

const getCourseSemesters = async (courseId: string) => {
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
    orderBy: {
      semesterNumber: "asc",
    },
  });

  // Group modules by semester number
  const semesters: {
    semesterNumber: number;
    modules: { cModule: (typeof courseModules)[number]["cModule"] & { index?: number | null } }[];
  }[] = [];

  courseModules.forEach((courseModule) => {
    // Skip modules without a semester number
    if (courseModule.semesterNumber === null || courseModule.semesterNumber === undefined) {
      return;
    }

    const semesterIndex = semesters.findIndex((s) => s.semesterNumber === courseModule.semesterNumber);

    if (semesterIndex !== -1) {
      // Add module to existing semester
      semesters[semesterIndex].modules.push({
        cModule: {
          ...courseModule.cModule,
          index: courseModule.index,
        },
      });
    } else {
      // Create new semester entry
      semesters.push({
        semesterNumber: courseModule.semesterNumber,
        modules: [
          {
            cModule: {
              ...courseModule.cModule,
              index: courseModule.index,
            },
          },
        ],
      });
    }
  });

  // Sort semesters by semester number
  semesters.sort((a, b) => a.semesterNumber - b.semesterNumber);

  // Transform semesters to the requested format
  const transformedSemesters = semesters.map((semester) => {
    const onlyModules = semester.modules.map((module) => {
      return module.cModule;
    });

    return {
      semesterNumber: semester.semesterNumber,
      modules: onlyModules,
    };
  });

  return { semesters: transformedSemesters };
};

const updateModuleIndex = async (courseId: string, reqBody: UpdateModuleIndex) => {
  // Update indices for each module
  for (const module of reqBody) {
    const courseModule = await prisma.courseModule.findUnique({
      where: {
        courseId_cModuleId: {
          courseId: courseId,
          cModuleId: module.moduleId,
        },
      },
    });

    if (courseModule) {
      await prisma.courseModule.update({
        where: {
          id: courseModule.id,
          courseId: courseId,
        },
        data: {
          index: module.index,
        },
      });
    }
  }

  // Get updated course modules
  const updatedCourseModules = await prisma.courseModule.findMany({
    where: {
      courseId: courseId,
    },
    include: {
      cModule: true,
    },
    orderBy: {
      index: "asc",
    },
  });

  const courseModules = updatedCourseModules.map((cm) => ({
    ...cm.cModule,
    index: cm.index,
  }));

  return { courseModules };
};

const updateModuleSemester = async (courseId: string, reqBody: UpdateModuleSemester) => {
  // Find the course module relationship
  const courseModule = await prisma.courseModule.findUnique({
    where: {
      courseId_cModuleId: {
        courseId: courseId,
        cModuleId: reqBody.moduleId,
      },
    },
  });

  if (!courseModule) {
    throw new AppError("Course module not found", "NOT_FOUND", 404);
  }

  // Update the semester number in the CourseModule relationship
  const updatedCourseModule = await prisma.courseModule.update({
    where: {
      id: courseModule.id,
    },
    data: {
      semesterNumber: reqBody.semesterNumber,
    },
  });

  return { updatedCourseModule };
};

const getAvailableModules = async (courseId: string, searchTerm: string | undefined) => {
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const modules = await prisma.cModule.findMany({
    where: {
      courseType: course.courseType,
      awardingBodyId: course.awardingBodyId,
      ...(searchTerm && { title: { contains: searchTerm, mode: "insensitive" } }),
    },
    include: {
      moduleLessons: true,
    },
  });

  const transformedModules = modules.filter((module) => module.moduleLessons.length > 0);

  return { availableModules: transformedModules };
};

const getCourseStudents = async (page: number, courseId: string, pageSize: number) => {
  // Get session course IDs for the course
  const sessionCourseIds = (
    await prisma.sessionCourse.findMany({
      where: {
        courseId: courseId,
      },
    })
  ).map((sc) => sc.id);

  const { limit, offset } = getPagination(page, pageSize);

  const [students, count] = await prisma.$transaction([
    prisma.registeredStudent.findMany({
      where: {
        application: {
          courseSelection: {
            courseId: {
              in: sessionCourseIds,
            },
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        application: {
          include: {
            personalInformation: true,
            courseSelection: {
              include: {
                course: true,
              },
            },
          },
        },
        studentEnrollment: true,
      },
    }),
    prisma.studentEnrollments.count({
      where: {
        application: {
          courseSelection: {
            courseId: courseId,
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

  return { students: students, pagination: paginationData };
};

export const CourseService = {
  getCourses,
  getAvailableModules,
  getAssignedModules,
  getCourseSemesters,
  updateModuleIndex,
  updateModuleSemester,
  assignCourseModule,
  unassignCourseModule,
  getCourseStudents,
};
