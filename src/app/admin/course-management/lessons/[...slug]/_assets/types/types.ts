export type CourseFormData = {
  // Course Details
  courseTitle: string;
  courseCode: string;
  hesaCourseId?: string;
  courseType: string;
  typeOfDegree?: string;
  typeOfDiploma?: string;
  intendedAward: string;
  courseDescription: string;
  studyModes: {
    selfPaced: boolean;
    instructorLed: boolean;
    cohortBased: boolean;
  };

  // Academic Session and Duration
  courseStartDate: Date;
  courseEndDate: Date;
  academicSessions: string;
  diplomaCourseLengthInMonths: string;
  degreeCourseLengthInYears: string;
  numberOfSemesters: string;
  totalCreditsRequired: string;
  year1ExpectedCourseCredits: string;
  year2ExpectedCourseCredits: string;
  year3ExpectedCourseCredits: string;
  minimumPassingCreditPerYear: string;

  // Financial Information
  tuitionFeePerYear?: string;
  tuitionFeePerModule?: string;

  // Accreditation and Compliance
  awardingInstitutionName?: string;
  awardingBodyCode?: string;
  accreditingBody: string;
  accreditationStatus: string;

  // Governance and Quality Assurance
  courseApprovalDate: Date;
  reviewDate: Date;
  courseLeader: string;
  governanceNotes?: string;
};
