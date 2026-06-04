import { z } from "zod";

// Enums
const applicationStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
const applicationStage = z.enum([
  "NEW",
  "ASSIGN",
  "CHECK",
  "SUBMIT",
  "OUTCOME",
]);
const policeClearance = z.enum(["YES", "NO"]);

// String validation helper
const nonEmptyString = z.string().min(3, "Field cannot be empty");

// Schemas
const personalInformationSchema = z
  .object({
    firstName: nonEmptyString,
    lastName: nonEmptyString,
    dateOfBirth: z.coerce.date().optional(),
    countryOfBirth: nonEmptyString.optional(),
    currentNationality: nonEmptyString.optional(),
    sex: nonEmptyString.optional(),
    ethnicity: nonEmptyString.optional(),
    mobileNumber: nonEmptyString.optional(),
    countryOfResidence: nonEmptyString.optional(),
    currentAddress: nonEmptyString,
    currentPostCode: nonEmptyString.optional(),
    permanentAddress: nonEmptyString.optional(),
    nationalIdentityType: nonEmptyString.optional(),
    nationalIdentityNumber: nonEmptyString.optional(),
  })
  .strict();

const academicBackgroundSchema = z
  .object({
    highestLevelOfQualification: nonEmptyString.optional(),
    areaOfQualification: nonEmptyString.optional(),
    gradeOrResult: nonEmptyString.optional(),
    yearCompleted: nonEmptyString.optional(),
    countryOfIssue: nonEmptyString.optional(),
    institutionName: nonEmptyString.optional(),
  })
  .strict();

const courseSelectionSchema = z
  .object({
    faculty: nonEmptyString.optional(),
    course: nonEmptyString.optional(),
    intake: nonEmptyString.optional(),
    yearOfCourse: nonEmptyString.optional(),
  })
  .strict();

const personalStatementSchema = z
  .object({
    statement: nonEmptyString.optional(),
  })
  .strict();

const disabilityAndAccessibilitySchema = z
  .object({
    disabilityAndAccessibility: nonEmptyString.optional(),
  })
  .strict();

const nextOfKinSchema = z
  .object({
    relationship: nonEmptyString.optional(),
    fullName: nonEmptyString.optional(),
    phoneOrMobile: nonEmptyString.optional(),
    address: nonEmptyString.optional(),
  })
  .strict();

const fundSchema = z
  .object({
    source: nonEmptyString.optional(),
  })
  .strict();

const referenceSchema = z
  .object({
    relationship: nonEmptyString.optional(),
  })
  .strict();

const criminalBackgroundSchema = z
  .object({
    offenseOrPenalty: nonEmptyString.optional(),
    offenseOrPenaltyDetails: nonEmptyString.optional(),
    disqualificationOrSanction: nonEmptyString.optional(),
    disqualificationOrSanctionDetails: nonEmptyString.optional(),
    policeClearance: policeClearance.optional(),
  })
  .strict();

const supportingDocumentSchema = z
  .object({
    nationalIdentification: nonEmptyString.optional(),
    policeClearance: nonEmptyString.optional(),
    otherDocument: nonEmptyString.optional(),
  })
  .strict();

const applicationSchema = z
  .object({
    personalInformation: personalInformationSchema.optional(),
    academicBackground: academicBackgroundSchema.optional(),
    courseSelection: courseSelectionSchema.optional(),
    personalStatement: personalStatementSchema.optional(),
    disabilityAndAccessibility: disabilityAndAccessibilitySchema.optional(),
    nextOfKin: nextOfKinSchema.optional(),
    fund: fundSchema.optional(),
    reference: referenceSchema.optional(),
    criminalBackground: criminalBackgroundSchema.optional(),
    supportingDocument: supportingDocumentSchema.optional(),
  })
  .strict();

export {
  academicBackgroundSchema,
  applicationSchema,
  applicationStage,
  applicationStatus,
  courseSelectionSchema,
  criminalBackgroundSchema,
  disabilityAndAccessibilitySchema,
  fundSchema,
  nextOfKinSchema,
  personalInformationSchema,
  personalStatementSchema,
  policeClearance,
  referenceSchema,
  supportingDocumentSchema,
};
