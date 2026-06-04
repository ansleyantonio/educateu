import { z } from 'zod';

// Email template type enum schema
export const emailTemplateTypeSchema = z.enum([
  'FORGOT_PASSWORD',
  'APPLICATION_SUBMISSION',
  'APPLICATION_APPROVED',
  'APPLICATION_REJECTED',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_OUTCOME',
  'EMAIL_VERIFICATION',
  'WELCOME',
  'PAYMENT_SUCCESS',
  'PAYMENT_FAILED',
  'COURSE_ENROLLMENT',
  'ASSIGNMENT_SUBMISSION',
  'GRADE_UPDATE',
  'ANNOUNCEMENT',
  'SUPPORT_REQUEST',
  'ACCOUNT_ACTIVATION',
  'PASSWORD_CHANGED',
  'NEWSLETTER',
  'REMINDER',
  'OTHER',
]);

// Schema for sending templated email
export const sendTemplatedEmailSchema = z.object({
  templateType: emailTemplateTypeSchema,
  recipientEmail: z.string().email({ message: 'Invalid recipient email address' }),
  recipientName: z.string().optional(),
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Schema for creating email template
export const createTemplateSchema = z.object({
  name: z.string().min(1, { message: 'Template name is required' }),
  type: emailTemplateTypeSchema,
  subject: z.string().min(1, { message: 'Template subject is required' }),
  body: z.string().min(1, { message: 'Template body is required' }),
  variables: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Schema for updating email template
export const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  subject: z.string().min(1).optional(),
  body: z.string().min(1).optional(),
  variables: z.record(z.string(), z.any()).optional(),
  isActive: z.boolean().optional(),
});

// Schema for getting template by type (params)
export const getTemplateSchema = z.object({
  type: emailTemplateTypeSchema,
});

// Schema for email status
export const emailStatusSchema = z.enum([
  'PENDING',
  'SENT',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'FAILED',
  'BOUNCED',
  'SPAM',
]);

// Schema for getting email logs (query params)
export const getLogsSchema = z.object({
  templateType: emailTemplateTypeSchema.optional(),
  recipientEmail: z.string().email().optional(),
  status: emailStatusSchema.optional(),
  limit: z.coerce.number().min(1).max(100).optional().default(50),
  offset: z.coerce.number().min(0).optional().default(0),
});

// Schema for preview email template
export const previewTemplateSchema = z.object({
  type: emailTemplateTypeSchema,
  variables: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(),
});

// Common template variables schemas for different template types
export const forgotPasswordVariablesSchema = z.object({
  firstName: z.string(),
  otp: z.string(),
  expiryTime: z.string().optional(),
  loginUrl: z.string().url().optional(),
});

export const applicationSubmissionVariablesSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  applicationId: z.string(),
  courseName: z.string(),
  submissionDate: z.string(),
});

export const interviewScheduledVariablesSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  interviewDate: z.string(),
  interviewTime: z.string(),
  interviewLink: z.string().url(),
  contactEmail: z.string().email(),
});

export const welcomeVariablesSchema = z.object({
  firstName: z.string(),
  username: z.string(),
  loginUrl: z.string().url(),
});

export const paymentSuccessVariablesSchema = z.object({
  firstName: z.string(),
  amount: z.string(),
  transactionId: z.string(),
  paymentDate: z.string(),
  courseName: z.string().optional(),
});

export const gradeUpdateVariablesSchema = z.object({
  firstName: z.string(),
  courseName: z.string(),
  assessmentName: z.string(),
  grade: z.string(),
  feedback: z.string().optional(),
});

// Export all schemas
export const emailTemplateSchemas = {
  sendTemplatedEmail: sendTemplatedEmailSchema,
  createTemplate: createTemplateSchema,
  updateTemplate: updateTemplateSchema,
  getTemplate: getTemplateSchema,
  getLogs: getLogsSchema,
  previewTemplate: previewTemplateSchema,
  forgotPasswordVariables: forgotPasswordVariablesSchema,
  applicationSubmissionVariables: applicationSubmissionVariablesSchema,
  interviewScheduledVariables: interviewScheduledVariablesSchema,
  welcomeVariables: welcomeVariablesSchema,
  paymentSuccessVariables: paymentSuccessVariablesSchema,
  gradeUpdateVariables: gradeUpdateVariablesSchema,
};
