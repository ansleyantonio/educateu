import { IAdvanceModuleForm } from "../schemas/moduleSchema";

export const AdvanceModuleDefaultValue = (
  defaultValues: Partial<IAdvanceModuleForm> = {}
): IAdvanceModuleForm => {
  return {
    moduleTitle: defaultValues.moduleTitle || "",
    moduleCode: defaultValues.moduleCode || "",
    awardingBody: defaultValues.awardingBody || "",
    moduleType: defaultValues.moduleType || "",
    credit: defaultValues.credit || "",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete || "",
    faculty: defaultValues.faculty || "",
    moduleDescription: defaultValues.moduleDescription || "",
    learningOutcome: defaultValues.learningOutcome || "",
    forumDiscussionBoard: defaultValues.forumDiscussionBoard ?? false,
  };
};
