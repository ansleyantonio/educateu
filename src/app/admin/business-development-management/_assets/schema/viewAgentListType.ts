export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  userStatus: "PENDING" | "ACTIVE" | "DEACTIVATED" | "SUSPENDED"; // Assuming possible statuses
  address: string;
  internalReference: string | null;
  companyName: string | null;
  aggrementExpiryDate: string | null;
  potentialPayment: number | null;
  commitionRate: number | null;
  awardingBodyTemplates: { awardingBodyId: string; commissionTemplateId: string }[];
  note: string | null;
  endDate: string | null;
  agentType: string | null;
  commissionGroupId: string | null;
  startDate: string | null;
  agreementStatus: string | null;
  auditLog: string | null;
}
