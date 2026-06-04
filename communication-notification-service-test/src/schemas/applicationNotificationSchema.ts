import { z } from 'zod';

// Schema for sending application summary email with just applicationId
export const applicationSummarySchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
});

// Schema for email verification with email and applicationId
export const emailVerificationRequestSchema = z.object({
  // email: z.string().email('Invalid email address'),
  applicationId: z.string(),
});

// Define the schema for the application notification request (full application object)
export const applicationNotificationSchema = z.object({
  application: z.object({
    applicationId: z.string().optional(),
    createdAt: z.string().optional(),
    status: z.string().optional(),
    stage: z.string().optional(),
    interviewOutcome: z.string().optional(),
    outcome: z.string().optional(),
    personalInformation: z
      .object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        dateOfBirth: z.string().optional(),
        email: z.string().email().optional(),
        countryOfBirth: z.string().optional(),
        currentNationality: z.string().optional(),
        sex: z.string().optional(),
        otherSex: z.string().optional(),
        ethnicity: z.string().optional(),
        mobileNumber: z.string().optional(),
        currentAddress: z.string().optional(),
      })
      .optional(),
    academicBackground: z
      .object({
        highestLevelOfQualification: z.string().optional(),
        areaOfQualification: z.string().optional(),
        gradeOrResult: z.string().optional(),
        yearCompleted: z.string().optional(),
        countryOfIssue: z.string().optional(),
        institutionName: z.string().optional(),
      })
      .optional(),
    courseSelection: z
      .object({
        faculty: z.string().optional(),
        courseId: z.string().optional(),
        intake: z.string().optional(),
        yearOfCourse: z.string().optional(),
      })
      .optional(),
    personalStatement: z
      .object({
        statement: z.string().optional(),
      })
      .optional(),
    disabilityAndAccessibility: z
      .object({
        disabilityAndAccessibility: z.string().optional(),
      })
      .optional(),
    nextOfKin: z
      .object({
        relationship: z.string().optional(),
        fullName: z.string().optional(),
        phoneOrMobile: z.string().optional(),
        address: z.string().optional(),
      })
      .optional(),
    fund: z
      .object({
        source: z.string().optional(),
      })
      .optional(),
    reference: z.any().optional(), // Using any for now since the type wasn't specified
    criminalBackground: z
      .object({
        offenseOrPenalty: z.string().optional(),
        disqualificationOrSanction: z.string().optional(),
        policeClearance: z.string().optional(),
      })
      .optional(),
    supportingDocument: z
      .object({
        supportingDocumentAttachments: z
          .array(
            z.object({
              name: z.string().optional(),
              status: z.string().optional(),
              attachment: z
                .object({
                  paths: z.array(z.string()).optional(),
                })
                .optional(),
            })
          )
          .optional(),
      })
      .optional(),
  }),
});

// Schema for sending custom application notification
export const customApplicationNotificationSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
});

// Schema for real-time application notification
export const realTimeApplicationNotificationSchema = z.object({
  applicationId: z.string().min(1, 'Application ID is required'),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
});
