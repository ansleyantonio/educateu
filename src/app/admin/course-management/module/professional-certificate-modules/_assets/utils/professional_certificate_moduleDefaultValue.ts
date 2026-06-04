import { IProfessionalCertificateModuleForm } from "../schemas/moduleSchema";

export const ProfessionalCertificateModuleDefaultValue = (
  defaultValues: Partial<IProfessionalCertificateModuleForm> = {},
): IProfessionalCertificateModuleForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    moduleType: "PROFESSIONAL_CERTIFICATE",
    courseType: "PROFESSIONAL_COURSE",
    estimatedTimeToComplete: defaultValues.estimatedTimeToComplete!,
    description: defaultValues.description || "",
    learningOutcome: defaultValues.learningOutcome || "",
    forumDiscussionBoard: defaultValues.forumDiscussionBoard ?? false,
  };
};
