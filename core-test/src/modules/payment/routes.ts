/*
 * Payment module routes
 *
 * This file defines all HTTP routes for payment operations including
 * promotional codes, payment records, course fees, and agent commissions.
 * All routes are protected by authentication middleware.
 *
 */

import { Router } from "express";
import { asyncWrapper } from "../../utils/asyncWrapper";
import {
  PromotionalCodeController,
  PaymentRecordController,
  CourseFeeController,
  AgentCommissionController,
  FinanceSettingController,
} from "./controllers";
import { Controllers } from "../../controllers";
import { CourseController } from "../course/controllers";

const router = Router();
const certificateRouter = Router();
const advancedRouter = Router();
const commissionPaymentRouter = Router();
const promotionalCodeRouter = Router();
const agentOverviewRouter = Router();
const advancedPaymentRouter = Router();
const financeSettingsRouter = Router();

financeSettingsRouter.get("/", asyncWrapper(FinanceSettingController.getFinanceSettings));
financeSettingsRouter.post("/create", asyncWrapper(FinanceSettingController.createFinanceSettings));
financeSettingsRouter.patch("/:id", asyncWrapper(FinanceSettingController.updateFinanceSettings));
financeSettingsRouter.post("/status", asyncWrapper(FinanceSettingController.updateStatusFinanceSettings));

// ============================================================================
// PROMOTIONAL CODE ROUTES
// ============================================================================

// GET /promotional-codes - Get promotional codes with filtering and pagination
// Query parameters: page, limit, status, codeName, discountType, startDate, endDate, createdUserId, courseId
promotionalCodeRouter.get("/promotional-codes", asyncWrapper(PromotionalCodeController.getPromotionalCodes));

// GET /promotional-codes/:id - Get promotional code by ID
promotionalCodeRouter.get("/promotional-codes/:id", asyncWrapper(PromotionalCodeController.getPromotionalCodeById));

// POST /promotional-codes - Create new promotional code
// Body: { codeName, discountType, discountValue, startDate, endDate, status, courseIds?, maxUsage? }
promotionalCodeRouter.post("/promotional-codes", asyncWrapper(PromotionalCodeController.createPromotionalCode));

// PUT /promotional-codes/:id - Update promotional code
// Body: Partial promotional code data
promotionalCodeRouter.put("/promotional-codes/:id", asyncWrapper(PromotionalCodeController.updatePromotionalCode));

// DELETE /promotional-codes/:id - Soft delete promotional code (set status to INACTIVE)
promotionalCodeRouter.delete("/promotional-codes/:id", asyncWrapper(PromotionalCodeController.deletePromotionalCode));

// ============================================================================
// PAYMENT RECORD ROUTES (Applicant Payments)
// ============================================================================

// GET /applicant-payments - Get applicant payment records with filtering and pagination
// Query parameters: page, limit, status, paymentPlan, applicantId, courseId, dueDate, overdue
router.get("/applicant-payments", asyncWrapper(PaymentRecordController.getPaymentRecords));

// POST /applicant-payments - Create new payment record
// Body: { applicantId, totalFee, paymentPlan, totalInstallments?, nextPaymentDate?, nextPaymentAmount?, dueDate?, promotionalCodeId? }
router.post("/applicant-payments", asyncWrapper(PaymentRecordController.createPaymentRecord));

// PUT /applicant-payments/:id - Update payment record (e.g., update status for check status feature)
// Body: Partial payment record data
router.put("/applicant-payments/:id", asyncWrapper(PaymentRecordController.updatePaymentRecord));

// POST /payment-history - Add payment history entry
// Body: { paymentRecordId, amount, paymentMethod, status, paymentDate, transactionId?, reference?, notes? }
router.post("/payment-history", asyncWrapper(PaymentRecordController.addPaymentHistory));

// GET /applications/:applicationId/payment-history - Get payment history by application ID
router.get(
  "/applications/payment-history/:applicationId",
  asyncWrapper(PaymentRecordController.getPaymentHistoryByApplication),
);

// GET /applications/payment-history/email/:email - Get payment history by email address
router.get(
  "/applications/payment-history/email/:email",
  asyncWrapper(PaymentRecordController.getPaymentHistoryByEmail),
);

router.delete(
  "/applications/payments/:applicationId",
  asyncWrapper(PaymentRecordController.deletePaymentByApplication),
);

// GET /payment-overview - Get payment overview statistics for advance payment system

// ============================================================================
// COURSE FEE ROUTES
// ============================================================================

// GET /course-fees - Get course fees (both advance degree and diploma)
// Query parameters: page, limit, courseId, sessionId, status, promoCodeStatus, courseType
certificateRouter.get("/course-fees", asyncWrapper(CourseFeeController.getAllCourseFees));

