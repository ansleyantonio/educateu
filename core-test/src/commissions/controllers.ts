import z from "zod";
import { Response } from "express";
import { PaymentService } from "./services";
import {
  paymentGetRecordsReqBodySchema,
  commissionGetRecordsReqBodySchema,
  updateInvoiceSchema,
  createBulkInvoicesSchema,
  createInvoiceSchema,
  invoiceGetRecordsReqBodySchema,
  paymentHistoryAgentsReqBodySchema,
  updateInvoiceStatusSchema,
  updateMultipleInvoicesPaidStatusSchema,
  updatePaymentHistoryStatusSchema,
  getInvoiceSchemaWithUserIdReqBodySchema,
} from "./types";
import { zodSafeParse } from "../utils/zodUtils";
import { RequestWithUser } from "../types";
import { sendSuccessResponse } from "../utils/responseUtils";
import prisma from "../prismaClient";
import createAuditLog from "../utils/auditlog";
import { AppError } from "../utils/AppError";
import { AgentCommissionService } from "../modules/agent-overview/services";

const getPaymentRecords = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, paymentGetRecordsReqBodySchema);
  const userId = req.user?.userPortalCategory?.userId;
  if (!userId) {
    throw new AppError("User ID not found in request", "UNAUTHORIZED", 401);
  }

  const { paymentRecords, pagination } = await PaymentService.getPaymentRecords(reqBody, userId);
  sendSuccessResponse(res, paymentRecords, undefined, undefined, pagination);
};
// controllers/paymentController.ts

// const getUserInvoicesHandler = async (req: RequestWithUser, res: Response) => {
//   const userId = req.params.userId as string;
//   if (!userId) {
//     throw new AppError("User ID is required", "BAD_REQUEST", 400);
//   }

//   // const filters = {
//   //   searchTerm: req.query.searchTerm as string,
//   //   invoiceStatus: req.query.invoiceStatus as string,
//   //   dateFrom: req.query.dateFrom as string,
//   //   dateTo: req.query.dateTo as string,
//   // };

//   const invoices = await PaymentService.getUserInvoices(userId);
//   sendSuccessResponse(res, invoices.paymentRecords);
// };

const getUserInvoicesHandler = async (req: RequestWithUser, res: Response) => {
  const userId = req.params.userId as string;
  const reqBody = zodSafeParse(req.query, getInvoiceSchemaWithUserIdReqBodySchema);
  if (!userId) {
    throw new AppError("User ID is required", "BAD_REQUEST", 400);
  }
  // const filters = {
  //   searchTerm: req.query.searchTerm as string,
  //   invoiceStatus: req.query.invoiceStatus as string,
  //   dateFrom: req.query.dateFrom as string,
  //   dateTo: req.query.dateTo as string,
  // };

  const invoices = await PaymentService.getUserInvoices(userId, reqBody);
  sendSuccessResponse(res, invoices.paymentRecords);
};
const getAgentPaymentRecords = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, paymentGetRecordsReqBodySchema);
  const userId = req.params.userId as string;

  if (!userId) {
    throw new AppError("User ID is required", "BAD_REQUEST", 400);
  }

  const { paymentRecords, pagination } = await PaymentService.getPaymentRecords(reqBody, userId);

  sendSuccessResponse(res, paymentRecords, undefined, undefined, pagination);
};

const getPaymentRecordByApplication = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const paymentRecord = await PaymentService.getPaymentRecordByApplication(applicationId);

  sendSuccessResponse(res, paymentRecord);
};

const updatePaymentStatus = async (req: RequestWithUser, res: Response) => {
  const { paymentRecordId } = zodSafeParse(req.params, z.object({ paymentRecordId: z.string().uuid() }));

  const { status } = zodSafeParse(
    req.body,
    z.object({
      status: z.enum(["PENDING", "PAID", "OVERDUE", "CANCELLED", "REFUNDED"]),
    }),
  );

  const existingPayment = await prisma.paymentRecord.findUnique({
    where: { id: paymentRecordId },
    select: { paymentStatus: true, applicantId: true },
  });

  const paymentRecord = await PaymentService.updatePaymentStatus(paymentRecordId, status);

  await createAuditLog({
    userId: req.user?.userPortalCategory?.userId || "",
    action: `Updated payment status from ${existingPayment?.paymentStatus} to ${status} for application ${existingPayment?.applicantId}`,
    actionType: "payment_management",
    moduleName: "payment_management",
    courseId: existingPayment?.applicantId || "",
  });

  sendSuccessResponse(res, paymentRecord);
};

const getCommissionRecords = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, commissionGetRecordsReqBodySchema);

  const { commissionRecords, pagination } = await PaymentService.getCommissionRecords(reqBody);

  sendSuccessResponse(res, commissionRecords, undefined, undefined, pagination);
};

const getInvoices = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, invoiceGetRecordsReqBodySchema);
  const userId = req.user?.userPortalCategory?.userId;

  if (!userId) {
    throw new AppError("User ID not found in request", "UNAUTHORIZED", 401);
  }

  const { invoices, pagination } = await PaymentService.getInvoices(reqBody, userId);

  sendSuccessResponse(res, invoices, undefined, undefined, pagination);
};

