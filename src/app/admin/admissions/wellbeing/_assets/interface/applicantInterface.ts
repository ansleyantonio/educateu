/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Applicant {
  id: string;
  status: string;
  stage: string;
  wellbeingCheckStatus: string;
  generalFileCheckStatus: string;
  additionalFileCheckStatus: string;
  interviewOutcome: string;
  outcome: string;
  createdAt: string;
  updatedAt: string;
  personalInformation: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    email: string;
    countryOfBirth: string;
    currentNationality: string;
    sex: string;
    currentAddress: string;
    nationalIdentityNumber: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  personalStatement: {
    id: string;
    statement: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  academicBackground: {
    id: string;
    highestLevelOfQualification: string;
    areaOfQualification: string;
    gradeOrResult: string;
    yearCompleted: string;
    countryOfIssue: string;
    institutionName: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  courseSelection: {
    id: string;
    faculty: string;
    course: string;
    intake: string;
    yearOfCourse: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  disabilityAndAccessibility: {
    id: string;
    disabilityAndAccessibility: string[];
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  nextOfKin: {
    id: string;
    relationship: string;
    fullName: string;
    phoneOrMobile: string;
    address: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  fund: {
    id: string;
    source: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  criminalBackground: {
    id: string;
    offenseOrPenalty: string;
    offenseOrPenaltyDetails: string;
    disqualificationOrSanction: string;
    disqualificationOrSanctionDetails: string;
    policeClearance: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
  };
  supportingDocument: {
    id: string;
    applicationId: string;
    createdAt: string;
    updatedAt: string;
    supportingDocumentAttachments: {
      id: string;
      supportingDocumentId: string;
      attachmentId: string;
      name: string;
      status: string;
      createdAt: string;
      updatedAt: string;
      attachment: {
        id: string;
        paths: string[];
        createdAt: string;
        updatedAt: string;
      };
    }[];
  };
  applicationNotes: any[];
}
