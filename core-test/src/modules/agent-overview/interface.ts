export interface AwardingBodyTemplate {
  status: "ACTIVE" | "INACTIVE";
  awardingBodyId: string;
  commissionTemplateId: string;
}

export interface RoleData {
  commissionGroupId?: string;
  awardingBodyTemplates: AwardingBodyTemplate[];
}

export interface UserPortalCategoryRoleData {
  note: string;
  endDate: string;
  agentType: string;
  startDate: string;
  userStatus: string;
  companyName: string;
  commitionRate: number | null;
  agreementStatus: boolean;
  potentialPayment: number | null;
  commissionGroupId: string | null;
  commissionTemplate: string | null;
  aggrementExpiryDate: string | null;
  awardingBodyTemplates: AwardingBodyTemplate[];
}

export interface CommissionRates {
  id: string;
  studentRangeLower: number;
  studentRangeUpper: number | null;
  firstRate: number | null;
  secondRate: number | null;
  thirdRate: number | null;
  fourthRate: number | null;
  commissionGroupId: string;
}

export type AgentCommissionInfo = {
  roleData: RoleData | null;
};

export interface AgentCommissionData {
  agentId?: string;
  agentName?: string;
  commissionTier?: string;
  totalStudent?: number;
  academicSession?: string;
  clawback?: number;
  potentialCommission?: number;
  status?: string;
  commissionAmount?: number;
  paidAmount?: number;
}

export interface ApplicationWrapper {
  application: Application;
}

export interface Application {
  id: string;
  status: "PENDING" | "DRAFT" | "APPROVED" | "REJECTED" | null;
  outcome: "PENDING" | "APPROVED_UNCONDITIONAL" | "APPROVED_CONDITIONAL" | "REJECTED" | null;
  createdAt: Date | null;
  courseSelection: CourseSelection | null;
  paymentRecords: PaymentRecord[];
  agentCommissions: AgentCommissionData[];
  RegisteredStudent: RegisteredStudent[];
}

export interface CourseSelection {
  sessionId: string | null;
  awardingBody: AwardingBody | null;
  session: Session | null;
}

export interface AwardingBody {
  id: string | null;
  name: string;
}

export interface Session {
  id: string | null;
  startDate: Date | null;
}

export interface RegisteredStudent {
  id: string;
  createdAt: Date | null;
}

export interface PaymentRecord {
  id: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentPlan: "FULL_PAYMENT" | "INSTALLMENT";
  paymentStatus: "PENDING" | "PAID" | "COMPLETED" | "FAILED" | "CANCELLED" | "OVERDUE" | "REFUNDED" | "APPROVED";
  installmentsPaid: number;
  totalInstallments: number | null;
  nextPaymentDate: Date | null;
  nextPaymentAmount: number | null;
  dueDate: Date | null;
  discountApplied: number | null;
  createdAt: Date | null;
  paymentHistories: PaymentHistory[];
}

export interface PaymentHistory {
  status: "PENDING" | "PAID" | "FAILED" | "APPROVED" | "REJECTED";
  paymentDate: Date | null;
  amount: number;
  invoices: Invoice[];
}

export interface Invoice {
  invoiceAmount: number;
  invoiceStatus: "PAID" | "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
}