const getInvoicesByApplication = async (req: RequestWithUser, res: Response) => {
  const { applicationId } = zodSafeParse(req.params, z.object({ applicationId: z.string().uuid() }));

  const invoices = await PaymentService.getInvoicesByApplication(applicationId);

  sendSuccessResponse(res, invoices);
};

const createInvoice = async (req: RequestWithUser, res: Response) => {
  const data = zodSafeParse(req.body, createInvoiceSchema);
  const userId = req.user?.userPortalCategory?.userId;

  if (!userId) {
    throw new AppError("User ID not found in request", "UNAUTHORIZED", 401);
  }

  const invoice = await PaymentService.createInvoice(data, userId);

  await createAuditLog({
    userId: userId,
    action: `Created invoice for application ${data.applicationId} with amount ${data.invoiceAmount}`,
    actionType: "invoice_creation",
    moduleName: "payment_management",
    courseId: data.applicationId,
  });

  sendSuccessResponse(res, invoice, "Invoice created successfully");
};

const createBulkInvoices = async (req: RequestWithUser, res: Response) => {
  const data = zodSafeParse(req.body, createBulkInvoicesSchema);
  const userId = req.user?.userPortalCategory?.userId;
  console.log("Bulk invoice data:", data);

  if (!userId) {
    throw new AppError("User ID not found in request", "UNAUTHORIZED", 401);
  }

  const result = await PaymentService.createBulkInvoices(data, userId);

  // Create summary dynamically
  const summary = {
    successful: result.created.length,
    failed: result.errors.length,
    total: result.created.length + result.errors.length,
  };

  await createAuditLog({
    userId: userId,
    action: `Created ${summary.successful} invoices in bulk`,
    actionType: "bulk_invoice_creation",
    moduleName: "payment_management",
    courseId: "bulk_operation",
  });

  const message =
    summary.failed === 0 ? "All invoices created successfully" : `Invoices created with ${summary.failed} errors`;

  // Attach summary to the response
  const responseData = { ...result, summary };

  sendSuccessResponse(res, responseData, message);
};

const updateInvoice = async (req: RequestWithUser, res: Response) => {
  const data = zodSafeParse(req.body, updateMultipleInvoicesPaidStatusSchema);
  const userId = req.user?.userPortalCategory?.userId;

  if (!userId) {
    throw new AppError("User ID not found in request", "UNAUTHORIZED", 401);
  }

  const result = await PaymentService.updateMultipleInvoicesPaidStatus(data);

  // Create audit log
  await createAuditLog({
    userId: userId,
    action: `Updated is_paid status to ${data.is_paid} for ${result.updatedCount} invoices`,
    actionType: "bulk_invoice_paid_status_update",
    moduleName: "payment_management",
    courseId: "bulk_operation",
  });

  const message = `Successfully updated is_paid status for ${result.updatedCount} invoices`;
  sendSuccessResponse(res, result, message);
};

const getInvoiceById = async (req: RequestWithUser, res: Response) => {
  const { invoiceId } = zodSafeParse(req.params, z.object({ invoiceId: z.string() }));

  const invoice = await PaymentService.getInvoiceById(invoiceId);

  sendSuccessResponse(res, invoice);
};
const getAgentsFromPaymentHistory = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, paymentHistoryAgentsReqBodySchema);

  // const { agents, pagination } = await PaymentService.getAgentsFromPaymentHistory(reqBody);
  const { agents, pagination } = await PaymentService.getInvoicesForAgentsFromApplication(reqBody);
  //
  sendSuccessResponse(res, agents, undefined, undefined, pagination);
};

const getAllPaymentRecords = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.query, paymentGetRecordsReqBodySchema);

  const { paymentRecords, pagination } = await PaymentService.getAllPaymentRecords(reqBody);

  sendSuccessResponse(res, paymentRecords, undefined, undefined, pagination);
};

const updateInvoiceStatus = async (req: RequestWithUser, res: Response) => {
  const body = zodSafeParse(req.body, updateInvoiceStatusSchema);

  if (!req.user) {
    throw new AppError("User not found in request", "UNAUTHORIZED", 401);
  }

  const result = await PaymentService.updateInvoiceStatus({
    ...body,
    processedBy: req.user.id,
  });

  sendSuccessResponse(res, result, "Invoice status updated successfully");
};

const updatePaymentHistoryStatus = async (req: RequestWithUser, res: Response) => {
  const reqBody = zodSafeParse(req.body, updatePaymentHistoryStatusSchema);

  const { paymentHistory } = await PaymentService.updatePaymentHistoryStatus(reqBody);

  sendSuccessResponse(res, paymentHistory, "Payment history status updated successfully");
};

export const PaymentController = {
  getPaymentRecords,
  getPaymentRecordByApplication,
  updatePaymentStatus,
  getCommissionRecords,
  getAgentPaymentRecords,
  getInvoices,
  getInvoicesByApplication,
  createInvoice,
  createBulkInvoices,
  updateInvoice,
  getInvoiceById,
  getAgentsFromPaymentHistory,
  getAllPaymentRecords,
  updateInvoiceStatus,
  getUserInvoicesHandler,
  updatePaymentHistoryStatus,
};
