import { RequestWithUser } from "../../types";
import { sendSuccessResponse } from "../../utils/responseUtils";
import { Response } from "express";
import { zodSafeParse } from "../../utils/zodUtils";
import { 
  createRubricCriteriaReqBodySchema,
  updateRubricCriteriaReqBodySchema,
  updateRubricCriteriaIndexReqBodySchema,
  createRubricTemplateFromAssignmentQuestionReqBodySchema 
} from "./types";
import { z } from "zod";
import { 
  connectRubricCriteriaToAssignmentQuestion as connectRubricCriteriaToAssignmentQuestionService,
  getRubricCriteriaForAssignmentQuestion as getRubricCriteriaForAssignmentQuestionService,
  updateRubricCriteria as updateRubricCriteriaService,
  updateRubricCriteriaIndex as updateRubricCriteriaIndexService,
  deleteRubricCriteria as deleteRubricCriteriaService,
  createRubricTemplateFromAssignmentQuestion as createRubricTemplateFromAssignmentQuestionService 
} from "./rubric-service";

// Connect rubric criteria to an assignment question
export const connectRubricCriteriaToAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);
  const requestBody = zodSafeParse(req.body, createRubricCriteriaReqBodySchema);

  const processedRubricCriteria = await connectRubricCriteriaToAssignmentQuestionService(
    assignmentQuestionId,
    requestBody.rubricCriteriaConnections,
    requestBody.rubricName,
    requestBody.rubricDescription,
  );

  sendSuccessResponse(
    res,
    { rubricCriteria: processedRubricCriteria },
    "Rubric criteria connected to assignment question successfully",
  );
};

// Controller function to get all rubric criteria for an assignment question
//
// req - Express request object with assignmentQuestionId in params
// res - Express response object
export const getRubricCriteriaForAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);

  const {
    assignmentQuestionId: returnedAssignmentQuestionId,
    rubricName,
    rubricDescription,
    rubricCriteria,
  } = await getRubricCriteriaForAssignmentQuestionService(assignmentQuestionId);

  const mappedRubricCriteria = rubricCriteria.map((criteria) => ({
    id: criteria.id,
    name: criteria.name,
    description: criteria.description,
    weight: criteria.weight,
    levels: Array.isArray(criteria.levels) ? criteria.levels : [],
    createdAt: criteria.createdAt.toISOString(),
    updatedAt: criteria.updatedAt.toISOString(),
    assignmentQuestionId: criteria.assignmentQuestionId,
  }));

  sendSuccessResponse(res, { rubricCriteria: mappedRubricCriteria }, "Rubric criteria retrieved successfully");
};

// Controller function to update a rubric criteria by its ID
// Only non-relational fields can be updated (name, description, weight, levelName, levelDescription)
//
// req - Express request object with rubricCriteriaId in params and update data in body
// res - Express response object
export const updateRubricCriteria = async (req: RequestWithUser, res: Response) => {
  const singleRubricCriteriaIdParamSchema = z.object({
    id: z.string().uuid("Rubric criteria ID must be a valid UUID"),
  });

  const { id: rubricCriteriaId } = zodSafeParse(req.params, singleRubricCriteriaIdParamSchema);

  const updateData = zodSafeParse(req.body, updateRubricCriteriaReqBodySchema);

  const updatedRubricCriteria = await updateRubricCriteriaService(rubricCriteriaId, updateData);

  const mappedRubricCriteria = {
    id: updatedRubricCriteria.id,
    name: updatedRubricCriteria.name,
    description: updatedRubricCriteria.description,
    weight: updatedRubricCriteria.weight,
    levels: updatedRubricCriteria.levels,
    createdAt: updatedRubricCriteria.createdAt.toISOString(),
    updatedAt: updatedRubricCriteria.updatedAt.toISOString(),
    assignmentQuestionId: updatedRubricCriteria.assignmentQuestionId,
  };

  sendSuccessResponse(res, { rubricCriteria: mappedRubricCriteria }, "Rubric criteria updated successfully");
};

