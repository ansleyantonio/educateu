import { z } from "zod";

export const createBankInfoReqBodySchema = z.object({
  accountName: z.string().min(1),
  bankName: z.string().min(1),
  branchName: z.string().min(1),
  accountNumber: z.string().min(6),
  swiftCode: z.string().min(8),
  currencyType: z.enum(["USD", "EUR", "GBP", "INR"]).default("USD"),
});
export const updateBankInfoReqBodySchema = createBankInfoReqBodySchema.partial();

export const getBankInfosReqBodySchema = z.object({
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
  searchTerm: z.string().optional(),
  currencyType: z.enum(["USD", "EUR", "GBP", "INR"]).optional(),
});

export const bankInfoIdParamSchema = z.object({
  id: z.string().uuid(),
});

export type CreateBankInfoRequestBody = z.infer<typeof createBankInfoReqBodySchema>;
export type UpdateBankInfoRequestBody = z.infer<typeof updateBankInfoReqBodySchema>;
export type GetBankInfosRequestBody = z.infer<typeof getBankInfosReqBodySchema>;
