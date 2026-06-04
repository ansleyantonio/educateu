import { CPDCourseType } from "../schema/CPDCourseFormSchema";

const parseDate = (date?: string | Date) => (date ? new Date(date) : undefined);

export const CPDCourseDefaultValue = (
  defaultValues: Partial<CPDCourseType> = {},
): CPDCourseType => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    courseType: "CPD_COURSE",
    courseDescription: defaultValues.courseDescription || "",
    durationLength: defaultValues.durationLength || 0,
    studyModes: defaultValues.studyModes || [],
    // Accreditation
    professionalAccreditation: defaultValues.professionalAccreditation || "",
    accreditationBodyCode: defaultValues.accreditationBodyCode || "",
    accreditationStartDate: parseDate(defaultValues.accreditationStartDate),
    accreditationEndDate: parseDate(defaultValues.accreditationEndDate),

    // Financial Information
    // fees: defaultValues.fees!,
    //
    // fundingModel: defaultValues.fundingModel || "",
    // eligibleForSponsorship: defaultValues.eligibleForSponsorship || "NO",
  };
};
