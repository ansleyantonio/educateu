import { titleSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

export const courseFormSchema = z.object({
  // Course Details
  courseTitle: titleSchema,
  courseCode: z.string().min(1, "Course code is required"),
  hesaCourseId: z.string().optional(),
  courseType: z.string().min(1, "Course type is required"),
  typeOfDegree: z.string().optional(),
  typeOfDiploma: z.string().optional(),
  intendedAward: z.string().min(1, "Intended award is required"),
  courseDescription: z.string().min(1, "Course description is required"),
  studyModes: z.object({
    selfPaced: z.boolean().default(false),
    instructorLed: z.boolean().default(false),
    cohortBased: z.boolean().default(false),
  }),

  // Academic Session and Duration
  courseStartDate: z.date({
    required_error: "Course start date is required",
  }),
  courseEndDate: z.date({
    required_error: "Course end date is required",
  }),
  academicSessions: z.string().min(1, "Select academic sessions is required"),
  diplomaCourseLengthInMonths: z
    .string()
    .min(1, "Diploma course length in months is required"),
  degreeCourseLengthInYears: z
    .string()
    .min(1, "Degree course length in years is required"),
  numberOfSemesters: z.string().min(1, "Number of semesters is required"),
  totalCreditsRequired: z
    .string()
    .min(1, "Total credits required for completion is required"),
  year1ExpectedCourseCredits: z
    .string()
    .min(1, "Year 1 expected course credits is required"),
  year2ExpectedCourseCredits: z
    .string()
    .min(1, "Year 2 expected course credits is required"),
  year3ExpectedCourseCredits: z
    .string()
    .min(1, "Year 3 expected course credits is required"),
  minimumPassingCreditPerYear: z
    .string()
    .min(1, "Minimum passing credit per year is required"),

  // Financial Information
  tuitionFeePerYear: z.string().optional(),
  tuitionFeePerModule: z.string().optional(),

  // Accreditation and Compliance
  awardingInstitutionName: z.string().optional(),
  awardingBodyCode: z.string().optional(),
  accreditingBody: z.string().min(1, "Accrediting body is required"),
  accreditationStatus: z.string().min(1, "Accreditation status is required"),

  // Governance and Quality Assurance
  courseApprovalDate: z.date({
    required_error: "Course approval date is required",
  }),
  reviewDate: z.date({
    required_error: "Review date is required",
  }),
  courseLeader: z.string().min(1, "Course leader is required"),
  governanceNotes: z.string().optional(),
});
