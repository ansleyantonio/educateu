import { IAdvanceCourseForm } from "../schemas/CreateAdvanceFormSchema";

export const AdvanceCourseDefaultValue = (
  defaultValues: Partial<IAdvanceCourseForm> = {},
): IAdvanceCourseForm => {
  return {
    title: defaultValues.title || "",
    code: defaultValues.code || "",
    status: defaultValues.status || "",
    hesaCourseId: defaultValues.hesaCourseId || "",
    courseType: defaultValues.courseType || "",
    degreeType: defaultValues.degreeType || "",
    diplomaType: defaultValues.diplomaType || "",
    intendedAward: defaultValues.intendedAward || "",
    courseDescription: defaultValues.courseDescription || "",
    studyModes: defaultValues.studyModes || [],
    startDate: defaultValues.startDate
      ? new Date(defaultValues.startDate)
      : undefined,
    endDate: defaultValues.endDate
      ? new Date(defaultValues.endDate)
      : undefined,
    //    sessionId: defaultValues.sessionId || "",
    durationLength: defaultValues.durationLength!,
    numberOfSemesters: defaultValues.numberOfSemesters!,
    totalCredits: defaultValues.totalCredits!,
    yearOneExpectedCredits: defaultValues.yearOneExpectedCredits || undefined,
    yearTwoExpectedCredits: defaultValues.yearTwoExpectedCredits || undefined,
    yearThreeExpectedCredits:
      defaultValues.yearThreeExpectedCredits || undefined,
    yearFourExpectedCredits: defaultValues.yearFourExpectedCredits || undefined,
    minimumPassingCreditsPerYear: defaultValues.minimumPassingCreditsPerYear!,
    awardingBodyId: defaultValues.awardingBodyId || "",
    // awardingBodyCode: defaultValues.awardingBodyCode || "",
    accreditationBody: defaultValues.accreditationBody || "",
    accreditationStatus: defaultValues.accreditationStatus || "",
    qualificationAim: defaultValues.qualificationAim || "",
    approvalDate: defaultValues.approvalDate!,
    reviewDate: defaultValues.reviewDate!,
    courseLeader: defaultValues.courseLeader || "",
    governanceNotes: defaultValues.governanceNotes || "",
  };
};
