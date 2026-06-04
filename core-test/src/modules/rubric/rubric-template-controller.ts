import { RequestWithUser } from "../../types";
import { Response } from "express";
import { sendSuccessResponse } from "../../utils/responseUtils";
import * as RubricTemplateService from "./rubric-template-service";
import { zodSafeParse } from "../../utils/zodUtils";
import { getPagination } from "../../utils/paginationUtils";
import {
  rubricTemplateIdParamSchema,
  rubricCriteriaIdParamSchema,
  updateRubricCriteriaTemplateIndexReqBodySchema,
  updateRubricCriteriaReqBodySchema,
  createRubricTemplateReqBodySchema,
  createRubricCriteriaReqBodySchema,
  getRubricTemplatesQuerySchema
} from "./types";
import z from "zod";

// Controller function to get all rubric templates
// req - Express request object
// res - Express response object
export const getRubricTemplates = async (req: RequestWithUser, res: Response) => {
  const query = zodSafeParse(req.query, getRubricTemplatesQuerySchema);
  const { page = 1, pageSize = 10, searchTerm } = query;

  const { rubricTemplates, pagination } = await RubricTemplateService.getRubricTemplates(page, pageSize, searchTerm);

  const mappedRubricTemplates = rubricTemplates.map((template) => ({
    id: template.id,
    name: template.name,
    rubricCriteriaOrder: template.rubricCriteriaOrder,
    createdAt: template.createdAt.toISOString(),
    updatedAt: template.updatedAt.toISOString(),
    rubricCriteria: template.rubricCriteria.map((criteria) => ({
      id: criteria.id,
      name: criteria.name,
      description: criteria.description,
      weight: criteria.weight,
      levels: criteria.levels,
      createdAt: criteria.createdAt.toISOString(),
      updatedAt: criteria.updatedAt.toISOString(),
      assignmentQuestionId: criteria.assignmentQuestionId,
    })),
  }));

  sendSuccessResponse(res, {
    rubricTemplates: mappedRubricTemplates,
    pagination
  }, "Rubric templates retrieved successfully");
};

// Controller function to get all rubric criteria for a specific template
// Maintains the order of criteria as specified in the template
// req - Express request object with templateId in params
// res - Express response object
export const getRubricCriteriaForTemplate = async (req: RequestWithUser, res: Response) => {
  const { id: templateId } = zodSafeParse(req.params, rubricTemplateIdParamSchema);

  const {
    templateId: returnedTemplateId,
    templateName,
    rubricCriteria,
  } = await RubricTemplateService.getRubricCriteriaForTemplate(templateId);

  const mappedRubricCriteria = rubricCriteria.map((criteria) => ({
    id: criteria.id,
    name: criteria.name,
    description: criteria.description,
    weight: criteria.weight,
    levels: criteria.levels,
    createdAt: criteria.createdAt.toISOString(),
    updatedAt: criteria.updatedAt.toISOString(),
    assignmentQuestionId: criteria.assignmentQuestionId,
  }));

  sendSuccessResponse(
    res,
    {
      templateId: returnedTemplateId,
      templateName: templateName,
      rubricCriteria: mappedRubricCriteria,
    },
    "Rubric criteria for template retrieved successfully",
  );
};

// Controller function to create a new rubric template with optional criteria
// req - Express request object with template data in body
// res - Express response object
export const createRubricTemplate = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, createRubricTemplateReqBodySchema);

  const createdTemplate = await RubricTemplateService.createRubricTemplate({
    name: reqBody.name,
    description: reqBody.description,
    rubricCriteriaConnections: reqBody.rubricCriteriaConnections,
  });

  const mappedRubricTemplate = {
    id: createdTemplate.id,
    name: createdTemplate.name,
    rubricCriteriaOrder: createdTemplate.rubricCriteriaOrder,
    createdAt: createdTemplate.createdAt.toISOString(),
    updatedAt: createdTemplate.updatedAt.toISOString(),
    rubricCriteria: createdTemplate.rubricCriteria.map((criteria) => ({
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

// Controller function to update the index of a rubric criteria within a rubric template
// req - Express request object with rubricCriteriaId in params and new index in body
// res - Express response object
export const updateRubricCriteriaTemplateIndex = async (req: RequestWithUser, res: Response) => {
  const { id: rubricCriteriaId } = zodSafeParse(req.params, rubricCriteriaIdParamSchema);

  const reqBody = zodSafeParse(req.body, updateRubricCriteriaTemplateIndexReqBodySchema);

  const {
    id: templateId,
    name: templateName,
    rubricCriteriaOrder,
    createdAt,
    updatedAt,
    rubricCriteria: updatedRubricCriteria
  } = await RubricTemplateService.updateRubricCriteriaTemplateIndex(rubricCriteriaId, reqBody.index);

  const mappedRubricTemplate = {
    id: templateId,
    name: templateName,
    rubricCriteriaOrder: rubricCriteriaOrder,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    rubricCriteria: updatedRubricCriteria.map((criteria) => ({
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

  sendSuccessResponse(
    res,
    { rubricTemplate: mappedRubricTemplate },
    "Rubric criteria index in template updated successfully"
  );
};

// Controller function to delete a rubric criteria by its ID
// Also updates the order of remaining rubric criteria in the rubric template
// req - Express request object with rubricCriteriaId in params
// res - Express response object
export const deleteRubricCriteria = async (req: RequestWithUser, res: Response) => {
  const { id: rubricCriteriaId } = zodSafeParse(req.params, rubricCriteriaIdParamSchema);

  const deletedRubricCriteria = await RubricTemplateService.deleteRubricCriteria(rubricCriteriaId);

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

// Controller function to add rubric criteria to an existing rubric template
// req - Express request object with templateId in params and criteria connections in body
// res - Express response object
export const addCriteriaToRubricTemplate = async (req: RequestWithUser, res: Response) => {
  const { id: templateId } = zodSafeParse(req.params, rubricTemplateIdParamSchema);

  const reqBody = zodSafeParse(req.body, createRubricCriteriaReqBodySchema);

  const updatedTemplate = await RubricTemplateService.addCriteriaToRubricTemplate(
    templateId,
    reqBody.rubricCriteriaConnections || []
  );

  const mappedRubricTemplate = {
    id: updatedTemplate.id,
    name: updatedTemplate.name,
    rubricCriteriaOrder: updatedTemplate.rubricCriteriaOrder,
    createdAt: updatedTemplate.createdAt.toISOString(),
    updatedAt: updatedTemplate.updatedAt.toISOString(),
    rubricCriteria: updatedTemplate.rubricCriteria.map((criteria) => ({
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

  sendSuccessResponse(res, { rubricTemplate: mappedRubricTemplate }, "Rubric criteria added to template successfully");
};