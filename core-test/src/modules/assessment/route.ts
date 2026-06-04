import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import { AssessmentController } from "./controllers";
import { AwardingBodyController } from "../awarding-body/controllers";
import { RubricController } from "../rubric/controllers";

export const assessmentRouter = Router();

// CRUD routes for Assessment
assessmentRouter.post("/", asyncWrapper(AssessmentController.createAssessment));
assessmentRouter.get("/", asyncWrapper(AssessmentController.getAssessments));

// Get all rubric templates
assessmentRouter.get("/rubric-templates", asyncWrapper(RubricController.getRubricTemplates));

// GET awarding bodies
assessmentRouter.get("/awarding-bodies", asyncWrapper(AwardingBodyController.getAwardingBodies));

// GET rubric criteria from a template
assessmentRouter.get("/rubric-templates/:id", asyncWrapper(RubricController.getRubricCriteriaForTemplate));

// CRUD routes for specific assessment
assessmentRouter.get("/:id", asyncWrapper(AssessmentController.getAssessmentById));
assessmentRouter.put("/:id", asyncWrapper(AssessmentController.updateAssessment));
assessmentRouter.patch("/:id/status", asyncWrapper(AssessmentController.updateAssessmentStatus));

// Route for getting assessment preview
assessmentRouter.get("/:id/preview", asyncWrapper(AssessmentController.getAssessmentPreview));
assessmentRouter.delete("/:id", asyncWrapper(AssessmentController.deleteAssessment));

// Additional routes for updating specific fields
assessmentRouter.patch("/:id/late-submissions", asyncWrapper(AssessmentController.updateAssessmentLateSubmissions));
assessmentRouter.patch("/:id/attempts", asyncWrapper(AssessmentController.updateAssessmentAttempts));

// Nested routes for Quiz Questions under assessments
assessmentRouter.post("/:assessmentId/quiz-questions", asyncWrapper(AssessmentController.createQuizQuestion));
assessmentRouter.get("/:assessmentId/quiz-questions", asyncWrapper(AssessmentController.getQuizQuestions));

// Individual quiz question operations (no assessmentId needed)
assessmentRouter.put("/quiz-questions/:quizQuestionId", asyncWrapper(AssessmentController.updateQuizQuestion));
assessmentRouter.put(
  "/quiz-questions/:quizQuestionId/index",
  asyncWrapper(AssessmentController.updateQuizQuestionIndex),
);
assessmentRouter.get("/quiz-questions/:quizQuestionId", asyncWrapper(AssessmentController.getQuizQuestionById));
assessmentRouter.delete("/quiz-questions/:quizQuestionId", asyncWrapper(AssessmentController.deleteQuizQuestion));

// Nested routes for Assignment Questions under assessments
assessmentRouter.post(
  "/:assessmentId/assignment-questions",
  asyncWrapper(AssessmentController.createAssignmentQuestion),
);
assessmentRouter.get("/:assessmentId/assignment-questions", asyncWrapper(AssessmentController.getAssignmentQuestions));

// Individual assignment question operations (no assessmentId needed)
assessmentRouter.put(
  "/assignment-questions/:assignmentQuestionId",
  asyncWrapper(AssessmentController.updateAssignmentQuestion),
);
assessmentRouter.put(
  "/assignment-questions/:assignmentQuestionId/index",
  asyncWrapper(AssessmentController.updateAssignmentQuestionIndex),
);
assessmentRouter.get(
  "/assignment-questions/:assignmentQuestionId",
  asyncWrapper(AssessmentController.getAssignmentQuestionById),
);
assessmentRouter.delete(
  "/assignment-questions/:assignmentQuestionId",
  asyncWrapper(AssessmentController.deleteAssignmentQuestion),
);

// Rubric criteria operations (no assessmentId needed)
assessmentRouter.post(
  "/assignment-questions/:assignmentQuestionId/rubric-criteria",
  asyncWrapper(AssessmentController.connectRubricCriteriaToAssignmentQuestion),
);

// Get all rubric criteria for an assignment question
assessmentRouter.get(
  "/assignment-questions/:assignmentQuestionId/rubric-criteria",
  asyncWrapper(AssessmentController.getRubricCriteriaForAssignmentQuestion),
);

// Update a rubric criteria by ID
assessmentRouter.put("/rubric-criteria/:id", asyncWrapper(AssessmentController.updateRubricCriteria));

// Update the index of a rubric criteria
assessmentRouter.put("/rubric-criteria/:id/index", asyncWrapper(AssessmentController.updateRubricCriteriaIndex));

// Delete a rubric criteria by ID
assessmentRouter.delete("/rubric-criteria/:id", asyncWrapper(AssessmentController.deleteRubricCriteria));

// Create a rubric template from an assignment question
assessmentRouter.post(
  "/assignment-questions/:assignmentQuestionId/create-template",
  asyncWrapper(AssessmentController.createRubricTemplateFromAssignmentQuestion),
);

// Get Module Assessments for Enrolled Students
assessmentRouter.get(
  "/students/:studentId/module/:moduleId",
  asyncWrapper(AssessmentController.getAssessmentsByModuleId),
);
