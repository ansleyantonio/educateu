/* eslint-disable @typescript-eslint/no-explicit-any */
export const default_values = {
  courseSelection: {
    // faculty: "",
    course: "",
    // intake: "",

    awardingBodyId: "",
    // courseId: "",
    sessionId: "",
    yearOfCourse: "",
  },

  personalInformation: {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: undefined,
    countryOfBirth: "",
    currentNationality: "",
    sex: "",
    otherSex: "",
    ethnicity: "",
    mobileNumber: "",
    countryOfResidence: "",
    currentAddress: "",
    currentPostCode: "",
    permanentAddress: "",
    nationalIdentityType: "",
    nationalIdentityNumber: "",
  },
  academicBackground: {
    highestLevelOfQualification: "",
    areaOfQualification: "",
    gradeOrResult: "",
    yearCompleted: "",
    countryOfIssue: "",
    institutionName: "",
  },

  personalStatement: {
    statement: "",
  },
  disabilityAndAccessibility: {
    disabilityAndAccessibility: "",
    disabilityAndAccessibilityOther: "",
  },
  nextOfKin: {
    relationship: "",
    otherRelationship: "",
    fullName: "",
    phoneOrMobile: "",
    address: "",
  },
  fund: {
    source: "",
    otherSource: "",
  },
  references: {
    relationship: "",
    email: "",
    otherRelationship: "",
  },
  criminalBackground: {
    offenseOrPenalty: "",
    offenseOrPenaltyDetails: "",
    disqualificationOrSanction: "",
    disqualificationOrSanctionDetails: "",
    policeClearance: "",
  },
  supportingDocument: {
    cv: "",
    englishCertificates: "",
    essay: "",
    proofOfNameChange: "",
    qualification: "",
    nationalIdentification: "",
    policeClearance: "",
    transcripts: "",
    references: "",
    otherDocument: "",
    passportId: "",
  },
};

type StepName =
  | "courseSelection"
  | "personalInformation"
  | "academicBackground"
  | "personalStatement"
  | "disabilityAndAccessibility"
  | "nextOfKin"
  | "fund"
  | "references"
  | "criminalBackground"
  | "supportingDocument";

export const getStepDefaultValues = (step: any, data?: any) => {
  switch (step) {
    case "courseSelection":
      return {
        course: data?.course || data?.courseId || "",
        awardingBodyId: data?.awardingBodyId || "",
        sessionId: data?.sessionId || "",
        yearOfCourse: data?.yearOfCourse || "",
      };

    case "personalInformation":
      return {
        firstName: data?.firstName || "",
        lastName: data?.lastName || "",
        email: data?.email || "",
        dateOfBirth: data?.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        countryOfBirth: data?.countryOfBirth || "",
        currentNationality: data?.currentNationality || "",
        sex: data?.sex || "",
        otherSex: data?.otherSex || "",
        ethnicity: data?.ethnicity || "",
        mobileNumber: data?.mobileNumber || "",
        countryOfResidence: data?.countryOfResidence || "",
        currentAddress: data?.currentAddress || "",
        currentPostCode: data?.currentPostCode || "",
        permanentAddress: data?.permanentAddress || "",
        nationalIdentityType: data?.nationalIdentityType || "",
        nationalIdentityNumber: data?.nationalIdentityNumber || "",
      };

    case "academicBackground":
      return {
        highestLevelOfQualification: data?.highestLevelOfQualification || "",
        areaOfQualification: data?.areaOfQualification || "",
        gradeOrResult: data?.gradeOrResult || "",
        yearCompleted: data?.yearCompleted || "",
        countryOfIssue: data?.countryOfIssue || "",
        institutionName: data?.institutionName || "",
      };

    case "personalStatement":
      return {
        statement: data?.statement || "",
      };

    case "disabilityAndAccessibility":
      return {
        disabilityAndAccessibility: data?.disabilityAndAccessibility || "",
        disabilityAndAccessibilityOther:
          data?.disabilityAndAccessibilityOther || "",
      };

    case "nextOfKin":
      return {
        relationship: data?.relationship || "",
        otherRelationship: data?.otherRelationship || "",
        fullName: data?.fullName || "",
        phoneOrMobile: data?.phoneOrMobile || "",
        address: data?.address || "",
      };

    case "fund":
      return {
        source: data?.source || "",
        otherSource: data?.otherSource || "",
      };

    case "reference":
      return {
        relationship: data?.relationship || "",
        email: data?.email || "",
        otherRelationship: data?.otherRelationship || "",
      };

    case "criminalBackground":
      return {
        offenseOrPenalty: data?.offenseOrPenalty || "",
        offenseOrPenaltyDetails: data?.offenseOrPenaltyDetails || "",
        disqualificationOrSanction: data?.disqualificationOrSanction || "",
        disqualificationOrSanctionDetails:
          data?.disqualificationOrSanctionDetails || "",
        policeClearance: data?.policeClearance || "",
        // offenseOrPenalty: data?.offenseOrPenalty || "",
        // offenseOrPenaltyDetails: data?.offenseOrPenaltyDetails || "",
        // disqualificationOrSanction: data?.disqualificationOrSanction || "",
        // disqualificationOrSanctionDetails:
        //   data?.disqualificationOrSanctionDetails || "",
        // policeClearance: data?.policeClearance || "",
      };

    case "supportingDocument":
      return {
        cv: data?.cv || "",
        englishCertificates: data?.englishCertificates || "",
        essay: data?.essay || "",
        proofOfNameChange: data?.proofOfNameChange || "",
        qualification: data?.qualification || "",
        nationalIdentification: data?.nationalIdentification || "",
        policeClearance: data?.policeClearance || "",
        transcripts: data?.transcripts || "",
        references: data?.references || "",
        otherDocument: data?.otherDocument || "",
        passportId: data?.passportId || "",
      };

    default:
      return {};
  }
};
