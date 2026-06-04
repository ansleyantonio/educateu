import { z } from "zod";
import { SupportRequestStatus, SupportRequestStage } from "@prisma/client";

export enum TicketScope {
  ALL = "all",
  OWN = "own",
}

export const getWithdrawalRequestTicketReqBodySchema = z
  .object({
    status: z.nativeEnum(SupportRequestStatus).default(SupportRequestStatus.PENDING),
    page: z.coerce.number().min(1).default(1),
    pageSize: z.coerce.number().min(1).max(100).default(10),
    search: z.string().optional(),
  })
  .strict();

export const getWithdrawalRequestTicketResBodySchema = z
  .object({
    supportTickets: z.array(
      z.object({
        id: z.string().uuid(),
        tokenNo: z.string().uuid(),
        status: z.nativeEnum(SupportRequestStatus),
        stage: z.nativeEnum(SupportRequestStage),
        moduleId: z.string().uuid().nullable(),
        studentCourseId: z.string().uuid(),
        subject: z.string().min(1),
        message: z.string().min(1),
        createdAt: z.coerce.date(),
        updatedAt: z.coerce.date(),
      }),
    ),
    pagination: z.object({
      page: z.number().int().positive(),
      pageSize: z.number().int().positive(),
      totalCount: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
    }),
  })
  .strict();

const withdrawalRequestSchema = z
  .object({
    tokenId: z.string().uuid(),
  })
  .strict();

export const resolveWithdrawalRequestTicketBodySchema = withdrawalRequestSchema;
export const rejectWithdrawalRequestTicketBodySchema = withdrawalRequestSchema;

export type GetWithdrawalRequestTicketsRequestBody = z.infer<typeof getWithdrawalRequestTicketReqBodySchema>;
export type GetWithdrawalRequestTicketsResponse = z.infer<typeof getWithdrawalRequestTicketResBodySchema>;
