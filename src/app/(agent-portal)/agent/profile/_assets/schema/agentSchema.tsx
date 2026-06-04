/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  optionalPhoneNumberSchema,
  usernameSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Define schema
const profileFormSchema = z.object({
  userId: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  mobile: optionalPhoneNumberSchema,
  username: usernameSchema,
  address: z.string().optional(),
  userStatus: z.string().optional(),
  companyName: z.string().optional(),
  agreementExpiryDate: z.string().optional(),
  potentialPayment: z.string().optional(),
  commissionRate: z.string().optional(),
  awardingBody: z.number().optional(),
  agreementStatus: z.boolean().optional(),
  applicationCount: z.number().optional(),
  reportingTo: z.string().optional(),
  agentName: z.string().optional(),
  potentialPayout: z.string().optional(),
  expiryDate: z.string().optional(),
  subAgentCount: z.number().optional(),
});

// Type from schema
export type AgentFormData = z.infer<typeof profileFormSchema>;

// Proper function with return
const agentDefaultValues = ({
  user,
  totalApplications,
  totalSubagents,
}: any): AgentFormData => ({
  userId: user?.id ?? "",
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  email: user?.email ?? "",
  mobile: user?.mobile ?? "",
  username: user?.username ?? "",
  address: user?.address ?? "",
  userStatus: user?.userStatus ?? "",
  companyName: user?.companyName ?? "",
  agreementExpiryDate: user?.agreementExpiryDate ?? "",
  potentialPayment: user?.potentialPayment ?? "",
  commissionRate: user?.commissionRate ?? "",
  awardingBody: user?.awardingBodyTemplates?.length ?? "",
  agreementStatus: user?.agreementStatus ?? undefined,
  applicationCount: totalApplications ?? "",
  reportingTo: user?.reportingTo ?? "",
  agentName: user?.agentName ?? "",
  potentialPayout: user?.potentialPayout ?? "",
  expiryDate: user?.expiryDate ?? "",
  subAgentCount: totalSubagents ?? "",
});

export const AgentSchema = {
  agentDefaultValues,
  profileFormSchema,
};
