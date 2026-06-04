import { getRubricTemplates, getRubricCriteriaForTemplate, createRubricTemplate, updateRubricCriteriaTemplateIndex, deleteRubricCriteria, addCriteriaToRubricTemplate } from './rubric-template-service';
import { getSingleRubricCriteria, updateRubricCriteria } from './rubric-criteria-service';

export const RubricService = {
  getRubricTemplates,
  getRubricCriteriaForTemplate,
  getSingleRubricCriteria,
  createRubricTemplate,
  updateRubricCriteria,
  updateRubricCriteriaTemplateIndex,
  deleteRubricCriteria,
  addCriteriaToRubricTemplate,
};
