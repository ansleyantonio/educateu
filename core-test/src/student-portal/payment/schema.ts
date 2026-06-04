import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

export const createStudentCheckoutSessionSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  semesterNo: z.number().int().positive().optional(), // Optional semester number for partial payments
});

export const createManualPaymentSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  amount: z.number().positive("Amount must be positive"),
  transactionId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.CASH),
  paymentDate: z.string().datetime().optional(), // Will default to current date if not provided
  notes: z.string().optional(),
  image: z.string().optional(),
  accountName: z.string().min(1, "Account name is required").optional(),
  bankName: z.string().min(1, "Bank name is required").optional(),
  branchName: z.string().min(1, "Branch name is required").optional(),
  accountNumber: z.string().min(1, "Account number is required").optional(),
  swiftCode: z.string().min(1, "SWIFT code is required").optional(),
  currencyType: z.string().min(1, "Currency type is required").optional(),
});

export type CreateStudentCheckoutSessionData = z.infer<typeof createStudentCheckoutSessionSchema>;
export type CreateManualPaymentData = z.infer<typeof createManualPaymentSchema>;

// New schema for studentId and studentCourseId based payments
export const createStudentCheckoutSessionByCourseSchema = z.object({
  // studentId: z.string().min(1, "Student ID is required"),
  studentCourseId: z.string().min(1, "Student Course ID is required"),
  semesterNo: z.number().int().positive().optional(),
});

export const createManualPaymentByCourseSchema = z.object({
  // studentId: z.string().min(1, "Student ID is required"),
  studentCourseId: z.string().min(1, "Student Course ID is required"),
  amount: z.number().positive("Amount must be positive"),
  transactionId: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional().default(PaymentMethod.CASH),
  paymentDate: z.string().datetime().optional(),
  notes: z.string().optional(),
  image: z.string().optional(),
  accountName: z.string().min(1, "Account name is required").optional(),
  bankName: z.string().min(1, "Bank name is required").optional(),
  branchName: z.string().min(1, "Branch name is required").optional(),
  accountNumber: z.string().min(1, "Account number is required").optional(),
  swiftCode: z.string().min(1, "SWIFT code is required").optional(),
  currencyType: z.string().min(1, "Currency type is required").optional(),
});

export type CreateStudentCheckoutSessionByCourseData = z.infer<typeof createStudentCheckoutSessionByCourseSchema>;
export type CreateManualPaymentByCourseData = z.infer<typeof createManualPaymentByCourseSchema>;

// Schema for getting due payment by course
export const getStudentDuePaymentByCourseSchema = z.object({
  studentCourseId: z.string().min(1, "Student Course ID is required"),
  semesterNo: z.number().int().positive().optional(),
});

export type GetStudentDuePaymentByCourseData = z.infer<typeof getStudentDuePaymentByCourseSchema>;
