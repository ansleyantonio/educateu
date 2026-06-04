import { getFacultiesByCModuleId } from "../helpers/ensure-faculty-cModule-access";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import { getAllAdmissionUsers, sendRealTimeData } from "../utils/notificationService";
import {
  GetUpcomingAssessmentsResponse,
  CourseSnapshot,
  AssessmentSnapshot,
  GetStudentAssessmentsResponse,
  GetCourseGradesResponse,
} from "./types";
import { getFlattenedAssessments, getAssessmentStatus, hasTimeExpired } from "./utils";

// Define type for assessment result from Prisma
type AssessmentResult = {
  id: string;
  studentCourseId: string;
  assessmentId: string;
  moduleId: string;
  score: import("@prisma/client/runtime/library").Decimal | null;
  maxScore: import("@prisma/client/runtime/library").Decimal | null;
  percentage: import("@prisma/client/runtime/library").Decimal | null;
  feedback: string | null;
  answers: unknown;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assessmentTitle: string;
};

// Define type for upcoming assessment items
interface UpcomingAssessmentItem {
  id: string;
  studentCourseId: string;
  sessionCourseId: string;
  moduleId: string;
  moduleTitle: string; // This will be set to '' if undefined from the snapshot
  title: string;
  description?: string; // Must match Zod schema exactly
  dueDate: string | null;
  courseId: string;
  courseTitle: string;
  awardingBodyName: string | null;
  assessmentCategory: string;
  assessmentType: string;
  availableStartDate: string;
  availableEndDate: string;
  timeLimit: number;
  totalPointsOrWeight: number;
  passingScore: number | null;
  attempts: number;
  maxAttempts: number;
  attemptCount: number;
  remainingAttempts: number;
  status: string;
  assessmentStatus: "OVERDUE" | "AVAILABLE" | "LOCKED" | "SUBMITTED" | "GRADED" | "EXPIRED";
  submittedAt?: Date | null;
  score?: number | null;
}

// Service function to get course progress including quiz and assignment completion status
export const getCourseProgressService = async (studentId: string) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: { studentId },
    include: {
      sessionCourse: { include: { course: true } },
      assessmentResults: true,
    },
  });

  const progressData = [];

  for (const studentCourse of studentCourses) {
    const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    const flattened = getFlattenedAssessments(snapshot);

    let totalQuizzes = 0;
    let totalAssignments = 0;
    let completedQuizzes = 0;
    let completedAssignments = 0;

    flattened.forEach(({ assessment }) => {
      const result = studentCourse.assessmentResults.find((r) => r.assessmentId === assessment.id);

      if (assessment.assessmentCategory === "QUIZ") {
        totalQuizzes++;
        if (result) completedQuizzes++;
      } else if (assessment.assessmentCategory === "ASSIGNMENT") {
        totalAssignments++;
        if (result) completedAssignments++;
      }
    });

    const totalAssessments = totalQuizzes + totalAssignments;
    const completedAssessments = completedQuizzes + completedAssignments;
    const overallPercentage = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

    progressData.push({
      studentCourseId: studentCourse.id,
      sessionCourseId: studentCourse.sessionCourse.id,
      courseTitle: studentCourse.sessionCourse.course.title,
      quizProgress: {
        completed: completedQuizzes,
        total: totalQuizzes,
        progress: `${completedQuizzes}/${totalQuizzes}`,
      },
      assignmentProgress: {
        completed: completedAssignments,
        total: totalAssignments,
        progress: `${completedAssignments}/${totalAssignments}`,
      },
      overallProgress: {
        completed: completedAssessments,
        total: totalAssessments,
        percentage: overallPercentage,
      },
    });
  }

  return { progress: progressData };
};

export const getIndividualCourseProgressService = async (studentId: string, studentCourseId: string) => {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    include: {
      sessionCourse: { include: { course: true } },
      assessmentResults: true,
    },
  });

  if (!studentCourse) {
    throw new AppError("Course not found", "NOT_FOUND", 404);
  }

  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
  const flattened = getFlattenedAssessments(snapshot);

  let totalQuizzes = 0;
  let totalAssignments = 0;
  let completedQuizzes = 0;
  let completedAssignments = 0;

  flattened.forEach(({ assessment }) => {
    const result = studentCourse.assessmentResults.find((r) => r.assessmentId === assessment.id);

    if (assessment.assessmentCategory === "QUIZ") {
      totalQuizzes++;
      if (result) completedQuizzes++;
    } else if (assessment.assessmentCategory === "ASSIGNMENT") {
      totalAssignments++;
      if (result) completedAssignments++;
    }
  });

  const totalAssessments = totalQuizzes + totalAssignments;
  const completedAssessments = completedQuizzes + completedAssignments;
  const overallPercentage = totalAssessments > 0 ? Math.round((completedAssessments / totalAssessments) * 100) : 0;

  return {
    studentCourseId: studentCourse.id,
    sessionCourseId: studentCourse.sessionCourse.id,
    courseTitle: studentCourse.sessionCourse.course.title,
    quizProgress: {
      completed: completedQuizzes,
      total: totalQuizzes,
      progress: `${completedQuizzes}/${totalQuizzes}`,
    },
    assignmentProgress: {
      completed: completedAssignments,
      total: totalAssignments,
      progress: `${completedAssignments}/${totalAssignments}`,
    },
    overallProgress: {
      completed: completedAssessments,
      total: totalAssessments,
      percentage: overallPercentage,
    },
  };
};

