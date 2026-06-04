import { Router } from "express";

import { PaymentController } from "./controllers";
import { asyncWrapper } from "../utils/asyncWrapper";
import { AgentCommissionController } from "../modules/payment/controllers";

const AgentCommissionPaymentRouter = Router();

AgentCommissionPaymentRouter.get("/", asyncWrapper(PaymentController.getPaymentRecords));
AgentCommissionPaymentRouter.get("/user/:userId", asyncWrapper(PaymentController.getUserInvoicesHandler));
AgentCommissionPaymentRouter.get("/:applicationId", asyncWrapper(PaymentController.getPaymentRecordByApplication));
AgentCommissionPaymentRouter.post(
  "/payment-status/:paymentRecordId",
  asyncWrapper(PaymentController.updatePaymentStatus),
);

AgentCommissionPaymentRouter.get("/commission-records", asyncWrapper(PaymentController.getCommissionRecords));

AgentCommissionPaymentRouter.post("/", asyncWrapper(PaymentController.createInvoice));
AgentCommissionPaymentRouter.get("/invoices/get", asyncWrapper(PaymentController.getInvoices));
AgentCommissionPaymentRouter.get("/invoices/agents", asyncWrapper(PaymentController.getAgentsFromPaymentHistory));
AgentCommissionPaymentRouter.post("/bulk-generate", asyncWrapper(PaymentController.createBulkInvoices));
AgentCommissionPaymentRouter.get("/invoices/:invoiceId", asyncWrapper(PaymentController.getInvoiceById));
AgentCommissionPaymentRouter.patch("/invoices/bulk-update", asyncWrapper(PaymentController.updateInvoice));
AgentCommissionPaymentRouter.get(
  "/application/:applicationId",
  asyncWrapper(PaymentController.getInvoicesByApplication),
);

AgentCommissionPaymentRouter.patch("/invoices/update/all", asyncWrapper(PaymentController.updateInvoiceStatus));

AgentCommissionPaymentRouter.get("/all-payments/history", asyncWrapper(PaymentController.getAllPaymentRecords));
AgentCommissionPaymentRouter.get(
  "/manual-payments/pending",
  asyncWrapper(AgentCommissionController.getPendingCommissionPayments),
);

AgentCommissionPaymentRouter.post(
  "/update-payment/history",
  asyncWrapper(PaymentController.updatePaymentHistoryStatus),
);

export default AgentCommissionPaymentRouter;
