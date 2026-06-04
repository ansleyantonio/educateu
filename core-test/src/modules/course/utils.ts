import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";

export const validateModuleAssessments = async (moduleId: string) => {
  // Get all assessments for this module with their weights
  const moduleAssessments = await prisma.moduleAssessment.findMany({
    where: {
      cModuleId: moduleId,
    },
    include: {
      assessment: {
        select: {
          id: true,
          weight: true,
        },
      },
    },
  });

  // Check if module has any assessments
  if (moduleAssessments.length === 0) {
    throw new AppError(
      "Module cannot be assigned to course: Module has no assessments",
      "MODULE_HAS_NO_ASSESSMENTS",
      400,
    );
  }

  // Calculate total weight of all assessments and check for null/zero weights
  let totalWeight = 0;
  for (const moduleAssessment of moduleAssessments) {
    const weight = moduleAssessment.assessment.weight;
    if (weight === null || weight === 0) {
      throw new AppError(
        `Module cannot be assigned: Assessment "${moduleAssessment.assessment.id}" has invalid weight (${weight})`,
        "INVALID_ASSESSMENT_WEIGHT",
        400,
      );
    }
    totalWeight += weight;
  }

  // Check if total weight equals 100
  if (totalWeight !== 100) {
    throw new AppError(
      `Module cannot be assigned to course: Total assessment weight must be 100 (current: ${totalWeight})`,
      "INVALID_ASSESSMENT_WEIGHT",
      400,
    );
  }

  return true;
};

export const getCourseTotalCreditsAndModulesTotalCredits = async (courseId: string, moduleCredit: number) => {
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
    },
  });

  if (!course) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  if (course.courseModules.length === 0) {
    return { courseTotalCredits: course.totalCredits, modulesTotalCredits: 0 };
  }

  const courseTotalCredits = course.totalCredits;

  let modulesTotalCredits = moduleCredit;

  for (const module of course.courseModules) {
    modulesTotalCredits += module.cModule.credit as number;
  }

  return { courseTotalCredits, modulesTotalCredits };
};
