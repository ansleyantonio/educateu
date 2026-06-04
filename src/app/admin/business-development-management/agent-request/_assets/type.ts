export type PendingAgent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  username: string;
  address: string;
  userStatus: "PENDING" | string;
  emailVerified: boolean;
  internalReference: string | null;
  companyName: string | null;
  aggrementExpiryDate: string | null;
  potentialPayment: string | null;
  commitionRate: string | null;
  note: string | null;
  endDate: string | null;
  agentType: string | null;
  startDate: string | null;
  agreementStatus: boolean | null;
};

export type AgentRequest = {
  pendingAgents: PendingAgent[];
  pagination: {
    totalPendingAgents: number;
    totalPages: number;
    currentPage: number;
  };
};

export interface AgentRequestProps {
  userID: string;
  token: string;
  userStatus: "ACTIVE" | "DEACTIVATED";
}
