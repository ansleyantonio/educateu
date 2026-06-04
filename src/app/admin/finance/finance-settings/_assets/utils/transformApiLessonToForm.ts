// import { ILessonForm } from "../schemas/lessonSchema";
import { ILessonUpdateForm } from "../schemas/lessonSchema";

interface ApiContent {
  id?: string;
    title?: string;
    description?: string;
    type?: string;
    paths?: string[];
  }
  
  interface ApiLesson {
    id?: string;
    title?: string;
    code?: string;
    type?: string;
    estimatedTimeToComplete?: number;
    outcome?: string;
    contents?: ApiContent[];
    faculty?: string;           
    lessonDescription?: string;
}

export const transformApiLessonToForm = (data: ApiLesson): ILessonUpdateForm => {
  // console.log("DATA", data);
  return {
    lessonTitle: data.title || "",
    lessonCode: data.code || "",
    lessonType: data.type || "",
    estimatedTimeToComplete: data.estimatedTimeToComplete || 0,
    faculty: "", 
    lessonDescription: "",
    learningOutcome: data.outcome || "",
    contents: (data.contents || []).map((content: ApiContent) => ({
      id: content.id || "",
      title: content.title || "",
      description: content.description || "",
      type: content.type || "",
      paths: content.paths || [],
    })),
  };
};