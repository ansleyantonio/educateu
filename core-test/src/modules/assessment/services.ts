// The assessment service has been modularized into separate files:
// - assessment-service.ts (for base assessment operations)
// - quiz-service.ts (for quiz question operations)
// - assignment-service.ts (for assignment question operations)
// - rubric-service.ts (for rubric criteria operations)
//
// This file is maintained for backward compatibility.
// All new code should use the specific service files directly.

// Export the AssessmentService object with all methods for backward compatibility
import {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  validateModuleAssessmentWeights
} from './assessment-service';

import {
  createQuizQuestion,
  updateQuizQuestion,
  updateQuizQuestionIndex,
  getQuizQuestions,
  getQuizQuestionById,
  deleteQuizQuestion
} from './quiz-service';

import {
  createAssignmentQuestion,
  updateAssignmentQuestion,
  updateAssignmentQuestionIndex,
  getAssignmentQuestions,
  getAssignmentQuestionById,
  deleteAssignmentQuestion
} from './assignment-service';

import {
  connectRubricCriteriaToAssignmentQuestion,
  getRubricCriteriaForAssignmentQuestion,
  updateRubricCriteria,
  updateRubricCriteriaIndex,
  deleteRubricCriteria,
  createRubricTemplateFromAssignmentQuestion
} from './rubric-service';

export const AssessmentService = {
  createAssessment,
  getAssessments,
  getAssessmentById,
  updateAssessment,
  deleteAssessment,
  validateModuleAssessmentWeights,
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