/*
 * Payment module validation schemas
 *
 * This file contains all Zod validation schemas for the payment module
 * including promotional codes, payment records, course fees, and agent commissions.
 *
 */

import { z } from "zod";

export const createFinanceSettingSchema = z.object({
  discountName: z.string().optional(),
  discountValue: z.number().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE").optional(),
  subjectEmail: z.string().optional(),
  templateEmail: z.string().optional(),
  subjectPayment: z.string().optional(),
  templatePayment: z.string().optional(),
  subjectReminder: z.string().optional(),
  templateReminder: z.string().optional(),
  subjectInvoice: z.string().optional(),
  templateInvoice: z.string().optional(),
  autoReminder: z.boolean().default(false),
  frequency: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).default("ONCE").optional(),
  courseId: z.string().optional(),
  paymentStatus: z.enum(["COMPLETED", "PENDING", "FAILED", "INACTIVE", "ACTIVE"]).default("PENDING").optional(),
});

export const updateFinanceSettingSchema = z.object({
  discountName: z.string().optional(),
  discountValue: z.number().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).default("PERCENTAGE").optional(),
  subjectEmail: z.string().optional(),
  templateEmail: z.string().optional(),
  subjectPayment: z.string().optional(),
  templatePayment: z.string().optional(),
  subjectReminder: z.string().optional(),
  templateReminder: z.string().optional(),
  subjectInvoice: z.string().optional(),
  templateInvoice: z.string().optional(),
  autoReminder: z.boolean().default(false),
  frequency: z.enum(["ONCE", "DAILY", "WEEKYLY", "MONTHLY", " YEARLY"]).default("ONCE").optional(),
  courseId: z.string().optional(),
  paymentStatus: z.enum(["COMPLETED", "PENDING", "FAILED"]).default("PENDING").optional(),
});

export const updateStatusFinanceSettingSchema = z.object({
  id: z.string().uuid("Invalid finance setting ID"),
  status: z.enum(["ACTIVE", "INACTIVE"], {
    required_error: "Status is required",
  }),
});

// Promotional Code Validation Schemas
export const createPromotionalCodeSchema = z.object({
  codeName: z.string().min(1, "Code name is required").max(50, "Code name must be less than 50 characters"),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "CDP"], {
    required_error: "Discount type is required",
  }),
  discountValue: z.number().min(0, "Discount value must be non-negative"),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
  courseIds: z.array(z.string().uuid()).optional(),
  maxUsage: z.number().positive().optional(),
});

export const updatePromotionalCodeSchema = z.object({
  codeName: z.string().min(1, "Code name is required").max(50, "Code name must be less than 50 characters").optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "CDP"]).optional(),
  discountValue: z.number().min(0, "Discount value must be non-negative").optional(),
  startDate: z.string().pipe(z.coerce.date()).optional(),
  endDate: z.string().pipe(z.coerce.date()).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  courseIds: z.array(z.string().uuid()).optional(),
  maxUsage: z.number().positive().optional(),
});

// Payment Record Validation Schemas
export const createPaymentRecordSchema = z
  .object({
    applicantId: z.string().uuid("Invalid application ID"),
    totalFee: z.number().positive("Total fee must be positive"),
    paymentPlan: z.enum(["FULL_PAYMENT", "INSTALLMENT"], {
      required_error: "Payment plan is required",
    }),
    totalInstallments: z.number().positive().optional(),
    nextPaymentDate: z.string().pipe(z.coerce.date()).optional(),
    nextPaymentAmount: z.number().positive().optional(),
    dueDate: z.string().pipe(z.coerce.date()).optional(),
    promotionalCodeId: z.string().uuid().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentPlan === "INSTALLMENT") {
        return data.totalInstallments && data.totalInstallments > 1;
      }
      return true;
    },
    {
      message: "Installment payment plan requires total installments > 1",
      path: ["totalInstallments"],
    },
  );

export const updatePaymentRecordSchema = z.object({
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  paidAmount: z.number().min(0).optional(),
  remainingAmount: z.number().min(0).optional(),
  installmentsPaid: z.number().min(0).optional(),
  nextPaymentDate: z.string().pipe(z.coerce.date()).optional(),
  nextPaymentAmount: z.number().positive().optional(),
  lastReminderDate: z.string().pipe(z.coerce.date()).optional(),
});

