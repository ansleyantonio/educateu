import { verify } from "node:crypto";
import { z } from "zod";

const YesNoEnum = z.enum(["YES", "NO"]);

// Enums
const applicationStatus = z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]);
const applicationStage = z.enum(["NEW", "ASSIGN", "CHECK", "SUBMIT", "OUTCOME"]);
const sexEnum = z.enum(["MALE", "FEMALE", "OTHER"]);
const policeClearance = z.enum(["YES", "NO"]);

// String validation helper
const nonEmptyString = z.string().min(1, "Field cannot be empty");

// Enums
export const ApplicationStatus = z.enum(["DRAFT", "PENDING", "APPROVED", "REJECTED"]);
export const ApplicationStage = z.enum(["NEW", "ASSIGN", "CHECK", "SUBMIT", "OUTCOME"]);
export const GeneralFileCheckStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const AdditionalFileCheckStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const WellbeingCheckStatus = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const Outcome = z.enum(["PENDING", "APPROVED_CONDITIONAL", "APPROVED_UNCONDITIONAL", "REJECTED"]);

// Schemas
const personalInformationSchema = z
  .object({
    firstName: nonEmptyString,
    lastName: nonEmptyString,
    dateOfBirth: z.coerce.date(),
    email: z.string().email(),
    countryOfBirth: nonEmptyString.optional(),
    currentNationality: nonEmptyString.optional(),
    sex: sexEnum.optional(),
    otherSex: nonEmptyString.optional(),
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
    sessionId: z.string().uuid().optional(),
    awardingBodyId: z.string().uuid().optional(),
    // faculty: nonEmptyString.optional(),
    course: z.string().uuid(),
    // intake: nonEmptyString.optional(),
    yearOfCourse: nonEmptyString.optional().optional(),
  })
  .strict();

const personalStatementSchema = z
  .object({
    statement: nonEmptyString.optional(),
  })
  .strict();

const disabilityAndAccessibilitySchema = z
  .object({
    disabilityAndAccessibility: z
      .array(z.string())
      .min(1, { message: "At least one disability must be selected" })
      .transform((arr) => arr.map((item) => item.toUpperCase()))
      .optional(),
    disabilityAndAccessibilityOther: nonEmptyString.optional(),
  })
  .strict();

const nextOfKinSchema = z
  .object({
    relationship: nonEmptyString.optional(),
    fullName: nonEmptyString.optional(),
    phoneOrMobile: nonEmptyString.optional(),
    address: nonEmptyString.optional(),
    otherRelationship: nonEmptyString.optional(),
  })
  .strict();

const fundSchema = z
  .object({
    source: nonEmptyString.optional(),
    otherSource: nonEmptyString.optional(),
  })
  .strict();

const referenceSchema = z
  .object({
    relationship: nonEmptyString.optional(),
    email: nonEmptyString.email().optional(),
    otherRelationship: nonEmptyString.optional(),
  })
  .strict();

const criminalBackgroundSchema = z
  .object({
    offenseOrPenalty: z
      .preprocess((val) => {
        if (typeof val === "string") {
          return val.toUpperCase();
        }
        return val;
      }, YesNoEnum)
      .optional(),
    offenseOrPenaltyDetails: nonEmptyString.optional(),
    disqualificationOrSanction: z
      .preprocess((val) => {
        if (typeof val === "string") {
          return val.toUpperCase();
        }
        return val;
      }, YesNoEnum)
      .optional(),
    disqualificationOrSanctionDetails: nonEmptyString.optional(),
    policeClearance: z
      .preprocess((val) => {
        if (typeof val === "string") {
          return val.toUpperCase();
        }
        return val;
      }, YesNoEnum)
      .optional(),
  })
  .strict();

const supportingDocumentSchema = z.record(z.array(nonEmptyString)).optional();

const applicationSchema = z
  .object({
    status: ApplicationStatus.optional().default("DRAFT").optional(),
    stage: ApplicationStage.optional().default("NEW").optional(),
    wellbeingCheckStatus: WellbeingCheckStatus.optional().default("PENDING").optional(),
    generalFileCheckStatus: GeneralFileCheckStatus.optional().default("PENDING").optional(),
    additionalFileCheckStatus: AdditionalFileCheckStatus.optional().default("PENDING").optional(),
    interviewOutcome: z.string().optional().default("PENDING").optional(),
    outcome: Outcome.optional().default("PENDING").optional(),
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
  applicationSchema,
  personalInformationSchema,
  academicBackgroundSchema,
  courseSelectionSchema,
  personalStatementSchema,
  disabilityAndAccessibilitySchema,
  nextOfKinSchema,
  fundSchema,
  referenceSchema,
  criminalBackgroundSchema,
  supportingDocumentSchema,
  applicationStatus,
  applicationStage,
  sexEnum,
  policeClearance,
};
