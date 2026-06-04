import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { Response } from "express";
import { z } from "zod";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  createAssessmentReqBodySchema,
  updateAssessmentReqBodySchema,
  getAssessmentsReqQuerySchema,
  assessmentIdParamSchema,
  AssessmentStatusSchema,
} from "./types";
import {
  createAssessment as createAssessmentService,
  getAssessments as getAssessmentsService,
  getAssessmentById as getAssessmentByIdService,
  updateAssessment as updateAssessmentService,
  deleteAssessment as deleteAssessmentService,
  updateAssessmentStatus as updateAssessmentStatusService,
  getAssessmentPreview as getAssessmentPreviewService,
  updateAssessmentLateSubmissions as updateAssessmentLateSubmissionsService,
  updateAssessmentAttempts as updateAssessmentAttemptsService,
} from "./assessment-service";

// Create a new assessment
export const createAssessment = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, createAssessmentReqBodySchema);

  const { assessment } = await createAssessmentService(reqBody);

  sendSuccessResponse(res, { assessment });
};

// Get all assessments with optional filtering
export const getAssessments = async (req: RequestWithUser, res: Response) => {
  const reqQuery = zodSafeParse(req.query, getAssessmentsReqQuerySchema);

  const { assessments, pagination } = await getAssessmentsService(
    reqQuery.page,
    reqQuery.pageSize,
    reqQuery.assessmentCode,
    reqQuery.assessmentCategory,
    reqQuery.assessmentType,
    reqQuery.timeLimit,
    reqQuery.totalPointsOrWeight,
    reqQuery.searchTerm,
  );

  sendSuccessResponse(res, { assessments }, undefined, undefined, pagination);
};

// Get an assessment by ID
export const getAssessmentById = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);

  const { assessment } = await getAssessmentByIdService(id);

  sendSuccessResponse(res, { assessment });
};

// Update an assessment by ID
export const updateAssessment = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqBody = zodSafeParse(req.body, updateAssessmentReqBodySchema);

  const { assessment } = await updateAssessmentService(id, reqBody);

  sendSuccessResponse(res, { assessment });
};

// Update only the status of an assessment by ID with validation
export const updateAssessmentStatus = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqBody = zodSafeParse(req.body, z.object({ status: AssessmentStatusSchema }));

  const { assessment } = await updateAssessmentStatusService(id, reqBody.status);

  sendSuccessResponse(res, { assessment });
};

// Delete an assessment by ID
export const deleteAssessment = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);

  const { message } = await deleteAssessmentService(id);

  sendSuccessResponse(res, { message });
};

// Get assessment preview with specific logic for quiz vs assignment
export const getAssessmentPreview = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);

  const result = await getAssessmentPreviewService(id);

  sendSuccessResponse(res, result);
};

// Update only the lateSubmissions field of an assessment by ID
export const updateAssessmentLateSubmissions = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqBody = zodSafeParse(req.body, z.object({ lateSubmissions: z.boolean() }));

  const { assessment } = await updateAssessmentLateSubmissionsService(id, reqBody.lateSubmissions);

  sendSuccessResponse(res, { assessment });
};

// Update only the attempts field of an assessment by ID
export const updateAssessmentAttempts = async (req: RequestWithUser, res: Response) => {
  const { id } = zodSafeParse(req.params, assessmentIdParamSchema);
  const reqBody = zodSafeParse(req.body, z.object({ attempts: z.number().int().min(1) }));

  const { assessment } = await updateAssessmentAttemptsService(id, reqBody.attempts);

  sendSuccessResponse(res, { assessment });
};
