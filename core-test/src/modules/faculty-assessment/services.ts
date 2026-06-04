import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/paginationUtils";

interface AssignmentQuestion {
  id: string;
  questionText: string;
  point: number;
  submissionType: {
    type: string;
    maxLength?: number;
    maxFileSize?: number;
    acceptedTypes?: string[];
  };
  rubricName: string;
  rubricDescription: string;
  rubricCriteria: Array<{
    id: string;
    criteria: string;
    points: number;
    description: string;
  }>;
}

interface AssessmentSnapshot {
  id: string;
  nameOrTitle: string;
  descriptionOrInstructions: string;
  assessmentCategory: string;
  timeLimit: number;
  totalPointsOrWeight: number;
  assignmentQuestions: AssignmentQuestion[];
  quizQuestions: unknown[];
}

interface ModuleAssessment {
  assessment: AssessmentSnapshot;
}

interface ModuleSnapshot {
  id: string;
  title: string;
  moduleAssessments: ModuleAssessment[];
}

interface CourseSnapshot {
  title: string;
  modules: ModuleSnapshot[];
}

const getAssignments = async (page: number, pageSize: number, facultyUserId: string) => {
  const { offset, limit } = getPagination(page, pageSize);

  // Get all submitted assessments
  const allResults = await prisma.assessmentResult.findMany({
    where: {
      submittedAt: { not: null },
    },
    select: {
      assessmentId: true,
      assessmentTitle: true,
      studentCourse: {
        include: {
          sessionCourse: {
            select: {
              courseSnapshot: true,
              course: {
                select: { id: true, title: true },
              },
              session: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
    },
  });

  // Build a map of unique assessments with their course info
  const assessmentCourseMap = new Map<
    string,
    {
      assessmentId: string;
      assessmentTitle: string;
      courseId: string;
      courseTitle: string;
      sessionId: string;
      sessionName: string;
      courseSnapshot: any;
    }
  >();

  for (const result of allResults) {
    if (!assessmentCourseMap.has(result.assessmentId)) {
      assessmentCourseMap.set(result.assessmentId, {
        assessmentId: result.assessmentId,
        assessmentTitle: result.assessmentTitle,
        courseId: result.studentCourse.sessionCourse.course.id,
        courseTitle: result.studentCourse.sessionCourse.course.title || "",
        sessionId: result.studentCourse.sessionCourse.session.id,
        sessionName: result.studentCourse.sessionCourse.session.name,
        courseSnapshot: result.studentCourse.sessionCourse.courseSnapshot,
      });
    }
  }

  // Filter assessments where faculty has access via courseModules[].cModule.faculty
  const facultyAssessmentIds = new Set<string>();

  for (const [assessmentId, assessmentData] of assessmentCourseMap) {
    const snapshot = assessmentData.courseSnapshot as any;
    if (!snapshot?.courseModules) continue;

    for (const courseModule of snapshot.courseModules) {
      const cModule = courseModule.cModule;
      if (!cModule?.faculty || !Array.isArray(cModule.faculty)) continue;

      // Check if faculty userId exists in the module's faculty list
      const hasAccess = cModule.faculty.some((f: { userId: string }) => f.userId === facultyUserId);

      if (hasAccess) {
        facultyAssessmentIds.add(assessmentId);
        break;
      }
    }
  }

  // Get submissions count for each assessment
  const submissions = await prisma.assessmentResult.findMany({
    where: {
      submittedAt: { not: null },
    },
    select: {
      assessmentId: true,
      score: true,
    },
  });

  const submissionCounts = new Map<string, { total: number; graded: number; ungraded: number }>();

  for (const sub of submissions) {
    if (!facultyAssessmentIds.has(sub.assessmentId)) continue;

    const counts = submissionCounts.get(sub.assessmentId) || { total: 0, graded: 0, ungraded: 0 };
    counts.total++;
    if (sub.score !== null && sub.score !== undefined) {
      counts.graded++;
    } else {
      counts.ungraded++;
    }
    submissionCounts.set(sub.assessmentId, counts);
  }

  // Build final assignment list
  const assignments: Array<{
    assessmentId: string;
    assessmentTitle: string;
    courseId: string;
    courseTitle: string;
    sessionId: string;
    sessionName: string;
    totalSubmissions: number;
    gradedCount: number;
    ungradedCount: number;
  }> = [];

  for (const [assessmentId, assessmentData] of assessmentCourseMap) {
    if (!facultyAssessmentIds.has(assessmentId)) continue;

    const counts = submissionCounts.get(assessmentId) || { total: 0, graded: 0, ungraded: 0 };

    assignments.push({
      assessmentId: assessmentData.assessmentId,
      assessmentTitle: assessmentData.assessmentTitle,
      courseId: assessmentData.courseId,
      courseTitle: assessmentData.courseTitle,
      sessionId: assessmentData.sessionId,
      sessionName: assessmentData.sessionName,
      totalSubmissions: counts.total,
      gradedCount: counts.graded,
      ungradedCount: counts.ungraded,
    });
  }

  // Apply pagination
  const paginatedAssignments = assignments.slice(offset, offset + limit);

  return {
    assignments: paginatedAssignments,
    pagination: {
      count: paginatedAssignments.length,
      total: assignments.length,
      page,
      perPage: pageSize,
      totalPages: Math.ceil(assignments.length / pageSize),
    },
  };
};

const getAssignmentSubmissions = async (assessmentId: string) => {
  const submissions = await prisma.assessmentResult.findMany({
    where: {
      assessmentId,
      submittedAt: { not: null },
    },
    include: {
      studentCourse: {
        include: {
          student: true,
          sessionCourse: {
            include: {
              course: true,
              session: true,
            },
          },
        },
      },
    },
    orderBy: {
      submittedAt: "desc",
    },
  });

  const formattedSubmissions = submissions.map((sub) => {
    let gradedQuestions = 0;
    const answers = sub.answers as Array<{
      questionId: string;
      rubricGrades?: any[];
      totalScore?: number;
      feedback?: string;
    }> | null;
    if (answers && Array.isArray(answers)) {
      gradedQuestions = answers.filter((a) => a.totalScore !== undefined && a.totalScore !== null).length;
    }

    const isGraded = sub.score !== null && sub.score !== undefined;

    return {
      resultId: sub.id,
      student: {
        id: sub.studentCourse.student.id,
        firstName: sub.studentCourse.student.firstName,
        lastName: sub.studentCourse.student.lastName,
        email: sub.studentCourse.student.email,
      },
      course: {
        id: sub.studentCourse.sessionCourse.course.id,
        title: sub.studentCourse.sessionCourse.course.title,
      },
      session: {
        id: sub.studentCourse.sessionCourse.session.id,
        name: sub.studentCourse.sessionCourse.session.name,
      },
      submittedAt: sub.submittedAt,
      score: sub.score,
      maxScore: sub.maxScore,
      isGraded,
      gradedQuestions,
    };
  });

  return {
    assessmentId,
    submissions: formattedSubmissions,
    totalSubmissions: submissions.length,
  };
};

const getSubmissionQuestions = async (assessmentId: string, resultId: string) => {
  const submission = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      studentCourse: {
        include: {
          sessionCourse: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", "NOT_FOUND", 404);
  }

  if (submission.assessmentId !== assessmentId) {
    throw new AppError("Assessment ID mismatch", "BAD_REQUEST", 400);
  }

  const snapshot = submission.studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  let assessmentQuestions: AssignmentQuestion[] = [];
  let assessmentTitle = submission.assessmentTitle;

  if (snapshot?.modules) {
    for (const mod of snapshot.modules) {
      if (mod.moduleAssessments) {
        for (const ma of mod.moduleAssessments) {
          if (ma.assessment?.id === assessmentId) {
            assessmentQuestions = ma.assessment.assignmentQuestions || [];
            assessmentTitle = ma.assessment.nameOrTitle || submission.assessmentTitle;
            break;
          }
        }
      }
    }
  }

  const studentAnswers =
    (submission.answers as Array<{
      questionId: string;
      answer: unknown;
      rubricGrades?: any[];
      totalScore?: number;
      feedback?: string;
    }>) || [];

  const questionsWithAnswers = assessmentQuestions.map((q) => {
    const studentAnswer = studentAnswers.find((a) => a.questionId === q.id);
    return {
      id: q.id,
      questionText: q.questionText,
      point: q.point,
      submissionType: q.submissionType,
      rubricName: q.rubricName,
      rubricDescription: q.rubricDescription,
      isGraded: studentAnswer?.totalScore !== undefined && studentAnswer?.totalScore !== null,
    };
  });

  return {
    resultId: submission.id,
    assessmentId: submission.assessmentId,
    assessmentTitle,
    questions: questionsWithAnswers,
  };
};

const getQuestionDetails = async (assessmentId: string, resultId: string, questionId: string) => {
  const submission = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      studentCourse: {
        include: {
          sessionCourse: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", "NOT_FOUND", 404);
  }

  if (submission.assessmentId !== assessmentId) {
    throw new AppError("Assessment ID mismatch", "BAD_REQUEST", 400);
  }

  const snapshot = submission.studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  let question: AssignmentQuestion | undefined;
  let assessmentTitle = submission.assessmentTitle;

  if (snapshot?.modules) {
    for (const mod of snapshot.modules) {
      if (mod.moduleAssessments) {
        for (const ma of mod.moduleAssessments) {
          if (ma.assessment?.id === assessmentId) {
            question = ma.assessment.assignmentQuestions?.find((q) => q.id === questionId);
            assessmentTitle = ma.assessment.nameOrTitle || submission.assessmentTitle;
            break;
          }
        }
      }
    }
  }

  if (!question) {
    throw new AppError("Question not found", "NOT_FOUND", 404);
  }

  const studentAnswers =
    (submission.answers as Array<{
      questionId: string;
      answer: unknown;
      rubricGrades?: any[];
      totalScore?: number;
      feedback?: string;
    }>) || [];
  const studentAnswer = studentAnswers.find((a) => a.questionId === questionId);

  return {
    resultId: submission.id,
    assessmentId: submission.assessmentId,
    question: {
      id: question.id,
      questionText: question.questionText,
      point: question.point,
      submissionType: question.submissionType,
      rubricName: question.rubricName,
      rubricDescription: question.rubricDescription,
      rubricCriteria: question.rubricCriteria || [],
      studentAnswer: studentAnswer?.answer || null,
      rubricGrades: studentAnswer?.rubricGrades || null,
      totalScore: studentAnswer?.totalScore || null,
      feedback: studentAnswer?.feedback || null,
    },
  };
};

const gradeQuestion = async (
  assessmentId: string,
  resultId: string,
  questionId: string,
  rubricGrades: Array<{ criteriaId: string; score: number; feedback?: string }>,
  feedback?: string,
) => {
  const submission = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      studentCourse: {
        include: {
          sessionCourse: true,
        },
      },
    },
  });

  if (!submission) {
    throw new AppError("Submission not found", "NOT_FOUND", 404);
  }

  if (submission.assessmentId !== assessmentId) {
    throw new AppError("Assessment ID mismatch", "BAD_REQUEST", 400);
  }

  const snapshot = submission.studentCourse.sessionCourse.courseSnapshot as unknown as CourseSnapshot;

  let maxPoints = 0;
  let questionPoint = 0;
  let questionRubricCriteria: Array<{ id: string; points: number }> = [];

  if (snapshot?.modules) {
    for (const mod of snapshot.modules) {
      if (mod.moduleAssessments) {
        for (const ma of mod.moduleAssessments) {
          if (ma.assessment?.id === assessmentId) {
            const questions = ma.assessment.assignmentQuestions || [];
            maxPoints = questions.reduce((sum, q) => sum + (q.point || 0), 0);
            const question = questions.find((q) => q.id === questionId);
            questionPoint = question?.point || 0;
            questionRubricCriteria = (question?.rubricCriteria || []).map((rc: any) => ({
              id: rc.id,
              points: rc.points || rc.weight || 0,
            }));
            break;
          }
        }
      }
    }
  }

  const totalRubricScore = rubricGrades.reduce((sum, rg) => sum + rg.score, 0);

  if (totalRubricScore < 0 || totalRubricScore > questionPoint) {
    throw new AppError(
      `Total rubric score (${totalRubricScore}) must be between 0 and ${questionPoint}`,
      "BAD_REQUEST",
      400,
    );
  }

  for (const rg of rubricGrades) {
    const criteria = questionRubricCriteria.find((c) => c.id === rg.criteriaId);
    if (!criteria) {
      throw new AppError(`Rubric criteria ${rg.criteriaId} not found for this question`, "NOT_FOUND", 404);
    }
    if (rg.score < 0 || rg.score > criteria.points) {
      throw new AppError(`Score for criteria must be between 0 and ${criteria.points}`, "BAD_REQUEST", 400);
    }
  }

  const existingAnswers =
    (submission.answers as Array<{
      questionId: string;
      answer?: unknown;
      rubricGrades?: any[];
      totalScore?: number;
      feedback?: string;
    }>) || [];

  let updatedAnswers = existingAnswers.map((a) => {
    if (a.questionId === questionId) {
      return {
        ...a,
        rubricGrades,
        totalScore: totalRubricScore,
        feedback: feedback || null,
      };
    }
    return a;
  });

  // If question doesn't exist in answers, add it
  if (!updatedAnswers.some((a) => a.questionId === questionId)) {
    updatedAnswers = [
      ...updatedAnswers,
      {
        questionId,
        rubricGrades,
        totalScore: totalRubricScore,
        feedback: feedback || null,
      },
    ];
  }

  const hasGrade = (a: { questionId: string; totalScore?: number | null }): boolean => {
    return a.totalScore !== undefined && a.totalScore !== null;
  };

  const gradedAnswers = updatedAnswers.filter(
    (a) => a.questionId !== "__metadata" && hasGrade(a as { questionId: string; totalScore?: number | null }),
  );
  const totalScore = gradedAnswers.reduce((sum, a) => sum + (a.totalScore || 0), 0);

  const isFullyGraded =
    gradedAnswers.length === (await getSubmissionQuestions(assessmentId, resultId)).questions.length;

  await prisma.assessmentResult.update({
    where: { id: resultId },
    data: {
      answers: updatedAnswers as any,
      score: totalScore,
      maxScore: maxPoints,
      percentage: maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0,
    },
  });

  return {
    resultId: submission.id,
    questionId,
    rubricGrades,
    totalScore,
    maxScore: maxPoints,
    percentage: maxPoints > 0 ? (totalScore / maxPoints) * 100 : 0,
    isFullyGraded,
  };
};

export const FacultyAssessmentService = {
  getAssignments,
  getAssignmentSubmissions,
  getSubmissionQuestions,
  getQuestionDetails,
  gradeQuestion,
};
