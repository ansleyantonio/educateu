/*
 * Payment module type definitions
 *
 * This file contains all TypeScript interfaces and types used throughout
 * the payment module, including promotional codes, payment records, course fees,
 * agent commissions, and API request/response types.
 *
 */

export interface UpdateSettingsFinanceSettingsData {
  id: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateFinanceSettingsData {
  discountName?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  subjectEmail?: string;
  templateEmail?: string;
  subjectPayment?: string;
  templatePayment?: string;
  subjectReminder?: string;
  templateReminder?: string;
  subjectInvoice?: string;
  templateInvoice?: string;
  autoReminder?: boolean;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  courseId?: string;
  paymentStatus?: string;
}

export interface UpdateFinanceSettingsData {
  discountName?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  subjectEmail?: string;
  templateEmail?: string;
  subjectPayment?: string;
  templatePayment?: string;
  subjectReminder?: string;
  templateReminder?: string;
  subjectInvoice?: string;
  templateInvoice?: string;
  autoReminder?: boolean;
  frequency: "ONCE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
  courseId?: string;
  paymentStatus: "COMPLETED" | "PENDING" | "FAILED";
}

export interface PromotionalCodeFilters {
  status?: string;
  codeName?: string;
  discountType?: string;
  startDate?: string;
  endDate?: string;
  createdUserId?: string;
  courseId?: string;
  search?: string;
}

export interface CreatePromotionalCodeData {
  codeName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "CDP";
  discountValue: number;
  startDate: Date;
  endDate: Date;
  status: "ACTIVE" | "INACTIVE";
  courseIds?: string[];
  maxUsage?: number;
}

export interface UpdatePromotionalCodeData {
  codeName?: string;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT" | "CDP";
  discountValue?: number;
  startDate?: Date;
  endDate?: Date;
  status?: "ACTIVE" | "INACTIVE";
  courseIds?: string[];
  maxUsage?: number;
}

export interface PromotionalCodeResponse {
  id: string;
  codeName: string;
  discountValue: number;
  startDate: string;
  endDate: string;
  createdUser: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  maxUsage: number | null;
  courseList: {
    courseType: string;
    courseName: string;
    startDate: string;
    endDate: string;
  }[];
}

export interface PaymentRecordFilters {
  status?: string;
  paymentPlan?: string;
  applicantId?: string;
  courseId?: string;
  dueDate?: string;
  overdue?: boolean;
}

export interface FinanceSettingsFilters {
  discountType?: string;
  paymentStatus?: string;
  search?: string;
}

export interface CreatePaymentRecordData {
  applicantId: string;
  totalFee: number;
  paymentPlan: "FULL_PAYMENT" | "INSTALLMENT";
  totalInstallments?: number;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  dueDate?: Date;
  promotionalCodeId?: string;
}

export interface UpdatePaymentRecordData {
  paymentStatus?: "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  paidAmount?: number;
  remainingAmount?: number;
  installmentsPaid?: number;
  nextPaymentDate?: Date;
  nextPaymentAmount?: number;
  lastReminderDate?: Date;
}

export interface PaymentRecordResponse {
  id: number;
  applicantId: string;
  firstName: string;
  course: string;
  paymentPlan: string;
  paymentStatus: string;
  dueDate: string;
  lastReminder: string;
  totalFee: number;
  paidAmount: number;
  installmentsPaid: number;
  nextPayment: {
    date: string;
    amount: number;
  } | null;
  paymentHistory: {
    date: string;
    amount: number;
    method: string;
    status: string;
  }[];
}

export interface CreatePaymentHistoryData {
  paymentRecordId: string;
  amount: number;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "ONLINE";
  status: "PAID" | "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  paymentDate: Date;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface CourseFeeFilters {
  courseType?: string;
  search?: string;
  courseId?: string;
  status?: string;
  promoCodeStatus?: string;
}

export interface AdvanceCourseFeeFilters {
  sessionCourseId?: string;
  status?: string;
  promoCodeStatus?: string;
  courseType?: string;
  search?: string;
}

export interface PromotionalCodeInfo {
  id: string;
  promotionalCodeId: string;
  codeName: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT" | "CDP";
  discountValue: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED";
  startDate: Date;
  endDate: Date | null;
}

export interface CreateCertificateCourseFeeData {
  courseId: string;
  overallCourseFee: number;
  currencyType?: "USD" | "EUR" | "GBP" | "PKR";
  promoCodeStatus?: "ACTIVE" | "INACTIVE" | "UPCOMING";
  startDate: Date;
  endDate: Date;
  agreementStatus?: boolean;
  scheduleType?: string; // Immediate or Scheduled
  newCourseFee?: number; // New course fee for scheduled changes
  scheduleFrequency?: string; // One-time or Recurring
  effectiveDate?: Date; // When the change takes effect
  promotionalCodes?: string[]; // Array of PromotionalCode IDs (not PromotionalCodeCourse IDs)
  // tieredPricing?: {
  //   tierName: string;
  //   price: number;
  //   startDate: Date;
  //   endDate: Date;
  // }[];
}

export interface CreateCourseFeeData {
  sessionCourseId: string;
  overallCourseFee: number;
  currencyType?: "USD" | "EUR" | "GBP" | "PKR";
  promoCodeStatus?: "ACTIVE" | "INACTIVE" | "UPCOMING";
  startDate: Date;
  endDate: Date;
  agreementStatus?: boolean;
  scheduleType?: string; // Immediate or Scheduled
  newCourseFee?: number; // New course fee for scheduled changes
  scheduleFrequency?: string; // One-time or Recurring
  effectiveDate?: Date; // When the change takes effect
  promotionalCodes?: string[]; // Associated promotional code IDs
  // tieredPricing?: {
  //   tierName: string;
  //   price: number;
  //   startDate: Date;
  //   endDate: Date;
  // }[];
}

export interface UpdateCourseFeeData {
  overallCourseFee?: number;
  currencyType?: "USD" | "EUR" | "GBP" | "PKR";
  promoCodeStatus?: "ACTIVE" | "INACTIVE" | "UPCOMING";
  startDate?: Date;
  endDate?: Date;
  agreementStatus?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  scheduleType?: string; // Immediate or Scheduled
  newCourseFee?: number; // New course fee for scheduled changes
  scheduleFrequency?: string; // One-time or Recurring
  effectiveDate?: Date; // When the change takes effect
  promotionalCodes?: string[]; // Optional: Update promotional code associations
}

export interface UpdateAdvanceCourseFeeData {
  overallCourseFee?: number;
  currencyType?: "USD" | "EUR" | "GBP" | "PKR";
  promoCodeStatus?: "ACTIVE" | "INACTIVE" | "UPCOMING";
  startDate?: Date;
  endDate?: Date;
  agreementStatus?: boolean;
  status?: "ACTIVE" | "INACTIVE";
  scheduleType?: string; // Immediate or Scheduled
  newCourseFee?: number; // New course fee for scheduled changes
  scheduleFrequency?: string; // One-time or Recurring
  effectiveDate?: Date; // When the change takes effect
  tieredPricing?: {
    tierName: string;
    price: number;
    startDate: Date;
    endDate: Date;
  }[];
}

export interface CourseFeeResponse {
  id: string;
  courseId?: string;
  courseName: string;
  overallCourseFee: number;
  scheduleType: string;
  newCourseFee: number;
  scheduleFrequency: string;
  promotionalCodes: PromotionalCodeInfo[]; // Array of promotional code details
  startDate: string;
  endDate: string;
  currencyType: string;
  promoCodeStatus: string;
  createdAt: string;
  updatedAt: string;
  // courseFeeLogHistory?: CourseFeeLogEntry[];
  // tieredPricing?: TieredPricingInfo[];
}

export interface CreateCourseFeeStructureData {
  sessionCourseId: string;
  overallcoursefee: number;
  agreementStatus: boolean;
  semesters: {
    semesterName: string;
    semesterFee: number;
    modules: {
      module: string;
      credit: number;
      fee: number;
    }[];
  }[];
}

export interface AgentCommissionFilters {
  agentId?: string;
  status?: string;
  applicationId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateAgentCommissionData {
  applicationId: string;
  baseAmount: number;
  commissionRate: number;
}

export interface UpdateAgentCommissionData {
  status?: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  paidAmount?: number;
  paidDate?: Date;
  isClawback?: boolean;
  clawbackReason?: string;
  clawbackDate?: Date;
}

export interface AgentOverviewData {
  id: number;
  tag: string;
  amount: string;
  progress: string;
}

export interface CommissionPaymentFilters {
  agentId?: string;
  status?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateCommissionPaymentData {
  agentCommissionId: string;
  amount: number;
  paymentMethod: "CARD" | "BANK_TRANSFER" | "CASH" | "ONLINE";
  status: "PAID" | "PENDING" | "APPROVED" | "REJECTED" | "FAILED";
  paymentDate: Date;
  transactionId?: string;
  reference?: string;
  notes?: string;
}

export interface PendingCommissionPaymentResponse {
  id: string;
  applicationId: string;
  semesterName: string;
  semesterNumber: number;
  receiptUrl: string | null;
  paymentStatus: string;
  amount: number;
  paymentDate: string;
  firstName: string;
  lastName: string;
  courseName: string;
}

export interface OverviewCardData {
  id: number;
  title?: string;
  tag?: string;
  amount: string;
  progress: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ApiResponse<T> {
  status: string;
  statusCode: number;
  message: string;
  data: T;
  pagination?: {
    count: number;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
