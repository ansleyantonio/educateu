import { FormValueType } from "../schema/professionalFormSchema";

const parseDate = (date?: string | Date) => (date ? new Date(date) : undefined);

export const ProfessionalCourseDefaultValue = (
  defaultValues: Partial<FormValueType> = {},
): FormValueType => {
  return {
    title: defaultValues.title || "",
    courseType: "PROFESSIONAL_COURSE",
    code: defaultValues.code || "",
    startDate: parseDate(defaultValues.startDate),
    endDate: parseDate(defaultValues.endDate),
    courseDescription: defaultValues.courseDescription || "",
    durationLength: defaultValues.durationLength || 0,
    studyModes: defaultValues.studyModes!,

    // Accreditation
    professionalAccreditation: defaultValues.professionalAccreditation || "",
    accreditationBodyCode: defaultValues.accreditationBodyCode || "",
    accreditationStatus: defaultValues.accreditationStatus || "",
    accreditationStartDate: parseDate(defaultValues.accreditationStartDate),
    accreditationEndDate: parseDate(defaultValues.accreditationEndDate),

    // Financial Information
    // courseFees: defaultValues.courseFees!,
    // fundingModel: defaultValues.fundingModel || "",
    // eligibleForSponsorship: defaultValues.eligibleForSponsorship!,
  };
};
