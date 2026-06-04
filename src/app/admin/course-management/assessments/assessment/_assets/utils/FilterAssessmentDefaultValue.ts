import { IFilterAssessmentForm } from "../schemas/schema";

export const FilterAssessmentDefaultValue = (
  defaultValues: Partial<IFilterAssessmentForm> = {}
): IFilterAssessmentForm => {
  return {
    assessmentCode: defaultValues.assessmentCode || "",
    assessmentCategory: defaultValues.assessmentCategory || "",
    assessmentType: defaultValues.assessmentType || "",
    timeLimit: Number(defaultValues.timeLimit) || undefined,
  };
};
