import { I_CPD_ModuleForm } from "../schemas/moduleSchema";

export const CPD_ModuleDefaultValue = (
  defaultValues: Partial<I_CPD_ModuleForm> = {}
): I_CPD_ModuleForm => {
  return {
    moduleTitle: defaultValues.moduleTitle || "",
    moduleCode: defaultValues.moduleCode || "",
    moduleType: defaultValues.moduleType || "",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete || "",
    faculty: defaultValues.faculty || "",
    moduleDescription: defaultValues.moduleDescription || "",
    learningOutcome: defaultValues.learningOutcome || "",
    forumDiscussionBoard: defaultValues.forumDiscussionBoard ?? false,
  };
};