// Service function to get upcoming assessments for a student
export const getUpcomingAssessmentsService = async (studentId: string): Promise<GetUpcomingAssessmentsResponse> => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      studentId,
      enrollmentStatus: "ACTIVE", // Filter out withdrawn courses
    },
    select: {
      id: true,
      sessionCourse: {
        select: {
          id: true,
          courseSnapshot: true,
        },
      },
    },
  });

  // Get student email to find their applications for payment status
  const studentRecord = await prisma.student.findFirst({
    where: {
      id: studentId,
    },
    select: {
      email: true,
    },
  });

  // Get modules by semester to determine which semesters exist
  const allModules: { moduleId: string; semesterNumber: number }[] = [];
  for (const sc of studentCourses) {
    const snapshot = sc.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    if (snapshot.modules) {
      for (const module of snapshot.modules) {
        allModules.push({
          moduleId: module.id,
          semesterNumber: module.semesterNumber || 1,
        });
      }
    }
  }

  // Get unique semester numbers
  const semesterNumbers = [...new Set(allModules.map((m) => m.semesterNumber))].sort((a, b) => a - b);

  // Initialize all semesters as unpaid
  const semesterPaymentStatus: Record<number, boolean> = {};
  for (const semesterNum of semesterNumbers) {
    semesterPaymentStatus[semesterNum] = false;
  }

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

  for (const application of studentApplications) {
    for (const paymentRecord of application.paymentRecords) {
      for (const paymentHistory of paymentRecord.paymentHistories) {
        if (paymentHistory.payment_status === true) {
          const courseFee = application.courseSelection?.course?.courseFees?.[0];
          const semesters = courseFee?.courseFeeStructure?.semesters || [];

          for (const semester of semesters) {
            if (Math.abs(paymentHistory.amount - semester.semesterFee) < 0.01) {
              semesterPaymentStatus[semester.semesterOrder] = true;
            }
          }

          // If we couldn't match to a specific semester, assume it covers the first unpaid semester
          if (paymentRecord.paymentPlan === "INSTALLMENT") {
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

  const studentResults = await prisma.assessmentResult.findMany({
    where: {
      studentCourseId: { in: studentCourses.map((sc) => sc.id) },
    },
    select: {
      id: true,
      studentCourseId: true,
      assessmentId: true,
      moduleId: true,
      score: true,
      maxScore: true,
      percentage: true,
      feedback: true,
      answers: true,
      submittedAt: true,
      startedAt: true,
      attemptCount: true,
      createdAt: true,
      updatedAt: true,
      assessmentTitle: true,
    },
  });

  const now = new Date();
  const upcomingAssessments: UpcomingAssessmentItem[] = [];

  for (const sc of studentCourses) {
    const snapshot = sc.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    const flattened = getFlattenedAssessments(snapshot);

    flattened.forEach((item) => {
      const {
        assessment,
        moduleId,
        moduleTitle: rawModuleTitle,
        semesterNumber,
      } = item as { assessment: AssessmentSnapshot; moduleId: string; moduleTitle?: string; semesterNumber?: number };

      // Skip assessments from unpaid semesters
      const semesterNum = semesterNumber || 1;
      if (!semesterPaymentStatus[semesterNum]) {
        return;
      }

      const moduleTitle: string = rawModuleTitle ?? "";
      const result = studentResults.find((r) => r.assessmentId === assessment.id && r.moduleId === moduleId);
      const status = getAssessmentStatus(
        assessment,
        result
          ? {
              score: result.score ? Number(result.score) : null,
              startedAt: result.startedAt,
              submittedAt: result.submittedAt,
            }
          : null,
        now,
      );

      // Calculate attempt count - use dedicated column first, fallback to metadata for legacy data
      let attemptCount = 0;
      if (result?.attemptCount) {
        attemptCount = result.attemptCount;
      } else if (result?.answers && Array.isArray(result.answers)) {
        const answersArray = result.answers as Array<Record<string, unknown>>;
        const metadata = answersArray.find((a) => a && a.__metadata);
        attemptCount = metadata && typeof metadata.attemptCount === "number" ? metadata.attemptCount : 0;
      }

      // UPCOMING CRITERIA:
      // 1. Not submitted/graded
      // 2. Either Available or Locked (Coming Soon)
      // 3. Exclude Overdue from "Upcoming" (they move to Overdue section)
      if (status === "AVAILABLE" || status === "LOCKED") {
        upcomingAssessments.push({
          id: assessment.id,
          studentCourseId: sc.id,
          sessionCourseId: sc.sessionCourse.id,
          moduleId,
          moduleTitle,
          title: (assessment as { nameOrTitle?: string }).nameOrTitle ?? "",
          description: assessment.descriptionOrInstructions ?? undefined,
          dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString() : null,
          courseId: snapshot.id,
          courseTitle: (snapshot as { title?: string }).title ?? "",
          awardingBodyName: (snapshot.awardingBody as { name?: string })?.name ?? null,
          assessmentCategory: assessment.assessmentCategory ?? "",
          assessmentType: assessment.assessmentType ?? "",
          availableStartDate: new Date(assessment.availableStartDate).toISOString(),
          availableEndDate: new Date(assessment.availableEndDate).toISOString(),
          timeLimit: assessment.timeLimit ?? 0,
          totalPointsOrWeight: assessment.totalPointsOrWeight ?? 0,
          passingScore: assessment.passingScore ?? null,
          attempts: assessment.attempts ?? 0,
          maxAttempts: assessment.attempts ?? 0,
          attemptCount,
          remainingAttempts: Math.max(0, (assessment.attempts ?? 0) - attemptCount),
          status: assessment.status ?? "",
          assessmentStatus: status,
        });
      }
    });
  }

  // Sort by Due Date (soonest first), then by Start Date
  upcomingAssessments.sort((a, b) => {
    if (a.dueDate && b.dueDate) return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return new Date(a.availableStartDate).getTime() - new Date(b.availableStartDate).getTime();
  });

  return { assessments: upcomingAssessments };
};

// Service function to get all assessments for a student with robust status
export const getAllStudentAssessmentsService = async (
  studentId: string,
  status?: string,
  sessionCourseId?: string,
  page: number = 1,
  pageSize: number = 10,
): Promise<GetStudentAssessmentsResponse> => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: {
      studentId,
      enrollmentStatus: "ACTIVE", // Filter out withdrawn courses
    },
    include: {
      sessionCourse: true,
      assessmentResults: {
        select: {
          id: true,
          studentCourseId: true,
          assessmentId: true,
          moduleId: true,
          score: true,
          maxScore: true,
          percentage: true,
          feedback: true,
          answers: true,
          submittedAt: true,
          startedAt: true,
          attemptCount: true,
          createdAt: true,
          updatedAt: true,
          assessmentTitle: true,
        },
      },
    },
  });

  // Get student email to find their applications for payment status
  const studentRecord = await prisma.student.findFirst({
    where: {
      studentCourses: {
        some: {
          id: { in: studentCourses.map((sc) => sc.id) },
        },
      },
    },
    select: {
      email: true,
    },
  });

  // Get modules by semester to determine which semesters exist
  const allModules: { moduleId: string; semesterNumber: number }[] = [];
  for (const sc of studentCourses) {
    const snapshot = sc.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    if (snapshot.modules) {
      for (const module of snapshot.modules) {
        allModules.push({
          moduleId: module.id,
          semesterNumber: module.semesterNumber || 1,
        });
      }
    }
  }

  // Get unique semester numbers
  const semesterNumbers = [...new Set(allModules.map((m) => m.semesterNumber))].sort((a, b) => a - b);

  // Initialize all semesters as unpaid
  const semesterPaymentStatus: Record<number, boolean> = {};
  for (const semesterNum of semesterNumbers) {
    semesterPaymentStatus[semesterNum] = false;
  }

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

  for (const application of studentApplications) {
    for (const paymentRecord of application.paymentRecords) {
      for (const paymentHistory of paymentRecord.paymentHistories) {
        if (paymentHistory.payment_status === true) {
          const courseFee = application.courseSelection?.course?.courseFees?.[0];
          const semesters = courseFee?.courseFeeStructure?.semesters || [];

          for (const semester of semesters) {
            if (Math.abs(paymentHistory.amount - semester.semesterFee) < 0.01) {
              semesterPaymentStatus[semester.semesterOrder] = true;
            }
          }

          // If we couldn't match to a specific semester, assume it covers the first unpaid semester
          if (paymentRecord.paymentPlan === "INSTALLMENT") {
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

  const now = new Date();
  const allAssessments: UpcomingAssessmentItem[] = [];

  for (const sc of studentCourses) {
    if (sessionCourseId && sc.sessionCourseId !== sessionCourseId) continue;

    const snapshot = sc.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    const flattened = getFlattenedAssessments(snapshot);

    flattened.forEach((item) => {
      const {
        assessment,
        moduleId,
        moduleTitle: rawModuleTitle,
        semesterNumber,
      } = item as { assessment: AssessmentSnapshot; moduleId: string; moduleTitle?: string; semesterNumber?: number };

      // Skip assessments from unpaid semesters
      const semesterNum = semesterNumber || 1;
      if (!semesterPaymentStatus[semesterNum]) {
        return;
      }

      const moduleTitle: string = rawModuleTitle ?? "";
      // Match result by both assessmentId AND moduleId to handle assessments in multiple modules
      const result = sc.assessmentResults.find((r) => r.assessmentId === assessment.id && r.moduleId === moduleId);
      const assessmentStatus = getAssessmentStatus(
        assessment,
        result
          ? {
              score: result.score ? Number(result.score) : null,
              startedAt: result.startedAt,
              submittedAt: result.submittedAt,
            }
          : null,
        now,
      );

      // Calculate attempt count - use dedicated column first, fallback to metadata for legacy data
      let attemptCount = 0;
      if (result?.attemptCount) {
        attemptCount = result.attemptCount;
      } else if (result?.answers && Array.isArray(result.answers)) {
        const answersArray = result.answers as Array<Record<string, unknown>>;
        const metadata = answersArray.find((a) => a && a.__metadata);
        attemptCount = metadata && typeof metadata.attemptCount === "number" ? metadata.attemptCount : 0;
      }

      // Return one assessment per student course per module
      allAssessments.push({
        id: assessment.id,
        studentCourseId: sc.id, // Unique identifier for this course enrollment
        sessionCourseId: sc.sessionCourseId, // Which session/course this is
        moduleId, // Module ID to uniquely identify this assessment instance
        moduleTitle, // Module title for display
        title: (assessment as { nameOrTitle?: string }).nameOrTitle ?? "",
        description: assessment.descriptionOrInstructions ?? undefined,
        dueDate: assessment.dueDate ? new Date(assessment.dueDate).toISOString() : null,
        courseId: snapshot.id,
        courseTitle: (snapshot as { title?: string }).title ?? "",
        awardingBodyName: (snapshot.awardingBody as { name?: string })?.name ?? null,
        assessmentCategory: assessment.assessmentCategory ?? "",
        assessmentType: assessment.assessmentType ?? "",
        availableStartDate: new Date(assessment.availableStartDate).toISOString(),
        availableEndDate: new Date(assessment.availableEndDate).toISOString(),
        timeLimit: assessment.timeLimit ?? 0,
        totalPointsOrWeight: assessment.totalPointsOrWeight ?? 0,
        passingScore: assessment.passingScore ?? null,
        attempts: assessment.attempts ?? 0,
        maxAttempts: assessment.attempts ?? 0,
        attemptCount,
        remainingAttempts: Math.max(0, (assessment.attempts ?? 0) - attemptCount),
        status: assessment.status ?? "",
        assessmentStatus, // The 5-state lifecycle status
        submittedAt: result?.submittedAt ?? null,
        score: result?.score ? Number(result.score) : null,
      });
    });
  }

  let filtered = allAssessments;
  if (status) {
    filtered = allAssessments.filter((a) => a.assessmentStatus === status);
  }

  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    assessments: paginated,
    pagination: { page, pageSize, totalCount, totalPages },
  };
};

// Service function to get questions for a specific assessment
export const getAssessmentQuestionsService = async (
  studentId: string,
  studentCourseId: string,
  assessmentId: string,
  moduleId: string,
  correctness?: string,
) => {
  // Verify the studentCourse belongs to this student and contains the assessment
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    select: { sessionCourse: { select: { courseSnapshot: true } } },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found or not accessible", "ASSESSMENT_NOT_FOUND", 404);
  }

  // Get the assessment from this specific course snapshot
  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
  const found = getFlattenedAssessments(snapshot).find((a) => a.assessment.id === assessmentId);

  if (!found) {
    throw new AppError("Assessment not found in this course", "ASSESSMENT_NOT_FOUND", 404);
  }

  const assessmentDetails = found.assessment;
  const courseId = snapshot.id;

  // Get result for this specific student course, assessment and module
  const result = await prisma.assessmentResult.findUnique({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId, assessmentId, moduleId } },
  });

  const answersMap: Record<string, unknown> = {};
  if (result?.answers && Array.isArray(result.answers)) {
    (result.answers as Array<Record<string, unknown>>).forEach((a) => {
      // Skip metadata element
      if (a && a.__metadata) return;
      if (a && typeof a === "object" && "questionId" in a && a.questionId) {
        answersMap[a.questionId as string] = a.answer;
      }
    });
  }

  const questions = [];

  // Quiz Questions
  if (assessmentDetails.quizQuestions) {
    for (const q of assessmentDetails.quizQuestions) {
      const studentAns = answersMap[q.id];
      const isCorrect =
        result && studentAns !== undefined && q.answer !== undefined ? studentAns === q.answer : undefined;

      questions.push({
        ...q,
        isCorrect,
        options: q.options,
      });
    }
  }

  // Assignment Questions
  if (assessmentDetails.assignmentQuestions) {
    for (const q of assessmentDetails.assignmentQuestions) {
      questions.push({ ...q, isCorrect: undefined });
    }
  }

  let finalQuestions = questions;
  if (correctness && result) {
    finalQuestions = questions.filter((q) => q.isCorrect === (correctness === "CORRECT"));
  }

  // Handle shuffling and sizing
  const size = assessmentDetails.questionSize || finalQuestions.length;
  const shuffled = [...finalQuestions].sort(() => Math.random() - 0.5).slice(0, size);

  return {
    assessment: {
      id: assessmentDetails.id,
      title: assessmentDetails.nameOrTitle,
      description: assessmentDetails.descriptionOrInstructions,
      category: assessmentDetails.assessmentCategory,
      timeLimit: assessmentDetails.timeLimit,
    },
    questions: shuffled,
  };
};

export const submitAssessmentAnswersService = async (
  studentId: string,
  studentCourseId: string,
  assessmentId: string,
  moduleId: string,
  answers: Array<{ questionId: string; answer: unknown }>,
) => {
  // Get faculty assigned module IDs
  const facultyIds = await getFacultiesByCModuleId(moduleId, true);

  // Get all admission users
  const adminIds: string[] = await getAllAdmissionUsers();

  // Get student course
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    include: {
      sessionCourse: true,
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          studentNo: true,
        },
      },
    },
  });

  if (!studentCourse) {
    // Send real time notification to Administrator
    sendRealTimeData({
      userIds: adminIds.filter(Boolean) as string[],
      title: "Student course not found!",
      message: "Student course not found or not accessible",
    });

    throw new AppError("Student course not found or not accessible", "NOT_FOUND", 404);
  }

  // Check that the assessment exists in this course snapshot
  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
  const found = getFlattenedAssessments(snapshot).find((a) => a.assessment.id === assessmentId);

  if (!found) {
    // Send real time notification to Administrator
    sendRealTimeData({
      userIds: adminIds.filter(Boolean) as string[],
      title: "Assessment not found!",
      message: `Assessment not found in this course for ${studentCourse?.student.firstName} ${studentCourse?.student.lastName} (ID: ${studentCourse?.student?.studentNo}).`,
    });

    // Send real time notification to Student
    sendRealTimeData({
      userIds: [studentId].filter(Boolean) as string[],
      title: "Assessment not found!",
      message: `We couldn’t find this assessment in your course. Please refresh or contact support if you believe this is a mistake.`,
    });

    throw new AppError("Assessment not found in this course", "NOT_FOUND", 404);
  }

  const details = found.assessment;
  const targetScId = studentCourse.id;
  const maxAttempts = details.attempts;

  // Fetch existing result
  const existingResult = await prisma.assessmentResult.findUnique({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId: targetScId, assessmentId, moduleId } },
  });

  // Get current attempt count from the dedicated column (with fallback to metadata for legacy data)
  const getAttemptCount = (result: typeof existingResult): number => {
    if (!result) return 0;
    if (result.attemptCount) return result.attemptCount;
    if (result.answers && Array.isArray(result.answers)) {
      const answersArray = result.answers as Array<Record<string, unknown>>;
      const metadata = answersArray.find((a) => a && a.__metadata);
      return metadata && typeof metadata.attemptCount === "number" ? metadata.attemptCount : 0;
    }
    return 0;
  };

  // Check if assessment was started - required before submitting
  if (!existingResult?.startedAt) {
    // Send real time notification to Administrator
    sendRealTimeData({
      userIds: adminIds.filter(Boolean) as string[],
      title: "Assessment Time Limit Exceeded",
      message: `Submission attempt detected: student (ID: ${studentCourse?.student?.studentNo}) tried to submit assessment "${found?.assessment?.nameOrTitle}" (ID: ${assessmentId}) without starting the assessment.`,
    });
    // Send real time notification to Student
    sendRealTimeData({
      userIds: [studentId].filter(Boolean) as string[],
      title: "Assessment Time Limit Exceeded",
      message: `The assessment "${found?.assessment?.nameOrTitle}" has not been started yet. Please start it before attempting to submit your answers.`,
    });

    throw new AppError(
      "Assessment has not been started. Please start the assessment before submitting.",
      "BAD_REQUEST",
      400,
    );
  }

  // Check time limit
  const timeLimitMinutes = details.timeLimit ?? 0;
  if (timeLimitMinutes > 0) {
    const startedAt = existingResult.startedAt;
    const now = new Date();
    const elapsedMinutes = (now.getTime() - startedAt.getTime()) / 60000;

    if (elapsedMinutes > timeLimitMinutes) {
      // Send real time notification for quiz time limit exceeded
      // To Admins
      sendRealTimeData({
        userIds: adminIds.filter(Boolean) as string[],
        title: "Assessment Time Limit Exceeded",
        message: `Time limit exceeded: Assessment "${found.assessment?.nameOrTitle}" (Assessment ID: ${found.assessment?.id}) was stopped automatically. ${studentCourse?.student.firstName} ${studentCourse?.student.lastName} Student ID: ${studentCourse?.student?.studentNo}. Allowed time: ${timeLimitMinutes} minutes.`,
      });

      // To Student
      sendRealTimeData({
        userIds: [studentId].filter(Boolean) as string[],
        title: "Assessment Time Limit Exceeded",
        message: `Your ${found.assessment?.nameOrTitle} assessment has been stopped due to exceeding the time limit of ${timeLimitMinutes} minutes.`,
      });

      // Throw error for API
      throw new AppError(
        `Time limit exceeded. The assessment must be submitted within ${timeLimitMinutes} minutes.`,
        "TIME_LIMIT_EXCEEDED",
        403,
      );
    }
  }

  const currentAttemptCount = getAttemptCount(existingResult);

  // Simple automated scoring for Quizzes
  let score: number | null = null;
  let maxScore: number | null = null;

  if (details.assessmentCategory === "QUIZ" && details.quizQuestions) {
    let earned = 0;
    let total = 0;
    details.quizQuestions.forEach((q) => {
      total += q.point || 0;
      const ans = answers.find((a) => a.questionId === q.id);
      if (ans && isAnswerCorrect(q.type, ans.answer, q.answer)) {
        earned += q.point || 0;
      }
    });
    score = earned;
    maxScore = total;
  }

  // Store answers with metadata (for backward compatibility)
  const answersWithMetadata = [
    { __metadata: true, attemptCount: currentAttemptCount, submittedAt: new Date().toISOString() },
    ...answers,
  ];

  const result = await prisma.assessmentResult.upsert({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId: targetScId, assessmentId, moduleId } },
    create: {
      studentCourseId: targetScId,
      assessmentId,
      moduleId,
      assessmentTitle: details.nameOrTitle,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answers: answersWithMetadata as any,
      score,
      maxScore,
      submittedAt: new Date(),
    },
    update: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      answers: answersWithMetadata as any,
      score,
      maxScore,
      submittedAt: new Date(),
    },
  });

  // Send real time notification to Faculty
  sendRealTimeData({
    userIds: facultyIds.filter(Boolean) as string[],
    title: "Assessment Submitted",
    message: `The assessment "${found.assessment?.nameOrTitle}" has been submitted for ${studentCourse?.student.firstName} ${studentCourse?.student.lastName}`,
  });

  return {
    success: true,
    resultId: result.id,
    attemptCount: currentAttemptCount,
    maxAttempts,
    remainingAttempts: maxAttempts - currentAttemptCount,
  };
};

