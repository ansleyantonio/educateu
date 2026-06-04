import { z } from 'zod';

// Common user email data schema
export const userEmailDataSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  username: z.string().min(1, { message: 'Username is required' }).optional(),
  firstName: z
    .string()
    .min(1, { message: 'First name is required' })
    .optional(),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters' })
    .optional(),
});

// Schema for registration email
export const registrationEmailSchema = userEmailDataSchema.extend({
  loginUrl: z
    .string()
    .url({ message: 'Login URL must be a valid URL' })
    .optional(),
});

// Schema for OTP email
export const otpEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  firstName: z.string().optional(),
  otp: z
    .string()
    .min(4, { message: 'OTP must be at least 4 characters' })
    .max(6, { message: 'OTP must be at most 6 characters' }),
});

// Schema for password update email
export const passwordUpdateEmailSchema = userEmailDataSchema.extend({
  loginUrl: z
    .string()
    .url({ message: 'Login URL must be a valid URL' })
    .optional(),
});

// Schema for verification email
export const verificationEmailSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  userId: z.string().optional(),
});

// Schema for email verification with access token
export const emailVerificationSchema = z.object({
  userId: z.string().optional(),
  email: z.string().email({ message: 'Invalid email address' }),
  firstName: z.string().optional(),
  accessToken: z.string().min(1, { message: 'Access token is required' }),
});

// Generic email schema
export const genericEmailSchema = z.object({
  to: z.string().email({ message: 'Invalid recipient email address' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  html: z.string().min(1, { message: 'HTML content is required' }),
  text: z.string().optional(),
});

// Schema for enrollment email
export const enrollmentEmailSchema = z.object({
  applicationId: z.string().min(1, { message: 'Application ID is required' }),
  amount: z.number().positive({ message: 'Amount must be a positive number' }),
  paymentType: z.string().optional(),
});
