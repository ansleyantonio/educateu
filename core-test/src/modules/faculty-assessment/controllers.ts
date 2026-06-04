import { Request, Response } from "express";
import { FacultyAssessmentService } from "./services";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { zodSafeParse } from "../../utils/zodUtils";
import { z } from "zod";
import prisma from "../../prismaClient";
import { sendRealTimeData } from "../../utils/notificationService";

const rubricGradeSchema = z.object({
  criteriaId: z.string().uuid(),
  score: z.number(),
  feedback: z.string().optional(),
});

const gradeQuestionSchema = z.object({
  rubricGrades: z.array(rubricGradeSchema).min(1),
  feedback: z.string().optional(),
});

export const getAssignments = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  const userId = req.headers["user-id"] as string;

  if (!userId) {
    throw new Error("User ID is required in headers");
  }

  const result = await FacultyAssessmentService.getAssignments(page, pageSize, userId);

  return sendSuccessResponse(res, result, "Assignments fetched successfully");
};

export const getAssignmentSubmissions = async (req: Request, res: Response) => {
  const { assessmentId } = req.params;

  if (!assessmentId) {
    throw new Error("Assessment ID is required");
  }

  const result = await FacultyAssessmentService.getAssignmentSubmissions(assessmentId);

  return sendSuccessResponse(res, result, "Submissions fetched successfully");
};

export const getSubmissionQuestions = async (req: Request, res: Response) => {
  const { assessmentId, resultId } = req.params;

  if (!assessmentId || !resultId) {
    throw new Error("Assessment ID and Result ID are required");
  }

  const result = await FacultyAssessmentService.getSubmissionQuestions(assessmentId, resultId);

  return sendSuccessResponse(res, result, "Questions fetched successfully");
};

export const getQuestionDetails = async (req: Request, res: Response) => {
  const { assessmentId, resultId, questionId } = req.params;

  if (!assessmentId || !resultId || !questionId) {
    throw new Error("Assessment ID, Result ID, and Question ID are required");
  }

  const result = await FacultyAssessmentService.getQuestionDetails(assessmentId, resultId, questionId);

  return sendSuccessResponse(res, result, "Question details fetched successfully");
};

export const gradeQuestion = async (req: Request, res: Response) => {
  const { assessmentId, resultId, questionId } = req.params;
  const { rubricGrades, feedback } = zodSafeParse(req.body, gradeQuestionSchema);

  if (!assessmentId || !resultId || !questionId) {
    throw new Error("Assessment ID, Result ID, and Question ID are required");
  }

  const result = await FacultyAssessmentService.gradeQuestion(
    assessmentId,
    resultId,
    questionId,
    rubricGrades,
    feedback,
  );
  const getStudentId = await prisma.assessmentResult.findUnique({
    where: { id: resultId },
    include: {
      studentCourse: {
        select: {
          studentId: true,
        },
      },
    },
  });
  sendRealTimeData({
    userIds: [getStudentId?.studentCourse?.studentId || ""] as string[],
    title: "Graded question",
    message: `You have been graded on a question in an assessment for a course`,
  });

  return sendSuccessResponse(res, result, "Question graded successfully");
};