// Helper function to check if an answer is correct, focusing on fill-in-the-blank normalization
const isAnswerCorrect = (questionType: string, studentAnswer: unknown, correctAnswer: unknown): boolean => {
  if (questionType === "FILL_BLANK" && typeof studentAnswer === "string") {
    // For fill-in-the-blank questions, normalize both answers by trimming whitespace and converting to lowercase for comparison
    const normalizedStudentAnswer = studentAnswer.trim().toLowerCase();

    if (typeof correctAnswer === "string") {
      // Direct string comparison after normalization
      return normalizedStudentAnswer === correctAnswer.trim().toLowerCase();
    } else if (Array.isArray(correctAnswer)) {
      // Check if student's answer matches any of the acceptable answers
      return correctAnswer.some((acceptableAnswer: unknown) => {
        if (typeof acceptableAnswer === "string") {
          return normalizedStudentAnswer === acceptableAnswer.trim().toLowerCase();
        }
        return false;
      });
    }
  }

  // For all other question types, use direct comparison
  return JSON.stringify(studentAnswer) === JSON.stringify(correctAnswer);
};

export const getAssessmentResultsService = async (
  studentId: string,
  studentCourseId: string,
  assessmentId: string,
  moduleId: string,
) => {
  const result = await prisma.assessmentResult.findUnique({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId, assessmentId, moduleId } },
  });

  if (!result) throw new AppError("No submission found", "NOT_FOUND", 404);

  // Filter out metadata from answers before returning
  const filteredResult = {
    ...result,
    answers: Array.isArray(result.answers)
      ? (result.answers as Array<Record<string, unknown>>).filter((a) => !(a && a.__metadata))
      : result.answers,
  };

  return filteredResult;
};

