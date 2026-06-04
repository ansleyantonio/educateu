import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  createAssignmentQuestionReqBodySchema,
  updateAssignmentQuestionReqBodySchema,
  updateAssignmentQuestionIndexReqBodySchema,
  getAssignmentQuestionsReqQuerySchema,
} from "./types";
import {
  createAssignmentQuestion as createAssignmentQuestionService,
  updateAssignmentQuestion as updateAssignmentQuestionService,
  updateAssignmentQuestionIndex as updateAssignmentQuestionIndexService,
  getAssignmentQuestions as getAssignmentQuestionsService,
  getAssignmentQuestionById as getAssignmentQuestionByIdService,
  deleteAssignmentQuestion as deleteAssignmentQuestionService,
  getAssessmentsByModuleIdService,
} from "./assignment-service";
import { z } from "zod";
import { AppError } from "../../utils/AppError";

const assessmentIdParamForAssignmentQuestionSchema = z.object({
  assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
});

// Create a new assignment question for an assessment
export const createAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const { assessmentId } = zodSafeParse(req.params, assessmentIdParamForAssignmentQuestionSchema);
  const reqBody = zodSafeParse(req.body, createAssignmentQuestionReqBodySchema);

  const { assignmentQuestion } = await createAssignmentQuestionService(reqBody, assessmentId);

  sendSuccessResponse(res, { assignmentQuestion });
};

// Update an assignment question by ID
export const updateAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);
  const reqBody = zodSafeParse(req.body, updateAssignmentQuestionReqBodySchema);

  const { assignmentQuestion } = await updateAssignmentQuestionService(assignmentQuestionId, reqBody);

  sendSuccessResponse(res, { assignmentQuestion });
};

// Update the index of an assignment question within an assessment
export const updateAssignmentQuestionIndex = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdIndexParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdIndexParamSchema);
  const reqBody = zodSafeParse(req.body, updateAssignmentQuestionIndexReqBodySchema);

  const { assessment } = await updateAssignmentQuestionIndexService(assignmentQuestionId, reqBody.index);

  sendSuccessResponse(res, { assessment });
};

// Get all assignment questions for an assessment with pagination
export const getAssignmentQuestions = async (req: RequestWithUser, res: Response) => {
  const assessmentIdParamSchema = z.object({
    assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
  });

  const { assessmentId } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqQuery = zodSafeParse(req.query, getAssignmentQuestionsReqQuerySchema);

  const { assignmentQuestions, pagination } = await getAssignmentQuestionsService(
    assessmentId,
    reqQuery.page,
    reqQuery.pageSize,
  );

  sendSuccessResponse(res, { assignmentQuestions }, undefined, undefined, pagination);
};

// Get a specific assignment question by ID
export const getAssignmentQuestionById = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);

  const { assignmentQuestion } = await getAssignmentQuestionByIdService(assignmentQuestionId);

  sendSuccessResponse(res, { assignmentQuestion });
};

// Delete an assignment question by ID
export const deleteAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);

  const { message } = await deleteAssignmentQuestionService(assignmentQuestionId);

  sendSuccessResponse(res, { message });
};

// Get all assessments by moduleId
export const getAssessmentsByModuleId = async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    throw new AppError("Student information not found in request", "UNAUTHORIZED", 401);
  }

  const { moduleId, studentId } = zodSafeParse(
    req.params,
    z.object({
      moduleId: z.string().uuid(),
      studentId: z.string().uuid(),
    }),
  );

  const result = await getAssessmentsByModuleIdService(studentId, moduleId);

  sendSuccessResponse(res, result, "Assessments retrieved successfully", 200);
};
