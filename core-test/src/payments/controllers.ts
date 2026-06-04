import { Request, Response } from "express";
import z from "zod";
import { zodSafeParse } from "../utils/zodUtils";
import { RequestWithUser } from "../types";
import { sendSuccessResponse } from "../utils/responseUtils";
import prisma from "../prismaClient";
import { AppError } from "../utils/AppError";
import Stripe from "stripe";

const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const payNowReqQuerySchema = z.object({
  applicationId: z.string().uuid(),
  amount: z.coerce.number().positive(),
});

// Handle Stripe webhook events
const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log("🔄 [FIXED] Webhook received at:", new Date().toISOString());
  console.log("📦 [FIXED] Request body type:", typeof req.body);
  console.log("📦 [FIXED] Request body is Buffer:", Buffer.isBuffer(req.body));
  console.log("📦 [FIXED] Request body length:", req.body.length);

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  console.log("🔐 [FIXED] Webhook secret exists:", !!webhookSecret);
  console.log("📨 [FIXED] Signature exists:", !!sig);

  if (!webhookSecret) {
    console.error("❌ [FIXED] STRIPE_WEBHOOK_SECRET missing");
    throw new AppError("Stripe webhook secret not configured", "CONFIG_ERROR", 500);
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    console.log("✅ [FIXED] Webhook verified successfully!");
    console.log("🎯 [FIXED] Event type:", event.type);
    console.log("📝 [FIXED] Event ID:", event.id);

    // Process the event
    switch (event.type) {
      case "checkout.session.completed":
        console.log("💰 [FIXED] Processing checkout.session.completed");
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "payment_intent.succeeded":
        console.log("💳 [FIXED] Processing payment_intent.succeeded");
        await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;
      case "payment_intent.payment_failed":
        console.log("❌ [FIXED] Processing payment_intent.payment_failed");
        await handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      case "invoice.payment_succeeded":
        console.log("📄 [FIXED] Processing invoice.payment_succeeded");
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
      default:
        console.log("⚡ [FIXED] Unhandled event type:", event.type);
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("❌ [FIXED] Webhook verification failed:", errorMessage);
    throw new AppError(`Webhook Error: ${errorMessage}`, "WEBHOOK_ERROR", 400);
  }

  res.json({ received: true, processed: event.type });
};