// Service function to start an assessment and record the start time
export const startAssessmentService = async (
  studentId: string,
  studentCourseId: string,
  assessmentId: string,
  moduleId: string,
) => {
  // Verify the studentCourse belongs to this student and contains the assessment
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    include: { sessionCourse: true },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found or not accessible", "NOT_FOUND", 404);
  }

  // Check that the assessment exists in this course snapshot
  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
  const found = getFlattenedAssessments(snapshot).find((a) => a.assessment.id === assessmentId);

  if (!found) {
    throw new AppError("Assessment not found in this course", "NOT_FOUND", 404);
  }

  const details = found.assessment;
  const targetScId = studentCourse.id;
  const timeLimitMinutes = details.timeLimit ?? 0;
  const maxAttempts = details.attempts ?? 0;

  // Check if there's an existing result
  const existingResult = await prisma.assessmentResult.findUnique({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId: targetScId, assessmentId, moduleId } },
  });

  // Get current attempt count from the dedicated column (with fallback to metadata for legacy data)
  const getAttemptCount = (result: typeof existingResult): number => {
    if (!result) return 0;
    if (result.attemptCount) return result.attemptCount;
    // Fallback for legacy data stored in answers JSON
    if (result.answers && Array.isArray(result.answers)) {
      const answersArray = result.answers as Array<Record<string, unknown>>;
      const metadata = answersArray.find((a) => a && a.__metadata);
      return metadata && typeof metadata.attemptCount === "number" ? metadata.attemptCount : 0;
    }
    return 0;
  };

  // Case 1: Already started but not submitted - check if can resume or need new attempt
  if (existingResult?.startedAt && !existingResult.submittedAt) {
    const currentAttemptCount = getAttemptCount(existingResult);

    // Check if time has expired
    if (hasTimeExpired(existingResult.startedAt, timeLimitMinutes)) {
      // Time expired - previous attempt is consumed
      // Check if they have remaining attempts for a new start
      if (currentAttemptCount >= maxAttempts) {
        throw new AppError(`No attempts remaining. You have used all ${maxAttempts} attempts.`, "FORBIDDEN", 403);
      }

      // Deduct new attempt and start fresh
      const newAttemptCount = currentAttemptCount + 1;
      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60000);

      await prisma.assessmentResult.update({
        where: { studentCourseId_assessmentId_moduleId: { studentCourseId: targetScId, assessmentId, moduleId } },
        data: {
          startedAt,
          attemptCount: newAttemptCount,
        },
      });

      return {
        success: true,
        message: "Assessment started (previous attempt expired)",
        startedAt: startedAt.toISOString(),
        timeLimit: timeLimitMinutes,
        expiresAt: expiresAt.toISOString(),
        attemptCount: newAttemptCount,
        maxAttempts,
        remainingAttempts: maxAttempts - newAttemptCount,
        assessmentId,
        studentCourseId,
        moduleId,
      };
    }

    // Time NOT expired - free resume (no new attempt deducted)
    const startedAt = existingResult.startedAt;
    const expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60000);

    return {
      success: true,
      message: "Assessment already started - resuming",
      startedAt: startedAt.toISOString(),
      timeLimit: timeLimitMinutes,
      expiresAt: expiresAt.toISOString(),
      attemptCount: currentAttemptCount,
      maxAttempts,
      remainingAttempts: maxAttempts - currentAttemptCount,
      assessmentId,
      studentCourseId,
      moduleId,
    };
  }

  // Case 2: No existing result OR already submitted - check if can start
  const currentAttemptCount = getAttemptCount(existingResult);

  if (currentAttemptCount >= maxAttempts) {
    throw new AppError(`No attempts remaining. You have used all ${maxAttempts} attempts.`, "FORBIDDEN", 403);
  }

  // Deduct new attempt and start fresh
  const newAttemptCount = currentAttemptCount + 1;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60000);

  await prisma.assessmentResult.upsert({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId: targetScId, assessmentId, moduleId } },
    create: {
      studentCourseId: targetScId,
      assessmentId,
      moduleId,
      assessmentTitle: details.nameOrTitle,
      startedAt,
      attemptCount: newAttemptCount,
    },
    update: {
      startedAt,
      attemptCount: newAttemptCount,
    },
  });

  return {
    success: true,
    message: "Assessment started successfully",
    startedAt: startedAt.toISOString(),
    timeLimit: timeLimitMinutes,
    expiresAt: expiresAt.toISOString(),
    attemptCount: newAttemptCount,
    maxAttempts,
    remainingAttempts: maxAttempts - newAttemptCount,
    assessmentId,
    studentCourseId,
    moduleId,
  };
};

