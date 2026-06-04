import { ILessonForm } from "../schemas/lessonSchema";

export interface ILessonApi {
  id?: string;
  title: string;
  code: string;
  type: string;
  estimatedTimeToComplete?: number;
  faculty?: string;
  lessonDescription?: string;
  outcome?: string;
  contents: {
    title: string;
    type: string;
    description: string;
    paths: string[];
  }[];
}

export const LessonViewDefaultValue = (
  data: Partial<ILessonApi> = {},
): ILessonForm => {
  return {
    lessonTitle: data?.title || "",
    lessonCode: data?.code || "",
    lessonType: data?.type || "",
    estimatedTimeToComplete: data?.estimatedTimeToComplete || 0,
    faculty: data?.faculty || "",
    lessonDescription: data?.lessonDescription || "",
    learningOutcome: data?.outcome || "",
    contents: Array.isArray(data?.contents)
      ? data.contents.map((item) => ({
          title: item?.title || "",
          type: item?.type || "",
          description: item?.description || "",
          paths: Array.isArray(item?.paths) ? item.paths : [],
        }))
      : [
          {
            title: "",
            type: "",
            description: "",
            paths: [],
          },
        ],
  };
};