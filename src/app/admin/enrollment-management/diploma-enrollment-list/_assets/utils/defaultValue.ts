// defaults/academicInfoDefault.ts

import { IFilterDataType } from "../schemas/scheme";

export const DegreeEnrollmentDefaultValue = (
  defaultValues: Partial<IFilterDataType> = {}
): IFilterDataType => {
  return {
    awardingBodyId: defaultValues.awardingBodyId || "",
    yearOfEntry: defaultValues.yearOfEntry || "",
    courseId: defaultValues.courseId || "",
    moduleId: defaultValues.moduleId || "",
    sessionId: defaultValues.sessionId || "",
    migrationStatus: defaultValues.migrationStatus!,
    finance: defaultValues.finance || "",
    financeCheck: defaultValues.financeCheck || "",
    offerOfAcceptance: defaultValues.offerOfAcceptance || "",
  };
};
