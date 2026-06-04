import { Router } from "express";
import { RubricController } from "./controllers";
import { asyncWrapper } from "../../utils/asyncWrapper";

export const rubricRouter = Router();

// Get all rubric templates
rubricRouter.get("/rubric-templates", asyncWrapper(RubricController.getRubricTemplates));

// Get all rubric criteria for a template
rubricRouter.get("/rubric-templates/:id", asyncWrapper(RubricController.getRubricCriteriaForTemplate));

// Create a new rubric template with optional criteria
rubricRouter.post("/rubric-templates", asyncWrapper(RubricController.createRubricTemplate));

// Add rubric criteria to an existing rubric template
rubricRouter.post("/rubric-templates/:id/rubric-criteria", asyncWrapper(RubricController.addCriteriaToRubricTemplate));

// Individual rubric criteria operations (no assessmentId needed)
rubricRouter.get("/rubric-criteria/:id", asyncWrapper(RubricController.getSingleRubricCriteria));

// Update a rubric criteria by ID (content, not index)
rubricRouter.put("/rubric-criteria/:id", asyncWrapper(RubricController.updateRubricCriteria));

// Update the index of a rubric criteria in a template
rubricRouter.put("/rubric-criteria/:id/index", asyncWrapper(RubricController.updateRubricCriteriaTemplateIndex));

// Delete a rubric criteria by ID
rubricRouter.delete("/rubric-criteria/:id", asyncWrapper(RubricController.deleteRubricCriteria));
