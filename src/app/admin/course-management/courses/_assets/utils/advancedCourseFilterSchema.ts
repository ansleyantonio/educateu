import { IAdvanceCourseFilterForm } from "../schemas/advanceFilterFormSchema";

export const AdvanceCourseFilterDefaultValue = (
  defaultValues: Partial<IAdvanceCourseFilterForm> = {},
): IAdvanceCourseFilterForm => {
  return {
    title: defaultValues.title || "",
    durationLength: defaultValues.durationLength || 0,
    numberOfSemesters: defaultValues.numberOfSemesters || 0,
    //    advancedCourseType: defaultValues.advancedCourseType || "",
    status: defaultValues.status || [],
  };
};