// Controller function to update the index of a rubric criteria within an assignment question
//
// req - Express request object with rubricCriteriaId in params and new index in body
// res - Express response object
export const updateRubricCriteriaIndex = async (req: RequestWithUser, res: Response) => {
  const singleRubricCriteriaIdParamSchema = z.object({
    id: z.string().uuid("Rubric criteria ID must be a valid UUID"),
  });

  const { id: rubricCriteriaId } = zodSafeParse(req.params, singleRubricCriteriaIdParamSchema);

  const reqBody = zodSafeParse(req.body, updateRubricCriteriaIndexReqBodySchema);

  const { assignmentQuestion } = await updateRubricCriteriaIndexService(rubricCriteriaId, reqBody.index);

  // Format the response to match the expected format
  const mappedAssignmentQuestion = {
    id: assignmentQuestion.id,
    assessmentId: assignmentQuestion.assessmentId,
    questionText: assignmentQuestion.questionText,
    submissionType: assignmentQuestion.submissionType,
    point: assignmentQuestion.point,
    createdAt: assignmentQuestion.createdAt.toISOString(),
    updatedAt: assignmentQuestion.updatedAt.toISOString(),
    rubricName: assignmentQuestion.rubricName,
    rubricDescription: assignmentQuestion.rubricDescription,
    rubricCriteriaOrder: assignmentQuestion.rubricCriteriaOrder,
    rubricCriteria: assignmentQuestion.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: Array.isArray(criteria.levels) ? criteria.levels : [],
      createdAt: criteria.createdAt.toISOString(),
      updatedAt: criteria.updatedAt.toISOString(),
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };

  sendSuccessResponse(
    res,
    { assignmentQuestion: mappedAssignmentQuestion },
    "Rubric criteria index updated successfully",
  );
};

// Controller function to delete a rubric criteria by its ID
// Also updates the order of remaining rubric criteria in the assignment question
//
// req - Express request object with rubricCriteriaId in params
// res - Express response object
export const deleteRubricCriteria = async (req: RequestWithUser, res: Response) => {
  const singleRubricCriteriaIdParamSchema = z.object({
    id: z.string().uuid("Rubric criteria ID must be a valid UUID"),
  });

  const { id: rubricCriteriaId } = zodSafeParse(req.params, singleRubricCriteriaIdParamSchema);

  const deletedRubricCriteria = await deleteRubricCriteriaService(rubricCriteriaId);

  const mappedRubricCriteria = {
    id: deletedRubricCriteria.id,
    name: deletedRubricCriteria.name,
    description: deletedRubricCriteria.description,
    weight: deletedRubricCriteria.weight,
    levels: deletedRubricCriteria.levels,
    createdAt: deletedRubricCriteria.createdAt.toISOString(),
    updatedAt: deletedRubricCriteria.updatedAt.toISOString(),
    assignmentQuestionId: deletedRubricCriteria.assignmentQuestionId,
  };

  sendSuccessResponse(res, { rubricCriteria: mappedRubricCriteria }, "Rubric criteria deleted successfully");
};

// Controller function to create a rubric template from an assignment question
// Uses the rubric criteria of that assignment question and the order from that assignment question
//
// req - Express request object with assignmentQuestionId in params and template name in body
// res - Express response object
export const createRubricTemplateFromAssignmentQuestion = async (req: RequestWithUser, res: Response) => {
  const assignmentQuestionIdParamSchema = z.object({
    assignmentQuestionId: z.string().uuid("Assignment question ID must be a valid UUID"),
  });

  const { assignmentQuestionId } = zodSafeParse(req.params, assignmentQuestionIdParamSchema);

  const reqBody = zodSafeParse(req.body, createRubricTemplateFromAssignmentQuestionReqBodySchema);

  const createdRubricTemplate = await createRubricTemplateFromAssignmentQuestionService(
    assignmentQuestionId,
    reqBody.templateName,
  );

  const mappedRubricTemplate = {
    id: createdRubricTemplate.id,
    name: createdRubricTemplate.name,
    rubricCriteriaOrder: createdRubricTemplate.rubricCriteriaOrder,
    createdAt: createdRubricTemplate.createdAt.toISOString(),
    updatedAt: createdRubricTemplate.updatedAt.toISOString(),
    rubricCriteria: createdRubricTemplate.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: criteria.levels,
      createdAt: criteria.createdAt.toISOString(),
      updatedAt: criteria.updatedAt.toISOString(),
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  };

  sendSuccessResponse(res, { rubricTemplate: mappedRubricTemplate }, "Rubric template created successfully");
};