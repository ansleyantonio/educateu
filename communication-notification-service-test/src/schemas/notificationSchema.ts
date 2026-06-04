import { z } from 'zod';

// Schema for registration email
export const registerEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  name: z.string().min(1, { message: 'Name is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  loginUrl: z.string().url({ message: 'Login URL must be a valid URL' }),
  userName: z.string().min(1, { message: 'Username is required' }),
  courseTitle: z
    .string()
    .min(1, { message: 'Course title is required' })
    .optional(),
  courseStartDate: z
    .string()
    .min(1, { message: 'Course start date is required' })
    .optional(),
});

// Schema for wellbeing email
export const wellbeingEmailSchema = z.object({
  emails: z
    .array(z.string().email({ message: 'Invalid email address in array' }))
    .min(1, { message: 'At least one email is required' }),
  applicantName: z.string().min(1, { message: 'Name is required' }),
  status: z.enum(['APPROVED', 'PENDING', 'REJECTED'], {
    message: 'Status must be APPROVED, PENDING, or REJECTED',
  }),
});

// Schema for notes email
export const notesEmailSchema = z.object({
  emails: z
    .array(z.string().email({ message: 'Invalid email address in array' }))
    .min(1, { message: 'At least one email is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  noteContent: z.string().min(1, { message: 'Note content is required' }),
});

// Schema for interview email
export const interviewEmailSchema = z.object({
  emails: z
    .array(z.string().email({ message: 'Invalid email address in array' }))
    .min(1, { message: 'At least one email is required' }),
  name: z.string().min(1, { message: 'Name is required' }),
  interviewLink: z.string().min(1, { message: 'Interview link is required' }),
  interviewDate: z.string().min(1, { message: 'Interview date is required' }),
  interviewStartTime: z
    .string()
    .min(1, { message: 'Interview start time is required' }),
  interviewEndTime: z
    .string()
    .min(1, { message: 'Interview end time is required' }),
});

// Schema for application outcome email
export const applicationOutcomeEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  applicantName: z.string().min(1, { message: 'Applicant name is required' }),
  applicationRef: z
    .string()
    .min(1, { message: 'Application reference is required' }),
  outcome: z.enum(
    ['APPROVED_UNCONDITIONAL', 'APPROVED_CONDITIONAL', 'REJECTED'],
    {
      message:
        'Outcome must be APPROVED_UNCONDITIONAL, APPROVED_CONDITIONAL, or REJECTED',
    }
  ),
});

export const sendPreScreenOutcomeEmailSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
  outcome: z.string().min(1, { message: 'Outcome is required' }),
});
