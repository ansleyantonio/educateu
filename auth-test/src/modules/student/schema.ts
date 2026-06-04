import z from "zod";
import { nonEmptyString } from "../../types";
import { create } from "axios";

// Login Schemas
export const loginSchema = z
  .object({
    email: z.string().email("Invalid email format").optional(),
    username: z.string().min(1, "Username is required").optional(),
    password: z.string().min(1, "Password is required"),
  })
  .strict()
  .refine((data) => data.email || data.username, {
    message: "Either email or username must be provided",
  });

export type LoginReqBody = z.infer<typeof loginSchema>;

// Change Password Schemas
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    securityQuestionId: z.string().uuid().optional(),
    securityQuestionAnswer: z.string().optional(),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordReqBody = z.infer<typeof changePasswordSchema>;

// Create Password Schemas (for first-time login)
export const createPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreatePasswordReqBody = z.infer<typeof createPasswordSchema>;

// Forgot Password Schemas
export const forgotPasswordSchema = z
  .object({
    email: z.string().email("Invalid email format"),
  })
  .strict();

export type ForgotPasswordReqBody = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schemas
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordReqBody = z.infer<typeof resetPasswordSchema>;

export const passwordResetSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .strict()
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordResetReqBody = z.infer<typeof passwordResetSchema>;
// MFA Schemas
export const verifyMFASchema = z
  .object({
    code: z.string().length(6, "Code must be 6 digits"),
  })
  .strict();

export type VerifyMFAReqBody = z.infer<typeof verifyMFASchema>;

export const setupMFASchema = z
  .object({
    enable: z.boolean(),
  })
  .strict();

export type SetupMFAReqBody = z.infer<typeof setupMFASchema>;

// Student Profile Schemas
export const updateProfileSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    mobile: z.string().optional(),
    address: z.string().optional(),
    nationality: z.string().optional(),
    photo: z.string().optional(),
    alternateEmail: z.string().email("Invalid email format").optional(),
    bio: z.string().optional(),
    securityQuestionId: z.string().uuid().optional(),
    mfaEnabled: z.boolean().optional(),
  })
  .strict();

export type UpdateProfileReqBody = z.infer<typeof updateProfileSchema>;

// Security Question Schemas
export const answerSecurityQuestionSchema = z
  .object({
    answer: z.string().min(1, "Answer is required"),
  })
  .strict();

export type AnswerSecurityQuestionReqBody = z.infer<
  typeof answerSecurityQuestionSchema
>;

// Query and Param Schemas
export const getStudentReqQuerySchema = z
  .object({
    page: z.coerce.number().int().default(1),
    search: z.string().optional(),
    status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "PENDING"]).optional(),
  })
  .strict();

export type GetStudentReqQuery = z.infer<typeof getStudentReqQuerySchema>;

export const studentIdParamSchema = z
  .object({
    studentId: z.string().uuid(),
  })
  .strict();

export type StudentIdParam = z.infer<typeof studentIdParamSchema>;

// Add to your schema file
export const loginWithOTPSchema = z
  .object({
    email: z.string().email("Invalid email format").optional(),
    username: z.string().min(1, "Username is required").optional(),
    // password: z.string().min(1, "Password is required").optional(),
    otp: z.string().length(4, "OTP must be 4 digits"),
  })
  .strict()
  .refine((data) => data.email || data.username, {
    message: "Either email or username must be provided",
  });

export type LoginWithOTPReqBody = z.infer<typeof loginWithOTPSchema>;

export const createSecurityQuestions = z
  .object({
    name: z.string().min(1, "Question is required"),
  })
  .strict();

export type CreateSecurityQuestionsReqBody = z.infer<
  typeof createSecurityQuestions
>;
