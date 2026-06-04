import { z } from 'zod';

export const sendApprovalEmailSchema = z.object({
  applicationEmail: z
    .string()
    .min(1, { message: 'Application email is required' }),
  applicantName: z.string().min(1, { message: 'Applicant name is required' }),
  approvalUrl: z.string().min(1, { message: 'Approval URL is required' }),
  rejectionUrl: z.string().min(1, { message: 'Rejection URL is required' }),
  companyName: z.string().optional(),
});

export type ISendApprovalEmailInput = z.infer<typeof sendApprovalEmailSchema>;
