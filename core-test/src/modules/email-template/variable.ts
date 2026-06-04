export const TemplateVariables = [
  // =========================================================
  // AUTH & ACCOUNT
  // =========================================================
  {
    label: "Name",
    variable: "${name}",
    types: ["FORGOT_PASSWORD_EMAIL", "WELLBEING_STATUS_EMAIL"],
  },
  {
    label: "User First Name",
    variable: "${firstName}",
    types: ["OTP_VERIFICATION_EMAIL", "FORGOT_PASSWORD_EMAIL"],
  },
  {
    label: "User Name",
    variable: "${userName}",
    types: ["REGISTRATION_EMAIL", "ACCOUNT_CREATION_EMAIL", "PASSWORD_UPDATE_EMAIL"],
  },
  {
    label: "Email",
    variable: "${email}",
    types: [
      "FORGOT_PASSWORD_EMAIL",
      "STUDENT_REGISTRATION_EMAIL",
      "EMAIL_VERIFICATION_EMAIL",
      "REGISTRATION_EMAIL",
      "APPLICATION_SUMMARY_EMAIL",
    ],
  },
  {
    label: "Password",
    variable: "${password}",
    types: ["ACCOUNT_CREATION_EMAIL", "STUDENT_REGISTRATION_EMAIL"],
  },
  {
    label: "OTP",
    variable: "${otp}",
    types: ["FORGOT_PASSWORD_EMAIL", "OTP_VERIFICATION_EMAIL"],
  },
  {
    label: "Verification Link",
    variable: "${verificationLink}",
    types: ["ACCOUNT_CREATION_EMAIL", "EMAIL_VERIFICATION_EMAIL"],
  },
  // {
  //   label: "Login Link",
  //   variable: "${loginLink}",
  //   types: ["REGISTRATION_EMAIL"],
  // },
  {
    label: "Change Date Time",
    variable: "${changeDateTime}",
    types: ["PASSWORD_UPDATE_EMAIL"],
  },

  // =========================================================
  // APPLICANT & APPLICATION
  // =========================================================
  {
    label: "Applicant Name",
    variable: "${applicantName}",
    types: [
      "APPLICATION_DECISION_REQUEST_EMAIL",
      "STRIPE_APPLICATION_OUTCOME_EMAIL",
      "APPLICATION_OUTCOME_EMAIL",
      "INCOMPLETE_APPLICATION_REMINDER_EMAIL",
      "APPLICANT_INTERVIEW_PASSED",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "INTERVIEW_CONFIRMATION_EMAIL",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_FAILED",
      "APPLICANT_INTERVIEW_CANCELED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
      "PRE_SCREENING_PASSED",
      "PRE_SCREENING_FAILED",
      "PRE_SCREENING_FAILED_2ND_TIME",
      "DID_NOT_PICK_UP",
      "INCOMPLETE_OR_PENDING",
      "WELLBEING_APPROVED_EMAIL",
      "WELLBEING_REJECTED_EMAIL",
    ],
  },
  {
    label: "Application ID",
    variable: "${applicationId}",
    types: [
      "APPLICATION_DECISION_REQUEST_EMAIL",
      "STRIPE_APPLICATION_OUTCOME_EMAIL",
      "APPLICATION_SUMMARY_EMAIL",
      "PRE_SCREENING_PASSED",
      "INCOMPLETE_OR_PENDING",
      "PRE_SCREENING_FAILED",
      "PRE_SCREENING_FAILED_2ND_TIME",
      "DID_NOT_PICK_UP",
      "INCOMPLETE_OR_PENDING",
      "ENROLLMENT_EMAIL",
    ],
  },
  {
    label: "Application Reference",
    variable: "${applicationReference}",
    types: ["APPLICATION_OUTCOME_EMAIL", "APPLICATION_DECISION_REQUEST_EMAIL"],
  },
  {
    label: "Missing Docs List",
    variable: "${missingDocsList}",
    types: ["INCOMPLETE_APPLICATION_REMINDER_EMAIL", "INCOMPLETE_OR_PENDING"],
  },

  // =========================================================
  // INTERVIEW
  // =========================================================
  {
    label: "Interviewer Name",
    variable: "${interviewerName}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_FAILED",
      "APPLICANT_INTERVIEW_CANCELED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
      // "PRE_SCREENING_PASSED",
    ],
  },
  {
    label: "Interview Date",
    variable: "${interviewDate}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
      // "PRE_SCREENING_PASSED",
    ],
  },
  {
    label: "Interview Start Time",
    variable: "${interviewStartTime}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
    ],
  },
  {
    label: "Interview End Time",
    variable: "${interviewEndTime}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
    ],
  },
  {
    label: "Interview Link",
    variable: "${interviewLink}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
    ],
  },
  {
    label: "Year",
    variable: "${year}",
    types: ["INTERVIEW_CONFIRMATION_EMAIL", "APPLICANT_INTERVIEW_PASSED", "APPLICANT_INTERVIEW_RESCHEDULED"],
  },
  // {
  //   label: "Rebook EligibleDate",
  //   variable: "${rebookEligibleDate}",
  //   types: [
  //     // "INTERVIEW_CONFIRMATION_EMAIL",
  //     "INTERVIEW_REMINDER_EMAIL_24H",
  //     "INTERVIEW_REMINDER_EMAIL_1H",
  //     "APPLICANT_INTERVIEW_PASSED",
  //     "APPLICANT_INTERVIEW_FAILED",
  //     "APPLICANT_INTERVIEW_CANCELED",
  //     "APPLICANT_INTERVIEW_RESCHEDULED",
  //     "PRE_SCREENING_FAILED",
  //   ],
  // },
  // {
  //   label: "Reschedule Instructions",
  //   variable: "${rescheduleInstructions}",
  //   types: [
  //     //"INTERVIEW_CONFIRMATION_EMAIL",
  //     "INTERVIEW_REMINDER_EMAIL_24H",
  //     "INTERVIEW_REMINDER_EMAIL_1H",
  //     "APPLICANT_INTERVIEW_PASSED",
  //     "APPLICANT_INTERVIEW_FAILED",
  //     "APPLICANT_INTERVIEW_CANCELED",
  //     "APPLICANT_INTERVIEW_RESCHEDULED",
  //     "INCOMPLETE_OR_PENDING",
  //   ],
  // },
  {
    label: "Next Steps Message",
    variable: "${nextStepsMessage}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_FAILED",
      "APPLICANT_INTERVIEW_CANCELED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
    ],
  },
  {
    label: "Outcome",
    variable: "${outcome}",
    types: [
      "INTERVIEW_CONFIRMATION_EMAIL",
      "INTERVIEW_REMINDER_EMAIL_24H",
      "INTERVIEW_REMINDER_EMAIL_1H",
      "APPLICANT_INTERVIEW_PASSED",
      "APPLICANT_INTERVIEW_FAILED",
      "APPLICANT_INTERVIEW_CANCELED",
      "APPLICANT_INTERVIEW_RESCHEDULED",
    ],
  },

  // =========================================================
  // COURSE & ENROLLMENT
  // =========================================================
  {
    label: "Student ID",
    variable: "${studentId}",
    types: ["ENROLLMENT_EMAIL"],
  },
  {
    label: "Student Name",
    variable: "${studentName}",
    types: ["ENROLLMENT_EMAIL", "STUDENT_REGISTRATION_EMAIL"],
  },
  {
    label: "Course Title",
    variable: "${courseTitle}",
    types: ["STUDENT_REGISTRATION_EMAIL", "APPLICATION_DECISION_REQUEST_EMAIL", "ENROLLMENT_EMAIL"],
  },
  {
    label: "Course Start Date",
    variable: "${courseStartDate}",
    types: ["ENROLLMENT_EMAIL", "STUDENT_REGISTRATION_EMAIL"],
  },
  // {
  //   label: "Offer Type",
  //   variable: "${offerType}",
  //   types: ["STUDENT_REGISTRATION_EMAIL"],
  // },
  // {
  //   label: "Acceptance Link",
  //   variable: "${acceptanceLink}",
  //   types: ["APPLICATION_DECISION_REQUEST_EMAIL"],
  // },
  {
    label: "Amount",
    variable: "${amount}",
    types: ["ENROLLMENT_EMAIL"],
  },

  // =========================================================
  // PAYMENT
  // =========================================================
  {
    label: "Payment Details",
    variable: "${paymentDetails}",
    types: ["STRIPE_APPLICATION_OUTCOME_EMAIL"],
  },
  {
    label: "Proof of Payment Link",
    variable: "${proofOfPaymentLink}",
    types: ["STRIPE_APPLICATION_OUTCOME_EMAIL"],
  },
  {
    label: "Payment Gateway Link",
    variable: "${paymentGatewayLink}",
    types: ["STRIPE_APPLICATION_OUTCOME_EMAIL"],
  },
  {
    label: "Payment Gateway",
  },

  // =========================================================
  // WELLBEING
  // =========================================================
  // {
  //   label: "Note Content",
  //   variable: "${noteContent}",
  //   types: ["WELLBEING_STATUS_EMAIL"],
  // },

  // =========================================================
  // DUPLICATE APPLICATION
  // =========================================================
  {
    label: "Officer Name",
    variable: "${officerName}",
    types: ["DUPLICATE_APPLICATION_EMAIL"],
  },
  {
    label: "Duplicate Count",
    variable: "${duplicateCount}",
    types: ["DUPLICATE_APPLICATION_EMAIL"],
  },
  {
    label: "Sample Applicant",
    variable: "${sampleApplicant}",
    types: ["DUPLICATE_APPLICATION_EMAIL"],
  },

  // =========================================================
  // PRE-SCREENING
  // =========================================================
  {
    label: "Agent Contact",
    variable: "${agentContact}",
    types: ["PRE_SCREENING_FAILED_2ND_TIME"],
  },

  // =========================================================
  // APPLICATION SUMMARY
  // =========================================================

  // ---------------------------------------------------------
  // Application Overview
  // ---------------------------------------------------------
  {
    label: "Created At",
    variable: "${createdAt}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Status",
    variable: "${status}",
    types: ["APPLICATION_SUMMARY_EMAIL", "WELLBEING_STATUS_EMAIL"],
  },
  {
    label: "Stage",
    variable: "${stage}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Interview Outcome",
    variable: "${interviewOutcome}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Outcome",
    variable: "${outcome}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Personal Information
  // ---------------------------------------------------------
  {
    label: "First Name",
    variable: "${firstName}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Last Name",
    variable: "${lastName}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Date of Birth",
    variable: "${dateOfBirth}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Country of Birth",
    variable: "${countryOfBirth}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Nationality",
    variable: "${currentNationality}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Sex",
    variable: "${sex}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Other Sex",
    variable: "${otherSex}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Ethnicity",
    variable: "${ethnicity}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Mobile Number",
    variable: "${mobileNumber}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Current Address",
    variable: "${currentAddress}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Academic Background
  // ---------------------------------------------------------
  {
    label: "Qualification",
    variable: "${highestLevelOfQualification}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Area of Qualification",
    variable: "${areaOfQualification}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Grade / Result",
    variable: "${gradeOrResult}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Year Completed",
    variable: "${yearCompleted}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Country of Issue",
    variable: "${countryOfIssue}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Institution Name",
    variable: "${institutionName}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Course Selection
  // ---------------------------------------------------------
  {
    label: "Faculty",
    variable: "${faculty}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Course Title",
    variable: "${courseTitle}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Course ID",
    variable: "${courseId}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Intake",
    variable: "${intake}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Year of Course",
    variable: "${yearOfCourse}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Personal Statement
  // ---------------------------------------------------------
  {
    label: "Personal Statement",
    variable: "${personalStatement}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Accessibility
  // ---------------------------------------------------------
  {
    label: "Disability and Accessibility",
    variable: "${disabilityAndAccessibility}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Next of Kin
  // ---------------------------------------------------------
  {
    label: "Kin Relationship",
    variable: "${kinRelationship}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Kin Full Name",
    variable: "${kinFullName}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Kin Phone / Mobile",
    variable: "${kinPhoneOrMobile}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Kin Address",
    variable: "${kinAddress}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Funding
  // ---------------------------------------------------------
  {
    label: "Funding Source",
    variable: "${fundSource}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // References
  // ---------------------------------------------------------
  {
    label: "References",
    variable: "${references}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Criminal Background
  // ---------------------------------------------------------
  {
    label: "Offense or Penalty",
    variable: "${offenseOrPenalty}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Disqualification or Sanction",
    variable: "${disqualificationOrSanction}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
  {
    label: "Police Clearance",
    variable: "${policeClearance}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },

  // ---------------------------------------------------------
  // Supporting Documents
  // ---------------------------------------------------------
  {
    label: "Supporting Documents",
    variable: "${supportingDocuments}",
    types: ["APPLICATION_SUMMARY_EMAIL"],
  },
];
