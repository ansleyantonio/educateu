import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import {
  GetStudentCoursesResponse,
  GetStudentCourseByIdResponse,
  GetCourseModulesBySemesterResponse,
  CourseSnapshot,
} from "./types";
import { getAssessmentStatus } from "./utils";
import { computeModuleCompletion, getCompletedContentIds } from "./content-services";

export const getStudentCoursesService = async (
  studentId: string,
  statusFilter?: "INCOMPLETE" | "COMPLETED",
  searchQuery?: string,
): Promise<GetStudentCoursesResponse> => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      studentId: studentId,
      enrollmentStatus: "ACTIVE",
    },
    select: {
      id: true,
      enrollmentStatus: true,
      sessionCourse: {
        select: {
          id: true,
          courseSnapshot: true,
          session: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });

  const courses = await Promise.all(
    studentCourses.map(async (studentCourse) => {
      const { id, sessionCourse } = studentCourse;
      const courseSnapshot = sessionCourse.courseSnapshot as unknown as CourseSnapshot;

      const safeDateToString = (dateValue: string | Date | undefined): string => {
        if (!dateValue) return new Date().toISOString();
        if (typeof dateValue === "string") return new Date(dateValue).toISOString();
        if (dateValue instanceof Date) return dateValue.toISOString();
        return new Date().toISOString();
      };

      let totalLessons = 0;
      let completedLessons = 0;

      const contentIdsByLesson: Map<string, string[]> = new Map();

      if (courseSnapshot.modules && Array.isArray(courseSnapshot.modules)) {
        for (const module of courseSnapshot.modules) {
          const lessonsFromModuleLessons = module.moduleLessons || [];

          for (const item of lessonsFromModuleLessons) {
            if (item.lesson && item.lesson.id) {
              totalLessons++;
              const contentIds = (item.lesson.lessonContents || []).map((lc) => lc.content.id);
              contentIdsByLesson.set(item.lesson.id, contentIds);
            }
          }
        }
      }

      if (contentIdsByLesson.size > 0) {
        const allContentIds = Array.from(contentIdsByLesson.values()).flat();

        const completedContentRecords = await prisma.courseProgress.findMany({
          where: {
            contentId: { in: allContentIds },
            studentCourseId: id,
            status: "COMPLETED",
          },
          select: {
            contentId: true,
          },
        });

        const completedContentIds = new Set(completedContentRecords.map((r) => r.contentId));

        for (const [lessonId, contents] of contentIdsByLesson) {
          if (contents.length > 0 && contents.every((contentId) => completedContentIds.has(contentId))) {
            completedLessons++;
          }
        }
      }

      const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      const courseStatus = totalLessons > 0 && totalLessons === completedLessons ? "COMPLETED" : "INCOMPLETE";

      const totalStudents = await prisma.studentCourse.count({
        where: {
          sessionCourseId: sessionCourse.id,
        },
      });

      const semesterName = sessionCourse.session.name;

      return {
        studentCourseId: id,
        sessionCourseId: sessionCourse.id,
        courseType: courseSnapshot.courseType,
        title: courseSnapshot.title,
        code: courseSnapshot.code,
        status: courseStatus,
        enrollmentStatus: studentCourse.enrollmentStatus,
        courseDescription: undefined,
        studyModes: courseSnapshot.studyModes || [],
        durationLength: courseSnapshot.durationLength || 0,
        totalCredits: courseSnapshot.totalCredits || 0,
        minimumPassingCreditsPerYear: courseSnapshot.minimumPassingCreditsPerYear || 0,
        awardingBodyName: courseSnapshot.awardingBody?.name || null,
        startDate: safeDateToString(sessionCourse.session.startDate),
        endDate: safeDateToString(sessionCourse.session.endDate),
        sessionId: sessionCourse.session.id,
        sessionName: sessionCourse.session.name,
        sessionStartDate: safeDateToString(sessionCourse.session.startDate),
        sessionEndDate: safeDateToString(sessionCourse.session.endDate),
        enrolledAt: safeDateToString(studentCourse.createdAt),
        updatedAt: safeDateToString(studentCourse.updatedAt),
        progressPercentage,
        totalLessons,
        completedLessons,
        totalStudents,
        semesterName,
      };
    }),
  );

  let filteredCourses = statusFilter ? courses.filter((course) => course.status === statusFilter) : courses;

  if (searchQuery) {
    filteredCourses = filteredCourses.filter((course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  return { courses: filteredCourses };
};

export async function getStudentCourseByIdService(studentId: string, studentCourseId: string) {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId: studentId,
    },
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
      sessionCourse: {
        select: {
          id: true,
          courseSnapshot: true,
          session: {
            select: {
              id: true,
              name: true,
              startDate: true,
              endDate: true,
            },
          },
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  const courseSnapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot | null;

  if (!courseSnapshot) {
    throw new AppError("Course snapshot not found", "COURSE_SNAPSHOT_NOT_FOUND", 404);
  }

  let totalLessons = 0;
  let completedLessons = 0;

  const contentIdsByLesson: Map<string, string[]> = new Map();

  if (courseSnapshot.modules && Array.isArray(courseSnapshot.modules)) {
    for (const module of courseSnapshot.modules) {
      const lessonsFromModuleLessons = module.moduleLessons || [];

      for (const item of lessonsFromModuleLessons) {
        if (item.lesson && item.lesson.id) {
          totalLessons++;
          const contentIds = (item.lesson.lessonContents || []).map((lc) => lc.content.id);
          contentIdsByLesson.set(item.lesson.id, contentIds);
        }
      }
    }
  }

  if (contentIdsByLesson.size > 0) {
    const allContentIds = Array.from(contentIdsByLesson.values()).flat();

    const completedContentRecords = await prisma.courseProgress.findMany({
      where: {
        contentId: { in: allContentIds },
        studentCourseId: studentCourse.id,
        status: "COMPLETED",
      },
      select: {
        contentId: true,
      },
    });

    const completedContentIds = new Set(completedContentRecords.map((r) => r.contentId));

    for (const [lessonId, contents] of contentIdsByLesson) {
      if (contents.length > 0 && contents.every((contentId) => completedContentIds.has(contentId))) {
        completedLessons++;
      }
    }
  }

  const courseStatus = totalLessons > 0 && totalLessons === completedLessons ? "COMPLETED" : "INCOMPLETE";

  const totalStudents = await prisma.studentCourse.count({
    where: {
      sessionCourseId: studentCourse.sessionCourse.id,
    },
  });

  const courseData = {
    studentCourseId: studentCourse.id,
    sessionCourseId: studentCourse.sessionCourse.id,
    courseType: courseSnapshot.courseType,
    title: courseSnapshot.title,
    code: courseSnapshot.code,
    status: courseStatus,
    courseDescription: undefined,
    studyModes: courseSnapshot.studyModes || [],
    durationLength: courseSnapshot.durationLength || 0,
    totalCredits: courseSnapshot.totalCredits || 0,
    minimumPassingCreditsPerYear: courseSnapshot.minimumPassingCreditsPerYear || 0,
    awardingBodyName: courseSnapshot.awardingBody?.name || null,
    startDate: studentCourse.sessionCourse.session.startDate.toISOString(),
    endDate: studentCourse.sessionCourse.session.endDate.toISOString(),
    sessionId: studentCourse.sessionCourse.session.id,
    sessionName: studentCourse.sessionCourse.session.name,
    sessionStartDate: studentCourse.sessionCourse.session.startDate.toISOString(),
    sessionEndDate: studentCourse.sessionCourse.session.endDate.toISOString(),
    enrolledAt: studentCourse.createdAt.toISOString(),
    updatedAt: studentCourse.updatedAt.toISOString(),
    totalStudents,
    semesterName: studentCourse.sessionCourse.session.name,
  };

  return { course: courseData } as GetStudentCourseByIdResponse;
}

export async function getCourseModulesBySemesterService(studentId: string, studentCourseId: string) {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId: studentId,
    },
    select: {
      id: true,
      sessionCourse: {
        select: {
          courseSnapshot: true,
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  const courseSnapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot | null;

  if (!courseSnapshot) {
    throw new AppError("Course snapshot not found", "COURSE_SNAPSHOT_NOT_FOUND", 404);
  }

  const modules = courseSnapshot.modules || [];
  const modulesBySemester: Record<number, typeof modules> = {};

  for (const module of modules) {
    const semesterNum = module.semesterNumber || 1;
    if (!modulesBySemester[semesterNum]) {
      modulesBySemester[semesterNum] = [];
    }
    modulesBySemester[semesterNum].push(module);
  }
  // Get the student's email from their studentCourse record to find their applications
  const studentRecord = await prisma.student.findFirst({
    where: {
      studentCourses: {
        some: {
          id: studentCourse.id,
        },
      },
    },
    select: {
      email: true,
    },
  });

  // Get payment records for the student's applications to determine which semesters are paid
  const studentApplications = await prisma.application.findMany({
    where: {
      personalInformation: {
        email: studentRecord?.email || "",
      },
    },
    include: {
      paymentRecords: {
        include: {
          paymentHistories: true,
        },
      },
      courseSelection: {
        include: {
          course: {
            include: {
              courseFees: {
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  // Create a map of semester numbers to payment status (true/false)
  const semesterPaymentStatus: Record<number, boolean> = {};

  for (const semesterNum of Object.keys(modulesBySemester)) {
    semesterPaymentStatus[parseInt(semesterNum)] = false;
  }

  for (const application of studentApplications) {
    for (const paymentRecord of application.paymentRecords) {
      for (const paymentHistory of paymentRecord.paymentHistories) {
        if (paymentHistory.payment_status === true) {
          const courseFee = application.courseSelection?.course?.courseFees?.[0];
          const semesters = courseFee?.courseFeeStructure?.semesters || [];

          for (const semester of semesters) {
            if (Math.abs(paymentHistory.amount - semester.semesterFee) < 0.01) {
              // Using small tolerance for floating point comparison
              semesterPaymentStatus[semester.semesterOrder] = true;
            }
          }

          // If we couldn't match to a specific semester, assume it covers the first unpaid semester
          if (paymentRecord.paymentPlan === "INSTALLMENT") {
            // Find the first unpaid semester and mark it as paid
            for (const semesterNum of Object.keys(semesterPaymentStatus).sort((a, b) => parseInt(a) - parseInt(b))) {
              if (!semesterPaymentStatus[parseInt(semesterNum)]) {
                semesterPaymentStatus[parseInt(semesterNum)] = true;
                break;
              }
            }
          } else if (paymentRecord.paymentPlan === "FULL_PAYMENT") {
            if (paymentRecord.paymentStatus === "PAID") {
              for (const semesterNum of Object.keys(semesterPaymentStatus)) {
                semesterPaymentStatus[parseInt(semesterNum)] = true;
              }
            }
          }
        }
      }
    }
  }

  const completedContentIds = await getCompletedContentIds(studentCourseId);

  const result = {
    paidSemesters: semesterPaymentStatus,
    course: {
      id: studentCourse.sessionCourse.course.id,
      title: studentCourse.sessionCourse.course.title,
      code: studentCourse.sessionCourse.course.code,
    },
    semesters: Object.entries(modulesBySemester)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([semesterNumber, modules]) => {
        const processedModules = modules.map((module) => {
          const moduleCompletion = computeModuleCompletion(module, completedContentIds);
          return {
            id: module.id,
            title: module.title,
            code: "",
            credits: 0,
            semester: module.semesterNumber || 1,
            order: module.index || 0,
            prerequisites: [],
            totalLessons: moduleCompletion.totalLessons,
            completedLessons: moduleCompletion.completedLessons,
            incompleteLessons: moduleCompletion.totalLessons - moduleCompletion.completedLessons,
            completionPercentage:
              moduleCompletion.totalLessons > 0
                ? Math.round((moduleCompletion.completedLessons / moduleCompletion.totalLessons) * 100)
                : 0,
          };
        });

        return {
          semesterNumber: parseInt(semesterNumber),
          moduleCount: modules.length,
          lessonCount: modules.reduce((sum, m) => sum + (m.moduleLessons?.length || 0), 0),
          assessmentCount: modules.reduce((sum, m) => sum + (m.moduleAssessments?.length || 0), 0),
          modules: processedModules,
        };
      }),
  };

  return result as GetCourseModulesBySemesterResponse;
}

// Enhanced service function to get course modules by semester with assessment status and grades
export async function getCourseModulesBySemesterWithAssessmentStatusService(
  studentId: string,
  studentCourseId: string,
) {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId: studentId,
    },
    select: {
      id: true,
      sessionCourse: {
        select: {
          courseSnapshot: true,
          course: {
            select: {
              id: true,
              title: true,
              code: true,
            },
          },
        },
      },
      assessmentResults: {
        select: {
          assessmentId: true,
          score: true,
          maxScore: true,
          percentage: true,
        },
      },
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  const courseSnapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  const modules = courseSnapshot.modules || [];
  const modulesBySemester: Record<number, typeof modules> = {};

  for (const module of modules) {
    const semesterNum = module.semesterNumber || 1;
    if (!modulesBySemester[semesterNum]) {
      modulesBySemester[semesterNum] = [];
    }
    modulesBySemester[semesterNum].push(module);
  }

  const processedSemesters = Object.entries(modulesBySemester)
    .sort(([a], [b]) => parseInt(a) - parseInt(b))
    .map(([semesterNumber, modules]) => {
      const processedModules = modules.map((module) => {
        const moduleAssessments = module.moduleAssessments || [];
        const totalAssessments = moduleAssessments.length;

        const completedAssessments = [];
        let totalScore = 0;
        let maxPossibleScore = 0;
        let hasOverdue = false;

        const now = new Date();

        for (const modAssessment of moduleAssessments) {
          const assessmentResult = studentCourse.assessmentResults.find(
            (result: { assessmentId: string; score: import("@prisma/client/runtime/library").Decimal | null }) =>
              result.assessmentId === modAssessment.assessment.id,
          );

          const status = getAssessmentStatus(
            modAssessment.assessment,
            assessmentResult ? { score: assessmentResult.score ? Number(assessmentResult.score) : null } : null,
            now,
          );
          if (status === "OVERDUE") {
            hasOverdue = true;
          }

          if (assessmentResult) {
            completedAssessments.push(assessmentResult);
            if (assessmentResult.score !== null) {
              totalScore += Number(assessmentResult.score);
            }
            if (assessmentResult.maxScore !== null) {
              maxPossibleScore += Number(assessmentResult.maxScore);
            }
          }
        }

        let moduleStatus = "IN_PROGRESS";

        if (completedAssessments.length === 0) {
          moduleStatus = hasOverdue ? "OVERDUE" : "NOT_STARTED";
        } else if (completedAssessments.length === totalAssessments) {
          const averagePercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
          moduleStatus = averagePercentage >= 40 ? "PASS" : "FAIL";
        } else {
          moduleStatus = hasOverdue ? "OVERDUE" : "IN_PROGRESS";
        }

        let grade = "";
        let averagePercentage = 0;

        if (maxPossibleScore > 0) {
          averagePercentage = (totalScore / maxPossibleScore) * 100;

          if (averagePercentage >= 90) {
            grade = "A+";
          } else if (averagePercentage >= 80) {
            grade = "A";
          } else if (averagePercentage >= 70) {
            grade = "B+";
          } else if (averagePercentage >= 60) {
            grade = "B";
          } else if (averagePercentage >= 50) {
            grade = "C+";
          } else if (averagePercentage >= 40) {
            grade = "C";
          } else {
            grade = "F";
          }
        }

        return {
          id: module.id,
          title: module.title,
          code: "",
          credits: 0,
          semester: module.semesterNumber || 1,
          order: module.index || 0,
          prerequisites: [],
          assessmentStatus: {
            status: moduleStatus,
            completed: completedAssessments.length,
            total: totalAssessments,
            progress: `${completedAssessments.length}/${totalAssessments}`,
            averageScore: Number(totalScore.toFixed(2)),
            maxPossibleScore: Number(maxPossibleScore.toFixed(2)),
            averagePercentage: Number(averagePercentage.toFixed(2)),
            grade: grade,
          },
        };
      });

      return {
        semesterNumber: parseInt(semesterNumber),
        modules: processedModules,
      };
    });

  // Get the student's email from their studentCourse record to find their applications
  const studentRecord = await prisma.student.findFirst({
    where: {
      studentCourses: {
        some: {
          id: studentCourse.id,
        },
      },
    },
    select: {
      email: true,
    },
  });

  // Get payment records for the student's applications to determine which semesters are paid
  const studentApplications = await prisma.application.findMany({
    where: {
      personalInformation: {
        email: studentRecord?.email || "",
      },
    },
    include: {
      paymentRecords: {
        include: {
          paymentHistories: true,
        },
      },
      courseSelection: {
        include: {
          course: {
            include: {
              courseFees: {
                where: { status: "ACTIVE" },
                include: {
                  courseFeeStructure: {
                    include: { semesters: { orderBy: { semesterOrder: "asc" } } },
                  },
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  // Create a map of semester numbers to payment status (true/false)
  const semesterPaymentStatus: Record<number, boolean> = {};

  // Initialize all semesters as unpaid (false)
  for (const semesterNum of Object.keys(modulesBySemester)) {
    semesterPaymentStatus[parseInt(semesterNum)] = false;
  }

  // Check payment histories to determine if each semester is paid
  for (const application of studentApplications) {
    for (const paymentRecord of application.paymentRecords) {
      for (const paymentHistory of paymentRecord.paymentHistories) {
        if (paymentHistory.payment_status === true) {
          // Payment was successful
          // Determine which semester this payment corresponds to
          // This is a simplified approach - in a real system, you might need to
          // map payment amounts to specific semesters based on course fee structure

          // For now, we'll check if the payment amount matches any semester fee
          const courseFee = application.courseSelection?.course?.courseFees?.[0];
          const semesters = courseFee?.courseFeeStructure?.semesters || [];

          for (const semester of semesters) {
            if (Math.abs(paymentHistory.amount - semester.semesterFee) < 0.01) {
              // Using small tolerance for floating point comparison
              semesterPaymentStatus[semester.semesterOrder] = true;
            }
          }

          // If we couldn't match to a specific semester, assume it covers the first unpaid semester
          if (paymentRecord.paymentPlan === "INSTALLMENT") {
            // Find the first unpaid semester and mark it as paid
            for (const semesterNum of Object.keys(semesterPaymentStatus).sort((a, b) => parseInt(a) - parseInt(b))) {
              if (!semesterPaymentStatus[parseInt(semesterNum)]) {
                semesterPaymentStatus[parseInt(semesterNum)] = true;
                break;
              }
            }
          } else if (paymentRecord.paymentPlan === "FULL_PAYMENT") {
            // For full payment, mark all semesters as paid if the total amount is sufficient
            if (paymentRecord.paymentStatus === "PAID") {
              for (const semesterNum of Object.keys(semesterPaymentStatus)) {
                semesterPaymentStatus[parseInt(semesterNum)] = true;
              }
            }
          }
        }
      }
    }
  }

  const result = {
    paidSemesters: semesterPaymentStatus, // Added payment status for each semester
    course: {
      id: studentCourse.sessionCourse.course.id,
      title: studentCourse.sessionCourse.course.title,
      code: studentCourse.sessionCourse.course.code,
    },
    semesters: processedSemesters,
  };

  return result;
}