// Handle successful checkout session
const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session): Promise<void> => {
  try {
    const { applicationId, paymentRecordId, courseName, paymentType } = session.metadata || {};

    if (!applicationId || !paymentRecordId) {
      console.error("Missing metadata in session:", session.metadata);
      return;
    }

    const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
    const currency = session.currency ? session.currency.toUpperCase() : "USD";

    console.log(
      `💰 Processing payment for application ${applicationId}, amount: ${currency} ${amount}, type: ${paymentType}`,
    );

    // Get the current payment record to check existing installments paid
    const currentPaymentRecord = await prisma.paymentRecord.findUnique({
      where: { id: paymentRecordId },
      select: { installmentsPaid: true, totalFee: true, paidAmount: true, paymentPlan: true, paymentStatus: true },
    });

    if (!currentPaymentRecord) {
      console.error(`Payment record not found: ${paymentRecordId}`);
      return;
    }

    // Check if this payment has already been processed by checking for duplicate transaction ID
    const existingPaymentHistory = await prisma.paymentHistory.findFirst({
      where: {
        transactionId: session.payment_intent as string,
        paymentRecordId: paymentRecordId,
      },
    });

    if (existingPaymentHistory) {
      console.log(`⚠️ Payment already processed for transaction ID: ${session.payment_intent}`);
      return; // Exit early if payment already processed
    }

    // Create payment history record first
    const paymentHistory = await prisma.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecordId,
        amount: amount,
        paymentMethod: "CARD",
        status: "PAID",
        paymentDate: new Date(),
        transactionId: session.payment_intent as string,
        reference: `STRIPE-${session.id}`,
        notes: `Payment completed for ${courseName || "course"}`,
        processedDate: new Date(),
      },
    });
    
    console.log(`✅ Payment history created for transaction: ${session.payment_intent}, amount: ${amount}`);

    // For SEMESTER payments, we need to get the course structure to determine which semester was paid
    let newInstallmentsPaid = currentPaymentRecord.installmentsPaid || 0;
    if (paymentType === "SEMESTER" && currentPaymentRecord.paymentPlan === "INSTALLMENT") {
      // For semester payments, we need to find the course structure to determine which semester was paid
      const applicationWithCourse = await prisma.application.findUnique({
        where: { id: applicationId },
        include: {
          courseSelection: {
            include: {
              course: {
                include: {
                  course: true,
                  courseFees: {
                    where: { status: "ACTIVE" },
                    include: {
                      courseFeeStructure: {
                        include: { semesters: { orderBy: { semesterOrder: "asc" } } },
                      },
                    },
                    orderBy: { createdAt: "desc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      if (applicationWithCourse) {
        const courseFee = applicationWithCourse.courseSelection?.course?.courseFees?.[0];
        const semesters = courseFee?.courseFeeStructure?.semesters || [];

        // Calculate which semester payment is being made based on payment history
        // Count all PAID payment histories for this payment record (now including the current one)
        const paidInstallments = await prisma.paymentHistory.count({
          where: {
            paymentRecordId: paymentRecordId,
            status: "PAID",
          },
        });

        newInstallmentsPaid = paidInstallments;
      }
    } else {
      // For full payments or other types, increment based on existing payment history
      const paidInstallments = await prisma.paymentHistory.count({
        where: {
          paymentRecordId: paymentRecordId,
          status: "PAID",
        },
      });

      newInstallmentsPaid = paidInstallments;
    }

    // Calculate the new paid amount (add the current payment to existing paid amount)
    const newPaidAmount = (currentPaymentRecord.paidAmount || 0) + amount;

    console.log(`📊 Updating payment record: ID=${paymentRecordId}, oldPaidAmount=${currentPaymentRecord.paidAmount}, newPaidAmount=${newPaidAmount}, totalFee=${currentPaymentRecord.totalFee}`);
    
    // Update payment record
    const updatedPaymentRecord = await prisma.paymentRecord.update({
      where: { id: paymentRecordId },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, (currentPaymentRecord.totalFee || 0) - newPaidAmount),
        paymentStatus: newPaidAmount >= (currentPaymentRecord.totalFee || 0) ? "PAID" : "PENDING",
        installmentsPaid: newInstallmentsPaid,
        dueDate: newPaidAmount >= (currentPaymentRecord.totalFee || 0) ? null : undefined, // Clear due date if fully paid
      },
    });
    
    console.log(`✅ Payment record updated: status=${updatedPaymentRecord.paymentStatus}, remaining=${updatedPaymentRecord.remainingAmount}`);

    // Update application status if needed
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: "APPROVED",
        outcome: "APPROVED_UNCONDITIONAL",
      },
    });

    console.log(`✅ Payment completed for application ${applicationId}`);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("❌ Error handling checkout session completed:", errorMessage);
    throw error;
  }
};

// Handle successful payment intent
const handlePaymentIntentSucceeded = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    console.log("Payment intent succeeded:", paymentIntent.id);
    // Additional payment success logic if needed
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error handling payment intent succeeded:", errorMessage);
  }
};

// Handle failed payment intent
const handlePaymentIntentFailed = async (paymentIntent: Stripe.PaymentIntent): Promise<void> => {
  try {
    const { paymentRecordId, applicationId } = paymentIntent.metadata || {};

    if (paymentRecordId) {
      await prisma.paymentHistory.create({
        data: {
          paymentRecordId: paymentRecordId,
          amount: paymentIntent.amount ? paymentIntent.amount / 100 : 0,
          paymentMethod: "CARD",
          status: "FAILED",
          paymentDate: new Date(),
          transactionId: paymentIntent.id,
          reference: `STRIPE-${paymentIntent.id}`,
          notes: `Payment failed: ${paymentIntent.last_payment_error?.message || "Unknown error"}`,
        },
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error handling payment intent failed:", errorMessage);
  }
};

// Handle successful invoice payment (for subscriptions)
const handleInvoicePaymentSucceeded = async (invoice: Stripe.Invoice): Promise<void> => {
  try {
    console.log("Invoice payment succeeded:", invoice.id);
    // Add subscription payment logic here if needed
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    console.error("Error handling invoice payment succeeded:", errorMessage);
  }
};

// Test webhook endpoint
const testWebhook = async (req: Request, res: Response): Promise<void> => {
  res.json({
    message: "Webhook endpoint is active",
    timestamp: new Date().toISOString(),
  });
};

// Export all controller methods
export const PayNowController = {
  handleStripeWebhook,
  handleCheckoutSessionCompleted,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  handleInvoicePaymentSucceeded,
  testWebhook,
};
