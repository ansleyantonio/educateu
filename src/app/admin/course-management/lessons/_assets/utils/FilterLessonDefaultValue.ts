import { IFilterLessonForm } from "../schemas/lessonSchema";

export const FilterLessonDefaultValue = (
  defaultValues: Partial<IFilterLessonForm> = {},
): IFilterLessonForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    type: defaultValues.type || "",
    estimatedTimeToComplete: Number(defaultValues.estimatedTimeToComplete) || 0,
  };
};
