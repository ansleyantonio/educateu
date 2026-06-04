// The assessment controller has been modularized into separate files:
// - assessment-controller.ts (for base assessment operations)
// - quiz-controller.ts (for quiz question operations)
// - assignment-controller.ts (for assignment question operations)
// - rubric-controller.ts (for rubric criteria operations)
//
// This file is maintained for backward compatibility.
// All new code should use the specific controller files directly.

// Export the AssessmentController object with all methods for backward compatibility
export * from "./assessment-controller";
export * from "./quiz-controller";
export * from "./assignment-controller";
export * from "./rubric-controller";

import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  updateAssessmentStatus,
  getAssessmentPreview,
  updateAssessmentLateSubmissions,
  updateAssessmentAttempts,
} from "./assessment-controller";

import {
  createQuizQuestion,
  updateQuizQuestion,
  updateQuizQuestionIndex,
  getQuizQuestions,
  getQuizQuestionById,
  deleteQuizQuestion,
} from "./quiz-controller";

import {
  createAssignmentQuestion,
  updateAssignmentQuestion,
  updateAssignmentQuestionIndex,
  getAssignmentQuestions,
  getAssignmentQuestionById,
  deleteAssignmentQuestion,
  getAssessmentsByModuleId,
} from "./assignment-controller";

import {
  connectRubricCriteriaToAssignmentQuestion,
  getRubricCriteriaForAssignmentQuestion,
  updateRubricCriteria,
  updateRubricCriteriaIndex,
  deleteRubricCriteria,
  createRubricTemplateFromAssignmentQuestion,
} from "./rubric-controller";

export const AssessmentController = {
  getAssessmentsByModuleId,
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  updateAssessmentStatus,
  getAssessmentPreview,
  updateAssessmentLateSubmissions,
  updateAssessmentAttempts,
  createQuizQuestion,
  updateQuizQuestion,
  updateQuizQuestionIndex,
  getQuizQuestions,
  getQuizQuestionById,
  deleteQuizQuestion,
  createAssignmentQuestion,
  updateAssignmentQuestion,
  updateAssignmentQuestionIndex,
  getAssignmentQuestions,
  getAssignmentQuestionById,
  deleteAssignmentQuestion,
  connectRubricCriteriaToAssignmentQuestion,
  getRubricCriteriaForAssignmentQuestion,
  updateRubricCriteria,
  updateRubricCriteriaIndex,
  deleteRubricCriteria,
  createRubricTemplateFromAssignmentQuestion,
};

