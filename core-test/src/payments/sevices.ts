// services/stripePaymentService.ts
import { Request, Response } from "express";
import prisma from "../prismaClient";
import {
  createCheckoutSessionData,
  CheckoutSessionResult,
  SavePaymentResult,
  VerifyPaymentResult,
  ManualPaymentForm,
} from "./schema";
import { AppError } from "../utils/AppError";
import Stripe from "stripe";
import createAuditLog from "../utils/auditlog";
import { sendEnrollmentEmail } from "../modules/student-management/mail/enrollMail";
import { sendEnrollmentNotification } from "../utils/notificationService";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new AppError("STRIPE_SECRET_KEY is not defined in environment variables", "CONFIG_ERROR", 500);
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

export default stripe;

const createCheckoutSession = async (data: createCheckoutSessionData): Promise<CheckoutSessionResult> => {
  try {
    const { applicationId, paymentRecordId, amount, currency, paymentType, courseName, customerEmail } = data;

    const paymentRecord = await prisma.paymentRecord.findUnique({
      where: { id: paymentRecordId },
      include: {
        application: {
          include: {
            personalInformation: true,
          },
        },
      },
    });

    if (!paymentRecord) {
      throw new AppError("Payment record not found", "NOT_FOUND", 404);
    }

    // Check for duplicate pending payment
    const existingPendingPayment = await prisma.paymentHistory.findFirst({
      where: {
        paymentRecordId: paymentRecordId,
        amount: amount,
        status: "PENDING",
      },
    });

    if (existingPendingPayment) {
      throw new AppError(
        "Already in PENDING condition. Duplicate payment not allowed.",
        "BAD_REQUEST",
        400,
      );
    }

    const amountInCents = Math.round(amount * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `${courseName} - ${paymentType === "FULL" ? "Full Payment" : "First Semester"}`,
              description: `Payment for application ${applicationId}`,
              metadata: {
                applicationId,
                courseName,
              },
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // success_url: `${process.env.BACKEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}&application_id=${applicationId}&payment_record_id=${paymentRecordId}`,
      // cancel_url: `${process.env.BACKEND_URL}/payment/canceled?application_id=${applicationId}`,
      success_url: `${process.env.BACKEND_URL}/stripe-payments/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.BACKEND_URL}/stripe-payments/payment-canceled?application_id=${applicationId}`,

      metadata: {
        applicationId,
        paymentRecordId,
        paymentType: paymentType || "FULL",
        courseName: courseName || "",
        amount: amount.toString(),
        currency: currency || "USD",
      },
      customer_email: customerEmail || paymentRecord.application.personalInformation?.email,
    });
    // await createAuditLog({
    //   action: "CREATE_CHECKOUT_SESSION",
    //   description: `Created checkout session for application ID: ${applicationId}`,
    //   userId: paymentRecord?.application?.applicantId,
    // });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new AppError(`Failed to create checkout session: ${errorMessage}`, "STRIPE_ERROR", 500);
  }
};