// Payment History Validation Schemas
export const createPaymentHistorySchema = z.object({
  paymentRecordId: z.string().uuid("Invalid payment record ID"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH", "ONLINE"], {
    required_error: "Payment method is required",
  }),
  status: z.enum(["PAID", "PENDING", "APPROVED", "REJECTED", "FAILED"], {
    required_error: "Payment status is required",
  }),
  paymentDate: z.string().pipe(z.coerce.date()),
  transactionId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Course Fee Validation Schemas
export const createCertificateCourseFeeSchema = z
  .object({
    courseId: z.string().uuid("Invalid course ID"),
    overallCourseFee: z.number().positive("Course fee must be positive"),
    currencyType: z.enum(["USD", "EUR", "GBP", "PKR"]).default("USD"),
    promoCodeStatus: z.enum(["ACTIVE", "INACTIVE", "UPCOMING"]).default("INACTIVE"),
    startDate: z.string().pipe(z.coerce.date()),
    endDate: z.string().pipe(z.coerce.date()),
    agreementStatus: z.boolean().default(false),
    scheduleType: z.string().optional(),
    newCourseFee: z.number().positive("Price must be positive").optional(),
    scheduleFrequency: z.string().optional(),
    effectiveDate: z.string().pipe(z.coerce.date()),
    promotionalCodes: z.array(z.string().uuid()).optional(),
    // tieredPricing: z.array(z.object({
    //   tierName: z.string().min(1, "Tier name is required"),
    //   price: z.number().positive("Price must be positive"),
    //   startDate: z.string().pipe(z.coerce.date()),
    //   endDate: z.string().pipe(z.coerce.date()),
    // })).optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateCourseFeeSchema = z
  .object({
    overallCourseFee: z.number().positive("Course fee must be positive").optional(),
    currencyType: z.enum(["USD", "EUR", "GBP", "PKR"]).optional(),
    promoCodeStatus: z.enum(["ACTIVE", "INACTIVE", "UPCOMING"]).optional(),
    startDate: z.string().pipe(z.coerce.date()).optional(),
    endDate: z.string().pipe(z.coerce.date()).optional(),
    agreementStatus: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    promotionalCodes: z.array(z.string()).optional(),
    // tieredPricing: z.array(z.object({
    //   tierName: z.string().min(1, "Tier name is required"),
    //   price: z.number().positive("Price must be positive"),
    //   startDate: z.string().pipe(z.coerce.date()),
    //   endDate: z.string().pipe(z.coerce.date()),
    // })).optional(),
    scheduleType: z.string().optional(),
    newCourseFee: z.number().positive("Price must be positive").optional(),
    scheduleFrequency: z.string().optional(),
    effectiveDate: z.string().pipe(z.coerce.date()),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );
export const updateAdvanceCourseFeeSchema = z
  .object({
    overallCourseFee: z.number().positive("Course fee must be positive").optional(),
    currencyType: z.enum(["USD", "EUR", "GBP", "PKR"]).optional(),
    promoCodeStatus: z.enum(["ACTIVE", "INACTIVE", "UPCOMING"]).optional(),
    startDate: z.string().pipe(z.coerce.date()).optional(),
    endDate: z.string().pipe(z.coerce.date()).optional(),
    agreementStatus: z.boolean().optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    // tieredPricing: z.array(z.object({
    //   tierName: z.string().min(1, "Tier name is required"),
    //   price: z.number().positive("Price must be positive"),
    //   startDate: z.string().pipe(z.coerce.date()),
    //   endDate: z.string().pipe(z.coerce.date()),
    // })).optional(),
    scheduleType: z.string().optional(),
    newCourseFee: z.number().positive("Price must be positive").optional(),
    scheduleFrequency: z.string().optional(),
    effectiveDate: z.string().pipe(z.coerce.date()),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) > new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  );

// Course Fee Structure Validation Schemas (for degree courses)
export const createCourseFeeStructureSchema = z.object({
  sessionCourseId: z.string().uuid("Invalid session course ID"),
  overallcoursefee: z.number().positive("Course fee must be positive"),
  agreementStatus: z.boolean(),
  semesters: z
    .array(
      z.object({
        semesterName: z.string().min(1, "Semester name is required"),
        semesterFee: z.number().positive("Semester fee must be positive"),
        modules: z
          .array(
            z.object({
              module: z.string().min(1, "Module name is required"),
              credit: z.number().positive("Credit must be positive"),
              fee: z.number().positive("Module fee must be positive"),
            }),
          )
          .min(1, "At least one module is required per semester"),
      }),
    )
    .min(1, "At least one semester is required"),
});

// Agent Commission Validation Schemas
export const createAgentCommissionSchema = z.object({
  applicationId: z.string().uuid("Invalid application ID"),
  baseAmount: z.number().positive("Base amount must be positive"),
  commissionRate: z.number().min(0).max(100, "Commission rate must be between 0 and 100"),
});

export const updateAgentCommissionSchema = z.object({
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID"]).optional(),
  paidAmount: z.number().min(0).optional(),
  paidDate: z.string().pipe(z.coerce.date()).optional(),
  isClawback: z.boolean().optional(),
  clawbackReason: z.string().optional(),
  clawbackDate: z.string().pipe(z.coerce.date()).optional(),
});

// Commission Payment Validation Schemas
export const createCommissionPaymentSchema = z.object({
  agentCommissionId: z.string().uuid("Invalid agent commission ID"),
  amount: z.number().positive("Amount must be positive"),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "CASH", "ONLINE"], {
    required_error: "Payment method is required",
  }),
  status: z.enum(["PAID", "PENDING", "APPROVED", "REJECTED", "FAILED"], {
    required_error: "Payment status is required",
  }),
  paymentDate: z.string().pipe(z.coerce.date()),
  transactionId: z.string().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// Query parameter validation schemas
export const paginationSchema = z.object({
  page: z.string().pipe(z.coerce.number().min(1)).optional(),
  limit: z.string().pipe(z.coerce.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const promotionalCodeFiltersSchema = z.object({
  status: z.string().optional(),
  codeName: z.string().optional(),
  discountType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  createdUserId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
});

export const paymentRecordFiltersSchema = z.object({
  status: z.string().optional(),
  paymentPlan: z.string().optional(),
  applicantId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  dueDate: z.string().optional(),
  overdue: z
    .string()
    .transform((val) => val === "true")
    .optional(),
});

export const courseFeeFiltersSchema = z.object({
  sessionCourseId: z.string().uuid().optional(),
  status: z.string().optional(),
  promoCodeStatus: z.string().optional(),
  courseType: z.string().optional(),
});

export const agentCommissionFiltersSchema = z.object({
  agentId: z.string().uuid().optional(),
  status: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const commissionPaymentFiltersSchema = z.object({
  agentId: z.string().uuid().optional(),
  status: z.string().optional(),
  paymentMethod: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
