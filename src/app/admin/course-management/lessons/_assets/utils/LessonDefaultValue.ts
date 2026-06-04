/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILessonForm } from "../schemas/lessonSchema";

export const LessonDefaultValue = (
  defaultValues: Partial<ILessonForm> = {},
): ILessonForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    type: defaultValues.type || "",
    awardingBodyId: defaultValues.awardingBodyId || "",
    accreditation: defaultValues.accreditation || "",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete || 0,
    outcome: defaultValues.outcome || "",
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

export const formatLessonData = (data: any) => ({
  ...data,
  contents:
    data?.lessonContents?.map(({ id, index, content }: any) => ({
      id, // lessonContent id
      index,
      title: content.title,
      description: content.description,
      type: content.type,
      paths: content.paths,
    })) || [],
});
