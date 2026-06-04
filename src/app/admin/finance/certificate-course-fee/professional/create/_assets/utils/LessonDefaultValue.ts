import { ILessonForm } from "../schemas/lessonSchema";

export const LessonDefaultValue = (
  defaultValues: Partial<ILessonForm> = {},
): ILessonForm => {
  return {
    lessonTitle: defaultValues.lessonTitle || "",
    lessonCode: defaultValues.lessonCode || "",
    lessonType: defaultValues.lessonType || "",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete || 0,
    faculty: defaultValues.faculty || "",
    lessonDescription: defaultValues.lessonDescription || "",
    learningOutcome: defaultValues.learningOutcome || "",
    contents: defaultValues.contents || [
      {
        title: "",
        type: "",
        description: "",
        paths: [],
      },
    ],
  };
};
