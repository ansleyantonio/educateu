import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { 
  createQuizQuestionReqBodySchema,
  assessmentIdParamForQuizQuestionSchema,
  updateQuizQuestionReqBodySchema,
  updateQuizQuestionIndexReqBodySchema,
  getQuizQuestionsReqQuerySchema 
} from "./types";
import { 
  createQuizQuestion as createQuizQuestionService,
  updateQuizQuestion as updateQuizQuestionService,
  updateQuizQuestionIndex as updateQuizQuestionIndexService,
  getQuizQuestions as getQuizQuestionsService,
  getQuizQuestionById as getQuizQuestionByIdService,
  deleteQuizQuestion as deleteQuizQuestionService 
} from "./quiz-service";
import { z } from "zod";

// Create a new quiz question for an assessment
export const createQuizQuestion = async (req: RequestWithUser, res: Response) => {
  const { assessmentId } = zodSafeParse(req.params, assessmentIdParamForQuizQuestionSchema);
  const reqBody = zodSafeParse(req.body, createQuizQuestionReqBodySchema);

  const { quizQuestion } = await createQuizQuestionService(reqBody, assessmentId);

  sendSuccessResponse(res, { quizQuestion });
};

// Update a quiz question by ID
export const updateQuizQuestion = async (req: RequestWithUser, res: Response) => {
  const quizQuestionIdParamSchema = z.object({
    quizQuestionId: z.string().uuid("Quiz question ID must be a valid UUID"),
  });

  const { quizQuestionId } = zodSafeParse(req.params, quizQuestionIdParamSchema);
  const reqBody = zodSafeParse(req.body, updateQuizQuestionReqBodySchema);

  const { quizQuestion } = await updateQuizQuestionService(quizQuestionId, reqBody);

  sendSuccessResponse(res, { quizQuestion });
};

// Update the index of a quiz question within an assessment
export const updateQuizQuestionIndex = async (req: RequestWithUser, res: Response) => {
  const quizQuestionIdIndexParamSchema = z.object({
    quizQuestionId: z.string().uuid("Quiz question ID must be a valid UUID"),
  });

  const { quizQuestionId } = zodSafeParse(req.params, quizQuestionIdIndexParamSchema);
  const reqBody = zodSafeParse(req.body, updateQuizQuestionIndexReqBodySchema);

  const { assessment } = await updateQuizQuestionIndexService(quizQuestionId, reqBody.index);

  sendSuccessResponse(res, { assessment });
};

// Get all quiz questions for an assessment with pagination
export const getQuizQuestions = async (req: RequestWithUser, res: Response) => {
  const assessmentIdParamSchema = z.object({
    assessmentId: z.string().uuid("Assessment ID must be a valid UUID"),
  });

  const { assessmentId } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqQuery = zodSafeParse(req.query, getQuizQuestionsReqQuerySchema);

  const { quizQuestions, pagination } = await getQuizQuestionsService(
    assessmentId,
    reqQuery.page,
    reqQuery.pageSize,
  );

  sendSuccessResponse(res, { quizQuestions }, undefined, undefined, pagination);
};

// Get a specific quiz question by ID
export const getQuizQuestionById = async (req: RequestWithUser, res: Response) => {
  const quizQuestionIdParamSchema = z.object({
    quizQuestionId: z.string().uuid("Quiz question ID must be a valid UUID"),
  });

  const { quizQuestionId } = zodSafeParse(req.params, quizQuestionIdParamSchema);

  const { quizQuestion } = await getQuizQuestionByIdService(quizQuestionId);

  sendSuccessResponse(res, { quizQuestion });
};

// Delete a quiz question by ID
export const deleteQuizQuestion = async (req: RequestWithUser, res: Response) => {
  const quizQuestionIdParamSchema = z.object({
    quizQuestionId: z.string().uuid("Quiz question ID must be a valid UUID"),
  });

  const { quizQuestionId } = zodSafeParse(req.params, quizQuestionIdParamSchema);

  const { message } = await deleteQuizQuestionService(quizQuestionId);

  sendSuccessResponse(res, { message });
};