// Service function to get remaining time for an assessment
export const getTimeRemainingService = async (
  studentId: string,
  studentCourseId: string,
  assessmentId: string,
  moduleId: string,
) => {
  // Verify the studentCourse belongs to this student and contains the assessment
  const studentCourse = await prisma.studentCourse.findFirst({
    where: {
      id: studentCourseId,
      studentId,
    },
    include: { sessionCourse: true },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found or not accessible", "NOT_FOUND", 404);
  }

  // Check that the assessment exists in this course snapshot
  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
  const found = getFlattenedAssessments(snapshot).find((a) => a.assessment.id === assessmentId);

  if (!found) {
    throw new AppError("Assessment not found in this course", "NOT_FOUND", 404);
  }

  const details = found.assessment;
  const timeLimitMinutes = details.timeLimit ?? 0;
  const maxAttempts = details.attempts;

  // Fetch existing result
  const existingResult = await prisma.assessmentResult.findUnique({
    where: { studentCourseId_assessmentId_moduleId: { studentCourseId, assessmentId, moduleId } },
  });

  // Get attempt count from metadata
  let attemptCount = 0;
  if (existingResult?.answers && Array.isArray(existingResult.answers)) {
    const answersArray = existingResult.answers as Array<Record<string, unknown>>;
    const metadata = answersArray.find((a) => a && a.__metadata);
    attemptCount = metadata && typeof metadata.attemptCount === "number" ? metadata.attemptCount : 0;
  }

  const isStarted = !!existingResult?.startedAt;
  const startedAt = existingResult?.startedAt ?? null;

  let expiresAt: Date | null = null;
  let minutesRemaining = 0;
  let secondsRemaining = 0;
  let isExpired = false;

  if (isStarted && startedAt && timeLimitMinutes > 0) {
    expiresAt = new Date(startedAt.getTime() + timeLimitMinutes * 60000);
    const now = new Date();
    const remainingMs = expiresAt.getTime() - now.getTime();

    if (remainingMs <= 0) {
      isExpired = true;
      minutesRemaining = 0;
      secondsRemaining = 0;
    } else {
      minutesRemaining = Math.floor(remainingMs / 60000);
      secondsRemaining = Math.floor(remainingMs / 1000);
    }
  }

  return {
    success: true,
    assessmentId,
    studentCourseId,
    moduleId,
    startedAt: startedAt?.toISOString() ?? null,
    timeLimit: timeLimitMinutes,
    expiresAt: expiresAt?.toISOString() ?? null,
    minutesRemaining,
    secondsRemaining,
    isExpired,
    isStarted,
    attemptCount,
    maxAttempts,
  };
};

export const getAllGradesService = async (studentId: string) => {
  const studentCourses = await prisma.studentCourse.findMany({
    where: { studentId },
    include: {
      sessionCourse: { include: { course: true } },
      assessmentResults: true,
    },
  });

  return studentCourses.map((sc) => {
    const snapshot = sc.sessionCourse.courseSnapshot as unknown as CourseSnapshot;
    const modules = snapshot.modules.map((m) => {
      const moduleAssessments = m.moduleAssessments.map((ma) => {
        const res = sc.assessmentResults.find((r) => r.assessmentId === ma.assessment.id);
        return {
          id: ma.assessment.id,
          title: ma.assessment.nameOrTitle,
          score: res?.score ? Number(res.score) : null,
          maxScore: res?.maxScore ? Number(res.maxScore) : null,
        };
      });

      const earned = moduleAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
      const total = moduleAssessments.reduce((sum, a) => sum + (a.maxScore || 0), 0);

      return {
        moduleId: m.id,
        moduleName: m.title,
        earned,
        total,
        percentage: total > 0 ? (earned / total) * 100 : 0,
      };
    });

    return {
      courseId: sc.sessionCourse.course.id,
      courseTitle: sc.sessionCourse.course.title,
      modules,
    };
  });
};

export const getCourseGradesService = async (
  studentId: string,
  studentCourseId: string,
): Promise<GetCourseGradesResponse> => {
  const studentCourse = await prisma.studentCourse.findFirst({
    where: { id: studentCourseId, studentId },
    include: {
      sessionCourse: { include: { course: true } },
      assessmentResults: true,
    },
  });

  if (!studentCourse) {
    throw new AppError("Student course not found", "STUDENT_COURSE_NOT_FOUND", 404);
  }

  const snapshot = studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  const moduleGradeData = snapshot.modules.map((m) => {
    const moduleAssessments = m.moduleAssessments.map((ma) => {
      const res = studentCourse.assessmentResults.find((r) => r.assessmentId === ma.assessment.id);
      return {
        id: ma.assessment.id,
        title: ma.assessment.nameOrTitle,
        score: res?.score ? Number(res.score) : null,
        maxScore: res?.maxScore ? Number(res.maxScore) : null,
      };
    });

    const earned = moduleAssessments.reduce((sum, a) => sum + (a.score || 0), 0);
    const total = moduleAssessments.reduce((sum, a) => sum + (a.maxScore || 0), 0);

    return {
      semesterNumber: m.semesterNumber || 1,
      moduleId: m.id,
      moduleName: m.title,
      earned,
      total,
      percentage: total > 0 ? (earned / total) * 100 : 0,
    };
  });

  const modulesBySemesterMap = new Map<
    number,
    Array<{ moduleId: string; moduleName: string; earned: number; total: number; percentage: number }>
  >();

  for (const m of moduleGradeData) {
    const semesterNumber = m.semesterNumber;
    if (!modulesBySemesterMap.has(semesterNumber)) {
      modulesBySemesterMap.set(semesterNumber, []);
    }
    modulesBySemesterMap.get(semesterNumber)!.push({
      moduleId: m.moduleId,
      moduleName: m.moduleName,
      earned: m.earned,
      total: m.total,
      percentage: m.percentage,
    });
  }

  const semesters = Array.from(modulesBySemesterMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([semesterNumber, modules]) => ({
      semesterNumber,
      modules,
    }));

  return {
    courseId: studentCourse.sessionCourse.course.id,
    courseTitle: studentCourse.sessionCourse.course.title || "Untitled Course",
    semesters,
  };
};
