import { getRubricTemplates, getRubricCriteriaForTemplate, createRubricTemplate, updateRubricCriteriaTemplateIndex, deleteRubricCriteria, addCriteriaToRubricTemplate } from './rubric-template-controller';
import { getSingleRubricCriteria, updateRubricCriteria } from './rubric-criteria-controller';

export const RubricController = {
  getRubricTemplates,
  getRubricCriteriaForTemplate,
  getSingleRubricCriteria,
  createRubricTemplate,
  updateRubricCriteria,
  updateRubricCriteriaTemplateIndex,
  deleteRubricCriteria,
  addCriteriaToRubricTemplate,
};