const savePaymentData = async (sessionId: string): Promise<SavePaymentResult> => {
  try {
    if (!sessionId) {
      throw new AppError("Session ID is required", "VALIDATION_ERROR", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    if (session.payment_status !== "paid") {
      throw new AppError("Payment was not successful", "PAYMENT_FAILED", 400);
    }

    const { applicationId, paymentRecordId, paymentType, amount, currency, courseName, createPaymentRecord } =
      session.metadata as Record<string, string>;

    const paymentAmount = parseFloat(amount);

    // Check if this payment has already been processed by checking for duplicate transaction ID
    const existingPaymentHistory = await prisma.paymentHistory.findFirst({
      where: {
        transactionId: typeof session.payment_intent === "object" ? session.payment_intent?.id || "" : "",
        paymentRecordId: paymentRecordId,
      },
    });

    if (existingPaymentHistory) {
      console.log(`⚠️ Payment already processed for transaction ID: ${session.payment_intent}`);

      // Return the existing payment record and history
      const existingRecord = await prisma.paymentRecord.findUnique({
        where: { id: paymentRecordId },
      });

      if (!existingRecord) {
        throw new AppError("Payment record not found", "NOT_FOUND", 404);
      }

      const existingHistory = await prisma.paymentHistory.findFirst({
        where: {
          transactionId: typeof session.payment_intent === "object" ? session.payment_intent?.id || "" : "",
          paymentRecordId: paymentRecordId,
        },
      });

      return {
        paymentRecord: existingRecord,
        paymentHistory: existingHistory!,
        session: {
          amount: paymentAmount,
          currency: currency,
          paymentType: paymentType,
          courseName: courseName,
          paymentStatus: session.payment_status,
        },
      };
    }

    const result = await prisma.$transaction(
      async (tx) => {
        // ✅ CHECK IF PAYMENT RECORD ALREADY EXISTS
        let currentRecord = await tx.paymentRecord.findUnique({
          where: { id: paymentRecordId },
        });

        // ✅ CREATE PAYMENT RECORD ONLY IF IT DOESN'T EXIST AND PAYMENT IS SUCCESSFUL
        if (!currentRecord && createPaymentRecord === "true") {
          currentRecord = await tx.paymentRecord.create({
            data: {
              id: paymentRecordId,
              applicantId: applicationId,
              totalFee: paymentAmount,
              paidAmount: paymentAmount,
              remainingAmount: 0,
              paymentPlan: paymentType === "FULL" ? "FULL_PAYMENT" : "INSTALLMENT",
              paymentStatus: "PAID",
              installmentsPaid: 1,
              totalInstallments: 1,
              nextPaymentDate: null,
              nextPaymentAmount: 0,
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else if (currentRecord) {
          // Update existing record
          const newPaidAmount = currentRecord.paidAmount + paymentAmount;
          const newRemainingAmount = currentRecord.totalFee - newPaidAmount;

          let paymentStatus = currentRecord.paymentStatus;
          if (newRemainingAmount <= 0) {
            paymentStatus = "PAID";
          } else if (newPaidAmount > 0) {
            paymentStatus = "PENDING";
          }

          // Calculate new installments paid based on payment history
          const paidInstallments = await tx.paymentHistory.count({
            where: {
              paymentRecordId: paymentRecordId,
              status: "PAID",
            },
          });

          currentRecord = await tx.paymentRecord.update({
            where: { id: paymentRecordId },
            data: {
              paidAmount: newPaidAmount,
              remainingAmount: newRemainingAmount,
              paymentStatus: paymentStatus,
              installmentsPaid: paidInstallments,
            },
          });
        }

        if (!currentRecord) {
          throw new AppError("Payment record not found or could not be created", "NOT_FOUND", 404);
        }

        // ✅ CREATE PAYMENT HISTORY ONLY FOR SUCCESSFUL PAYMENT
        const paymentHistory = await tx.paymentHistory.create({
          data: {
            paymentRecordId: paymentRecordId,
            amount: paymentAmount,
            paymentMethod: "ONLINE",
            status: "PAID",
            paymentDate: new Date(),
            transactionId: typeof session.payment_intent === "object" ? session.payment_intent?.id || "" : "",
            reference: `STRIPE-${session.id}`,
            notes: `Payment processed via Stripe - ${paymentType}`,
            payment_status: true,
          },
        });

        return {
          paymentRecord: currentRecord,
          paymentHistory,
          applicationId,
          paymentType,
          newRemainingAmount: currentRecord.remainingAmount,
          currency: currency,
          courseName: courseName,
          amount: paymentAmount,
          stripePaymentStatus: session.payment_status,
        };
      },
      {
        timeout: 15000,
      },
    );

    // Update application status if fully paid
    if (result.paymentRecord.paymentStatus === "PAID") {
      try {
        await prisma.application.update({
          where: { id: result.applicationId },
          data: {
            status: "APPROVED",
          },
        });
        // await sendEnrollmentEmail(result.applicationId, result.amount, result.paymentType);
        sendEnrollmentNotification({
          applicationId: result.applicationId,
          amount: result.amount,
          paymentType: result.paymentType,
        });
      } catch (updateError) {
        console.error("Failed to update application status:", updateError);
      }
    }

    return {
      paymentRecord: result.paymentRecord,
      paymentHistory: result.paymentHistory,
      session: {
        amount: result.amount,
        currency: result.currency,
        paymentType: result.paymentType,
        courseName: result.courseName,
        paymentStatus: result.stripePaymentStatus,
      },
    };
  } catch (error: unknown) {
    console.error("Error saving payment data:", error);
    if (error instanceof AppError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new AppError(`Failed to save payment data: ${errorMessage}`, "DATABASE_ERROR", 500);
  }
};

const verifyPayment = async (sessionId: string): Promise<VerifyPaymentResult> => {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent"],
    });

    // If payment is successful, ensure the payment record is updated
    if (session.payment_status === "paid") {
      const { applicationId, paymentRecordId, paymentType, amount, currency, courseName } =
        session.metadata as Record<string, string>;

      if (paymentRecordId) {
        // Check if this payment has already been processed by checking for duplicate transaction ID
        const existingPaymentHistory = await prisma.paymentHistory.findFirst({
          where: {
            transactionId: typeof session.payment_intent === "object" ? session.payment_intent?.id || "" : "",
            paymentRecordId: paymentRecordId,
          },
        });

        if (!existingPaymentHistory) {
          // Process the payment if not already processed
          const paymentAmount = parseFloat(amount || "0");

          await prisma.$transaction(async (tx) => {
            // Get the current payment record
            const currentPaymentRecord = await tx.paymentRecord.findUnique({
              where: { id: paymentRecordId },
              select: { 
                installmentsPaid: true, 
                totalFee: true, 
                paidAmount: true, 
                paymentPlan: true,
                paymentStatus: true
              },
            });

            if (!currentPaymentRecord) {
              console.error(`Payment record not found: ${paymentRecordId}`);
              return;
            }

            // Create payment history record
            await tx.paymentHistory.create({
              data: {
                paymentRecordId: paymentRecordId,
                amount: paymentAmount,
                paymentMethod: "ONLINE",
                status: "PAID",
                paymentDate: new Date(),
                transactionId: typeof session.payment_intent === "object" ? session.payment_intent?.id || "" : "",
                reference: `STRIPE-${session.id}`,
                notes: `Payment verified via checkout session - ${paymentType}`,
                payment_status: true,
              },
            });

            // Calculate new paid amount
            const newPaidAmount = (currentPaymentRecord.paidAmount || 0) + paymentAmount;
            const newRemainingAmount = Math.max(0, (currentPaymentRecord.totalFee || 0) - newPaidAmount);

            // Update payment record
            await tx.paymentRecord.update({
              where: { id: paymentRecordId },
              data: {
                paidAmount: newPaidAmount,
                remainingAmount: newRemainingAmount,
                paymentStatus: newRemainingAmount <= 0 ? "PAID" : "PENDING",
              },
            });

            // Update application status if fully paid
            if (newRemainingAmount <= 0) {
              await tx.application.update({
                where: { id: applicationId },
                data: {
                  status: "APPROVED",
                  outcome: "APPROVED_UNCONDITIONAL",
                },
              });
            }
          });
        }
      }
    }

    return {
      sessionId: session.id,
      paymentStatus: session.payment_status,
      amount: session.amount_total ? session.amount_total / 100 : 0,
      currency: session.currency || "usd",
      customerEmail: session.customer_email || undefined,
      metadata: session.metadata,
    };
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    throw new AppError(`Failed to verify payment: ${errorMessage}`, "STRIPE_ERROR", 500);
  }
};

const createManualPayment = async (data: ManualPaymentForm) => {
  return await prisma.$transaction(async (tx) => {
    const application = await tx.application.findUnique({
      where: { id: data.applicationId },
    });

    if (!application) {
      throw new AppError("Application not found", "NOT_FOUND", 404);
    }

    const paymentRecord = await tx.paymentRecord.create({
      data: {
        applicantId: data.applicationId,
        totalFee: data.amount,
        paidAmount: data.amount,
        remainingAmount: 0,
        paymentPlan: data.paymentType === "FULL" ? "FULL_PAYMENT" : "INSTALLMENT",
        paymentStatus: "PENDING",
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const paymentHistory = await tx.paymentHistory.create({
      data: {
        paymentRecordId: paymentRecord.id,
        amount: data.amount,
        paymentMethod: "BANK_TRANSFER",
        status: "PENDING",
        paymentDate: new Date(),
        reference: data.referenceNo,
        bank_account_number: data.accountNo,
        bank_account_name: data.accountName,
        bank_name: data.bankName || "",
        receipt_url: data.receipts || "",
        // notes: `Manual payment submitted for approval (${currency || "USD"})`,
        payment_status: false,
      },
    });

    return {
      paymentRecord,
      paymentHistory,
    };
  });
};

export const StripePaymentService = {
  createCheckoutSession,
  savePaymentData,
  verifyPayment,
  createManualPayment,
};
