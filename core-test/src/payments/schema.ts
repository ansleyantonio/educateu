// validation/stripeValidation.js
import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  applicationId: z.string().min(1, "Application ID is required"),
  paymentRecordId: z.string().min(1, "Payment record ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required").default("USD"),
  paymentType: z.enum(["FULL", "SEMESTER"]).default("FULL"),
  courseName: z.string().min(1, "Course name is required"),
  customerEmail: z.string().email().optional(),
});

export const savePaymentSchema = z.object({
  sessionId: z.string().min(1, "Session ID is required"),
});
// types/stripeTypes.ts
export type createCheckoutSessionData = z.infer<typeof createCheckoutSessionSchema>;
export type savePaymentData = z.infer<typeof savePaymentSchema>;

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export interface SavePaymentResult {
  paymentRecord: any; // You can replace with proper Prisma type
  paymentHistory: any; // You can replace with proper Prisma type
  session: {
    amount: number;
    currency: string;
    paymentType: string;
    courseName: string;
    paymentStatus: string;
  };
}

export interface VerifyPaymentResult {
  sessionId: string;
  paymentStatus: string;
  amount: number;
  currency: string;
  customerEmail?: string;
  metadata: any;
}

export const ManualPaymentSchema = z.object({
  accountNo: z.string().min(1, "Account No is required"),
  accountName: z.string().min(1, "Account Name is required"),
  referenceNo: z.string().min(1, "Reference No is required"),
  currency: z.enum(["USD", "GBP", "EURO", "BDT"]).optional(),
  applicationId: z.string().uuid("Invalid Application ID"),
  paymentType: z.enum(["FULL", "SEMESTER"]),
  amount: z.number().positive("Amount must be greater than 0"),
  bankName: z.string().optional(),
  receipts: z.string().min(1, "Receipt URL is required"),
});

export type ManualPaymentForm = z.infer<typeof ManualPaymentSchema>;
