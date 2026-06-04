import z from "zod";

export const paymentGetRecordsReqBodySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().default(10),
  searchTerm: z.string().optional(),
  agentId: z.string().uuid().optional(),
  subAgentId: z.string().uuid().optional(),
  awardingBodyId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  paymentStatus: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]).optional(),
  commissionStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortColumn: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const commissionGetRecordsReqBodySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().default(10),
  searchTerm: z.string().optional(),
  agentId: z.string().uuid().optional(),
  commissionStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID"]).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

export type PaymentGetRecordsRequestBody = z.infer<typeof paymentGetRecordsReqBodySchema>;
export type CommissionGetRecordsRequestBody = z.infer<typeof commissionGetRecordsReqBodySchema>;

export const createInvoiceSchema = z.object({
  applicationId: z.string().uuid(),
  requestedPayout: z.number().positive(),
  notes: z.string().optional(),
});

export const getInvoiceSchemaWithUserIdReqBodySchema = z.object({
  sessionId: z.string().uuid().optional(),
});

export type GetInvoiceWithUserIdBody = z.infer<typeof getInvoiceSchemaWithUserIdReqBodySchema>;

export const createBulkInvoicesSchema = z.array(createInvoiceSchema);

export const updateInvoiceSchema = z.object({
  invoiceStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID", "CANCELLED"]).optional(),
  invoiceAmount: z.number().positive().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type CreateBulkInvoicesInput = z.infer<typeof createBulkInvoicesSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

// Query schemas
export const getInvoicesQuerySchema = z.object({
  applicationId: z.string().uuid().optional(),
  invoiceStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID", "CANCELLED"]).optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
  searchTerm: z.string().optional(),
});

export type GetInvoicesQuery = z.infer<typeof getInvoicesQuerySchema>;
export const invoiceGetRecordsReqBodySchema = z.object({
  applicationId: z.string().uuid().optional(),
  invoiceStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID", "CANCELLED"]).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  searchTerm: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});
export type InvoiceGetRecordsRequestBody = z.infer<typeof invoiceGetRecordsReqBodySchema>;
export const paymentHistoryAgentsReqBodySchema = z.object({
  searchTerm: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(10),
});

export type PaymentHistoryAgentsRequestBody = z.infer<typeof paymentHistoryAgentsReqBodySchema>;

export const updateInvoiceStatusSchema = z.object({
  invoiceIds: z.array(z.string()).min(1, "At least one invoice ID is required"),
  invoiceStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID", "CANCELLED"]),
  notes: z.string().optional(),
});

export const ManualPaymentSchema = z.object({
  accountNo: z.string().min(1, "Account No is required"),
  accountName: z.string().min(1, "Account Name is required"),
  referenceNo: z.string().min(1, "Reference No is required"),
  currency: z.enum(["USD", "GBP", "EURO", "BDT"], {
    required_error: "Currency is required",
  }),
  applicationId: z.string().uuid("Invalid Application ID"),
  amount: z.number().positive("Amount must be greater than 0"),
  receipts: z.array(z.string().min(1, "Receipt URL cannot be empty")).min(1, "Please upload at least one receipt"),
});

export type UpdateInvoiceStatusInput = z.infer<typeof updateInvoiceStatusSchema> & {
  processedBy: string;
};
export const updateMultipleInvoicesPaidStatusSchema = z.object({
  invoiceIds: z.array(z.string().uuid()).min(1, "At least one invoice ID is required"),
  invoiceStatus: z.enum(["PENDING", "APPROVED", "REJECTED", "PAID", "CANCELLED"]),
});

export type UpdateMultipleInvoicesPaidStatusInput = z.infer<typeof updateMultipleInvoicesPaidStatusSchema>;

export const updatePaymentHistoryStatusSchema = z.object({
  id: z.string().uuid("Invalid payment history ID"),
  status: z.enum(["PAID", "PENDING", "APPROVED", "REJECTED", "FAILED"]),
});

export type UpdatePaymentHistoryStatusInput = z.infer<typeof updatePaymentHistoryStatusSchema>;