// POST /course-fees - Create course fee with tiered pricing
// Body: { courseId, sessionId?, overallCourseFee, currencyType?, promoCodeStatus?, startDate, endDate, agreementStatus?, tieredPricing? }
certificateRouter.post("/course-fees", asyncWrapper(CourseFeeController.createCertificateCourseFee));

certificateRouter.post("/courses", asyncWrapper(CourseController.getCourses));

// PUT /course-fees/:id - Update course fee with tiered pricing
// Body: { overallCourseFee?, currencyType?, promoCodeStatus?, startDate?, endDate?, agreementStatus?, tieredPricing? }
certificateRouter.put("/course-fees/:id", asyncWrapper(CourseFeeController.updateCourseFee));
advancedRouter.put("/course-fees/:id", asyncWrapper(CourseFeeController.updateAdvanceCourseFee));

// GET /course-fees/by-course-session - Get course fee by course and session (for degree course creation page)
// Query parameters: courseId, sessionId
certificateRouter.get(
  "/course-fees/by-course-session",
  asyncWrapper(CourseFeeController.getCourseFeeByCourseAndSession),
);

// POST /course-fees/degree-structure - Create course fee structure for degree courses
// Body: { session, course, overallcoursefee, agreementStatus, semesters: [{ semesterName, semesterFee, modules: [{ module, credit, fee }] }] }
certificateRouter.post("/course-fees/degree-structure", asyncWrapper(CourseFeeController.createCourseFeeStructure));
advancedRouter.post("/course-fees/degree-structure", asyncWrapper(CourseFeeController.createCourseFeeStructure));

// Separate routes for different course types (following the requirement)

// GET /course-fees/advance-degree - Get advance degree course fees
advancedRouter.get("/payment-overview", asyncWrapper(PaymentRecordController.getPaymentOverview));
advancedRouter.get("/course-fees/advance-degree", asyncWrapper(CourseFeeController.getDegreeCourseFees));

// GET /course-fees/advance-diploma - Get advance diploma course fees
//
advancedRouter.get("/course-fees/advance-diploma", asyncWrapper(CourseFeeController.getDiplomaCourseFees));

// POST /course-fees/advance-degree - Create advance degree course fee
advancedRouter.post("/course-fees/advance-degree", asyncWrapper(CourseFeeController.createCourseFeeStructure));

// POST /course-fees/advance-diploma - Create advance diploma course fee
advancedRouter.post("/course-fees/advance-diploma", asyncWrapper(CourseFeeController.createCourseFeeStructure));

// ============================================================================
// AGENT COMMISSION ROUTES
// ============================================================================

// GET /agent-overview - Get agent overview statistics
agentOverviewRouter.get("/agent-overview", asyncWrapper(AgentCommissionController.getAgentOverview));

// GET /agent-overview/data - Get agent overview table data (same as commission payments)
agentOverviewRouter.get("/agent-overview/data", asyncWrapper(AgentCommissionController.getAgentCommissions));

// GET /agent-commissions - Get agent commissions with filtering and pagination
// Query parameters: page, limit, agentId, status, applicationId, dateFrom, dateTo
router.get("/agent-commissions", asyncWrapper(AgentCommissionController.getAgentCommissions));

// POST /agent-commissions - Create new agent commission
// Body: { agentId, applicationId, baseAmount, commissionRate }
router.post("/agent-commissions", asyncWrapper(AgentCommissionController.createAgentCommission));

// PUT /agent-commissions/:id - Update agent commission
// Body: Partial agent commission data
router.put("/agent-commissions/:id", asyncWrapper(AgentCommissionController.updateAgentCommission));

// POST /commission-payments - Create commission payment
// Body: { agentCommissionId, amount, paymentMethod, status, paymentDate, transactionId?, reference?, notes? }
commissionPaymentRouter.post("/commission-payments", asyncWrapper(AgentCommissionController.createCommissionPayment));

// GET /commission-payments - Get commission payment records (same format as agent commissions)
commissionPaymentRouter.get("/commission-payments", asyncWrapper(AgentCommissionController.getCommissionPayments));

// ============================================================================
// ADDITIONAL OVERVIEW ROUTES
// ============================================================================

// GET /overview/advance-degree - Get overview data for advance degree payments
router.get("/overview/advance-degree", asyncWrapper(PaymentRecordController.getPaymentOverview));

// GET /overview/advance-diploma - Get overview data for advance diploma payments
router.get("/overview/advance-diploma", asyncWrapper(PaymentRecordController.getPaymentOverview));

export {
  router as paymentRouter,
  certificateRouter,
  advancedRouter,
  commissionPaymentRouter,
  promotionalCodeRouter,
  agentOverviewRouter,
  advancedPaymentRouter,
  financeSettingsRouter,
};
