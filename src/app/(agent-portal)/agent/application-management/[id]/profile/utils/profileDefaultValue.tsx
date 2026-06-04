/* eslint-disable @typescript-eslint/no-explicit-any */
export default function profileDefaultValue(data: any) {

  const default_values = {
    personalInformation: {
      firstName: data?.personalInformation?.firstName || "vv",
      lastName: data?.personalInformation?.lastName || "",
      email: data?.personalInformation?.email || "", // Not available in data
      dateOfBirth: data?.personalInformation?.dateOfBirth
        ? new Date(data.personalInformation.dateOfBirth)
        : undefined,
      countryOfBirth: data?.personalInformation?.countryOfBirth || "",
      currentNationality: data?.personalInformation?.currentNationality || "",
      sex: data?.personalInformation?.sex || "",
      ethnicity: data?.personalInformation?.ethnicity || "",
      mobileNumber: data?.personalInformation?.mobileNumber || "",
      countryOfResidence: data?.personalInformation?.countryOfResidence || "",
      currentAddress: data?.personalInformation?.currentAddress || "",
      currentPostCode: data?.personalInformation?.currentPostCode || "",
      permanentAddress: data?.personalInformation?.permanentAddress || "",
      nationalIdentityType:
        data?.personalInformation?.nationalIdentityType || "",
      nationalIdentityNumber:
        data?.personalInformation?.nationalIdentityNumber || "",
    },
    academicBackground: {
      highestLevelOfQualification:
        data?.academicBackground?.highestLevelOfQualification || "",
      areaOfQualification: data?.academicBackground?.areaOfQualification || "",
      gradeOrResult: data?.academicBackground?.gradeOrResult || "",
      yearCompleted: data?.academicBackground?.yearCompleted || "",
      countryOfIssue: data?.academicBackground?.countryOfIssue || "",
      institutionName: data?.academicBackground?.institutionName || "",
    },
    courseSelection: {
      faculty: data?.courseSelection?.faculty || "",
      course: data?.courseSelection?.course || "",
      intake: data?.courseSelection?.intake || "",
      yearOfCourse: data?.courseSelection?.yearOfCourse || "",
    },
    personalStatement: {
      statement: data?.personalStatement?.statement || "",
    },
    disabilityAndAccessibility: {
      disabilityAndAccessibility:
        data?.disabilityAndAccessibility?.disabilityAndAccessibility || "",
    },
    nextOfKin: {
      relationship: data?.nextOfKin?.relationship || "",
      fullName: data?.nextOfKin?.fullName || "",
      phoneOrMobile: data?.nextOfKin?.phoneOrMobile || "",
      address: data?.nextOfKin?.address || "",
    },
    fund: {
      source: data?.fund?.source || "",
    },
    references: {
      relationship: data?.references?.relationship || "",
    },
    criminalBackground: {
      offenseOrPenalty: data?.criminalBackground?.offenseOrPenalty || "",
      offenseOrPenaltyDetails:
        data?.criminalBackground?.offenseOrPenaltyDetails || "",
      disqualificationOrSanction:
        data?.criminalBackground?.disqualificationOrSanction || "",
      disqualificationOrSanctionDetails:
        data?.criminalBackground?.disqualificationOrSanctionDetails || "",
      policeClearance: data?.criminalBackground?.policeClearance || "",
    },
    // supportingDocument: {
    //   qualification: data?.supportingDocument?.qualification || "",
    //   nationalIdentification:
    //     data?.supportingDocument?.nationalIdentification || undefined,
    //   policeClearance: data?.supportingDocument?.policeClearance || undefined,
    //   otherDocument: data?.supportingDocument?.otherDocument || undefined,
    // },
  };

  return default_values;
}

export const default_values = {
  personalInformation: {
    firstName: "",
    lastName: "",
    email: "",
    dateOfBirth: undefined,
    countryOfBirth: "",
    currentNationality: "",
    sex: "",
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
  courseSelection: {
    faculty: "",
    course: "",
    intake: "",
    yearOfCourse: "",
  },
  personalStatement: {
    statement: "",
  },
  disabilityAndAccessibility: {
    disabilityAndAccessibility: "",
  },
  nextOfKin: {
    relationship: "",
    fullName: "",
    phoneOrMobile: "",
    address: "",
  },
  fund: {
    source: "",
  },
  references: {
    relationship: "",
  },
  criminalBackground: {
    offenseOrPenalty: "",
    offenseOrPenaltyDetails: "",
    disqualificationOrSanction: "",
    disqualificationOrSanctionDetails: "",
    policeClearance: "",
  },
  supportingDocument: {
    qualification: "",
    nationalIdentification: "",
    policeClearance: "",
    otherDocument: "",
  },
};
