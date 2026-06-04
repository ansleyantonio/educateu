import { JsonValue } from "@prisma/client/runtime/library";

export interface AwardingBodyTemplate {
  status: "ACTIVE" | "INACTIVE";
  awardingBodyId: string;
  commissionTemplateId: string;
}

export interface RoleData {
  commissionGroupId?: string;
  awardingBodyTemplates: AwardingBodyTemplate[];
}

export type AgentCommissionInfo = {
  roleData: RoleData | null;
};

export interface AgentCommissionData {
  agentId: string;
  agentName: string;
  commissionTier: string;
  totalStudent: number;
  academicSession: string;
  clawback: number;
  potentialCommission: number;
  status: string;
}

export interface AgentsResponse {
  agents: AgentCommissionData[];
  pagination: {
    count: number;
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}

export interface ModuleLesson {
  id: string;
  cModuleId: string;
  lessonId: string;
  index: number;
  createdAt: string;
  updatedAt: string;
}
export interface CourseModule {
  id: string;
  code: string;
  index: number;
  title: string;
  credit: number;
  status: string;
  faculty: string | null;
  createdAt: string;
  facultyId: string | null;
  updatedAt: string;
  courseType: string;
  moduleType: string;
  description: string;
  awardingBody: AwardingBody;
  courseFaculty: string[];
  moduleLessons: ModuleLesson[];
  awardingBodyId: string;
  semesterNumber: number;
  learningOutcome: string;
  forumOrDiscussionBoard: boolean;
  estimatedTimeToComplete: number;
}

export interface GradeInfo {
  classification: string;
  percentageRange: string;
  ukGpaEquivalent: number;
}

export interface AwardingBody {
  id: string;
  name: string;
  code?: string;
  abbreviation?: string;
  status?: string;
  intakePeriods?: string[];
  requiredDocuments?: string[];
  othersInfo?: {
    grades: GradeInfo[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseModuleMapping {
  id: string;
  index: number;
  cModule: CourseModule;
  courseId: string;
  cModuleId: string;
  createdAt: string;
  updatedAt: string;
  semesterNumber: number;
}

export interface CourseResponse {
  id: string;
  code: string;
  title: string;
  status: string;
  endDate: string;
  modules: CourseModule[];
  createdAt: string;
  startDate: string;
  updatedAt: string;
  courseType: string;
  degreeType: string;
  reviewDate: string;
  studyModes: string[];
  diplomaType: string | null;
  approvalDate: string;
  awardingBody: AwardingBody;
  courseLeader: string | null;
  hesaCourseId: string | null;
  totalCredits: number;
  courseModules: CourseModuleMapping[];
  intendedAward: string;
  awardingBodyId: string;
  durationLength: number;
  governanceNotes: string | null;
  qualificationAim: string | null;
  accreditationBody: string | null;
  courseDescription: string;
  numberOfSemesters: number;
  accreditationStatus: string | null;
  accreditationEndDate: string | null;
  accreditationBodyCode: string | null;
  accreditationStartDate: string | null;
  yearOneExpectedCredits: number;
  yearTwoExpectedCredits: number;
  yearFourExpectedCredits: number | null;
  yearThreeExpectedCredits: number;
  professionalAccreditation: string | null;
  minimumPassingCreditsPerYear: number;
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

export interface session {
  id: string;
  intakePeriod: string;
  name: string;
}

export interface invoices {
  id: string;
  invoiceNumber: string;
  invoiceStatus: string;
  invoiceAmount: number | null;
  createdAt: Date;
}

export interface PersonalInformation {
  firstName: string;
  lastName: string;
  email: string;
}

export interface CourseSelection {
  session: session | null;
  course: CourseResponse | { courseSnapshot: JsonValue } | null;
  awardingBody: AwardingBody | null;
}

export interface application {
  id: string;
  applicationId: string | null;
  status: string | null;
  personalInformation: PersonalInformation | null;
  courseSelection: CourseSelection | null;
  userPortalCategoryRoleApplications: UserPortalCategoryRoleData[];
}

export interface PaymentHistory {
  status: string;
  paymentDate: Date | null;
  amount: number;
  invoices: invoices[];
}

export interface Records {
  id: string;
  // applicationId: string;
  totalFee: number;
  paidAmount: number;
  remainingAmount: number;
  paymentPlan: string;
  paymentStatus: string;
  installmentsPaid: number;
  totalInstallments: number | null;
  nextPaymentDate: Date | null;
  nextPaymentAmount: number | null;
  dueDate: Date | null;
  discountApplied: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  application: application;
  paymentHistories: PaymentHistory[];
}
