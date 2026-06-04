import { IProfessionalCertificateModuleForm } from "../schemas/moduleSchema";

export const ProfessionalCertificateModuleDefaultValue = (
  defaultValues: Partial<IProfessionalCertificateModuleForm> = {}
): IProfessionalCertificateModuleForm => {
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
