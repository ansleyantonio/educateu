import { IAdvanceModuleForm } from "../schemas/module/advanceModuleSchema";

export const AdvanceModuleDefaultValue = (
  defaultValues: Partial<IAdvanceModuleForm> = {},
): IAdvanceModuleForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    courseType: defaultValues.courseType || "",
    awardingBodyId: defaultValues.awardingBodyId || "",
    moduleType: defaultValues.moduleType || "",
    credit: defaultValues.credit!,
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete!,
    description: defaultValues.description || "",
    learningOutcome: defaultValues.learningOutcome || "",
    forumOrDiscussionBoard: defaultValues.forumOrDiscussionBoard ?? false,
  };
};
