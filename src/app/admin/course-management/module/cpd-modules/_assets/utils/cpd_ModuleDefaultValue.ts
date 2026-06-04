import { I_CPD_ModuleForm } from "../schemas/moduleSchema";

export const CPD_ModuleDefaultValue = (
  defaultValues: Partial<I_CPD_ModuleForm> = {},
): I_CPD_ModuleForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    moduleType: "CPD",
    courseType: "CPD_COURSE",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete || 0,
    description: defaultValues.description || "",
    learningOutcome: defaultValues.learningOutcome || "",
    forumDiscussionBoard: defaultValues.forumDiscussionBoard ?? false,
  };
};
