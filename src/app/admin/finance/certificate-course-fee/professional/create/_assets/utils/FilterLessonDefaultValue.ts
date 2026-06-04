import { IFilterLessonForm } from "../schemas/lessonSchema";

export const FilterLessonDefaultValue = (
  defaultValues: Partial<IFilterLessonForm> = {}
): IFilterLessonForm => {
  return {
    lessonTitle: defaultValues.lessonTitle || "",
    lessonCode: defaultValues.lessonCode || "",
    lessonType: defaultValues.lessonType || "",
    estimatedTimeToComplete: Number(defaultValues.estimatedTimeToComplete) || 0,
    faculty: defaultValues.faculty || "",
    lessonDescription: defaultValues.lessonDescription || "",
  };
};
