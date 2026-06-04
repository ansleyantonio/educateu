import { AppError } from "../utils/AppError";
import { sendSuccessResponse } from "../utils/responseUtils";
import { zodSafeParse } from "../utils/zodUtils";
import { createCheckoutSessionSchema, ManualPaymentSchema, savePaymentSchema } from "./schema";
import { Request, Response } from "express";
import { StripePaymentService } from "./sevices";

const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const validatedData = zodSafeParse(req.body, createCheckoutSessionSchema);
  const result = await StripePaymentService.createCheckoutSession(validatedData);
  sendSuccessResponse(res, result, "Checkout session created successfully");
};

const savePaymentData = async (req: Request, res: Response): Promise<void> => {
  const validatedData = zodSafeParse(req.body, savePaymentSchema);
  const result = await StripePaymentService.savePaymentData(validatedData.sessionId);
  sendSuccessResponse(res, result, "Payment data saved successfully");
};

const verifyPayment = async (req: Request, res: Response): Promise<void> => {
  const { sessionId } = req.params;
  if (!sessionId) {
    throw new AppError("Session ID is required", "BAD_REQUEST", 400);
  }
  const result = await StripePaymentService.verifyPayment(sessionId);
  sendSuccessResponse(res, result, "Payment verified successfully");
};

const handlePaymentSuccess = async (req: Request, res: Response): Promise<void> => {
  const { session_id } = req.query;

  if (!session_id) {
    res.status(400).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #e74c3c; }
          .success { color: #27ae60; }
        </style>
      </head>
      <body>
        <h1 class="error">Payment Error</h1>
        <p>Session ID is missing. Please contact support.</p>
        <a href="${process.env.BACKEND_URL}">Return to Home</a>
      </body>
      </html>
    `);
    return;
  }

  try {
    const result = await StripePaymentService.savePaymentData(session_id as string);

    const displayCurrency = result.session?.currency || "USD";
    const displayAmount = result.session?.amount || "0";
    const displayCourseName = result.session?.courseName || "Course";
    const displayPaymentType = result.session?.paymentType === "FULL" ? "Full Payment" : "First Semester";
    const displayStatus = result.session?.paymentStatus || "Unknown";

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Successful</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background-color: #f9f9f9;
          }
          .container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .success { color: #27ae60; font-size: 48px; }
          .error { color: #e74c3c; }
          .details {
            text-align: left;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
          .btn {
            display: inline-block;
            padding: 10px 20px;
            background: #3498db;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 5px;
          }
          .btn-primary { background: #3498db; }
          .btn-secondary { background: #95a5a6; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Payment Successful!</h1>
          
          <div class="details">
            <p><strong>Amount Paid:</strong> ${displayCurrency} ${displayAmount}</p>
            <p><strong>Course:</strong> ${displayCourseName}</p>
            <p><strong>Payment Type:</strong> ${displayPaymentType}</p>
            <p><strong>Status:</strong> ${displayStatus}</p>
          </div>
          
          <p>Thank you for your payment. Your enrollment has been confirmed.</p>
          
         
        </div>
        
 
      </body>
      </html>
    `);
  } catch (error: any) {
    console.error("Error in payment success handler:", error);

    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Processing Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .error { color: #e74c3c; }
        </style>
      </head>
      <body>
        <h1 class="error">Payment Processing Error</h1>
        <p>There was an error processing your payment. Please contact support.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <a href="${process.env.BACKEND_URL}">Return to Home</a>
      </body>
      </html>
    `);
  }
};

const handlePaymentCanceled = async (req: Request, res: Response): Promise<void> => {
  const { application_id } = req.query;

  // Use res.send() without returning it
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Payment Canceled</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background-color: #f9f9f9;
        }
        .container {
          max-width: 500px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .warning { color: #f39c12; font-size: 48px; }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          background: #3498db;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 5px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="warning">⚠️</div>
        <h1>Payment Canceled</h1>
        <p>Your payment was canceled. You can try again anytime.</p>
        <div>
        </div>
      </div>
    </body>
    </html>
  `);
};

const createManualPayment = async (req: Request, res: Response): Promise<void> => {
  const validatedData = zodSafeParse(req.body, ManualPaymentSchema);
  const result = await StripePaymentService.createManualPayment(validatedData);
  sendSuccessResponse(res, result, "Manual payment recorded successfully");
};
export const StripePaymentController = {
  createCheckoutSession,
  savePaymentData,
  verifyPayment,
  handlePaymentCanceled,
  handlePaymentSuccess,
  createManualPayment,
};
