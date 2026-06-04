import { ICertificateFilterForm } from "../schemas/certificateFilterFormSchema";

export const CertificateCourseFilterDefaultValue = (
  defaultValues: Partial<ICertificateFilterForm> = {},
): ICertificateFilterForm => {
  return {
    title: defaultValues.title || "",
    durationLength: defaultValues.durationLength || 0,
    //numberOfSemesters: defaultValues.numberOfSemesters || 0,
    //    advancedCourseType: defaultValues.advancedCourseType || "",
    status: defaultValues.status || [],
  };
};
