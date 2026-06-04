import { RequestWithUser } from "../../types";
import { Response } from "express";
import { sendSuccessResponse } from "../../utils/responseUtils";
import * as RubricCriteriaService from "./rubric-criteria-service";
import { zodSafeParse } from "../../utils/zodUtils";
import {
  rubricCriteriaIdParamSchema,
  updateRubricCriteriaReqBodySchema
} from "./types";
import z from "zod";

// Controller function to get a single rubric criteria by ID
// req - Express request object with id in params
// res - Express response object
export const getSingleRubricCriteria = async (req: RequestWithUser, res: Response) => {
  const { id: rubricCriteriaId } = zodSafeParse(req.params, rubricCriteriaIdParamSchema);

  const rubricCriteria = await RubricCriteriaService.getSingleRubricCriteria(rubricCriteriaId);

  const mappedRubricCriteria = {
    id: rubricCriteria.id,
    name: rubricCriteria.name,
    description: rubricCriteria.description,
    weight: rubricCriteria.weight,
    levels: rubricCriteria.levels,
    createdAt: rubricCriteria.createdAt.toISOString(),
    updatedAt: rubricCriteria.updatedAt.toISOString(),
    assignmentQuestionId: rubricCriteria.assignmentQuestionId,
  };

  sendSuccessResponse(res, { rubricCriteria: mappedRubricCriteria }, "Rubric criteria retrieved successfully");
};

// Controller function to update a rubric criteria by its ID
// Only non-relational fields can be updated (name, description, weight, levels)
// req - Express request object with rubricCriteriaId in params and update data in body
// res - Express response object
export const updateRubricCriteria = async (req: RequestWithUser, res: Response) => {
  const { id: rubricCriteriaId } = zodSafeParse(req.params, rubricCriteriaIdParamSchema);

  const updateData = zodSafeParse(req.body, updateRubricCriteriaReqBodySchema);

  const updatedRubricCriteria = await RubricCriteriaService.updateRubricCriteria(rubricCriteriaId, updateData);

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