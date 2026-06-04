import type { Request, Response } from 'express';
import {
  sendSms,
  sendOtpSms,
  sendVerificationSms,
  sendBulkSms,
} from '../../services/smsService';
import { AppError } from '../../utils/AppError';

/**
 * Send a single SMS
 * POST /sms/send
 */
export const sendSingleSms = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, body } = req.body;

  if (!to) {
    throw new AppError('Phone number is required', 'MISSING_PHONE_NUMBER', 400);
  }

  if (!body) {
    throw new AppError('Message body is required', 'MISSING_MESSAGE_BODY', 400);
  }

  const result = await sendSms(to, body);

  res.status(200).json({
    success: true,
    message: 'SMS sent successfully',
    data: result,
  });
};

/**
 * Send OTP via SMS
 * POST /sms/send-otp
 */
export const sendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, otp } = req.body;

  if (!to) {
    throw new AppError('Phone number is required', 'MISSING_PHONE_NUMBER', 400);
  }

  if (!otp) {
    throw new AppError('OTP is required', 'MISSING_OTP', 400);
  }

  const result = await sendOtpSms(to, otp);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    data: result,
  });
};

/**
 * Send verification SMS
 * POST /sms/send-verification
 */
export const sendVerification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { to, message } = req.body;

  if (!to) {
    throw new AppError('Phone number is required', 'MISSING_PHONE_NUMBER', 400);
  }

  if (!message) {
    throw new AppError('Verification message is required', 'MISSING_MESSAGE', 400);
  }

  const result = await sendVerificationSms(to, message);

  res.status(200).json({
    success: true,
    message: 'Verification SMS sent successfully',
    data: result,
  });
};

/**
 * Send bulk SMS to multiple recipients
 * POST /sms/send-bulk
 */
export const sendBulk = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { recipients, body } = req.body;

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    throw new AppError('Recipients array is required', 'MISSING_RECIPIENTS', 400);
  }

  if (!body) {
    throw new AppError('Message body is required', 'MISSING_MESSAGE_BODY', 400);
  }

  const results = await sendBulkSms(recipients, body);

  const successCount = results.filter((r) => r.success).length;
  const failureCount = results.length - successCount;

  res.status(200).json({
    success: true,
    message: `Bulk SMS processed: ${successCount} successful, ${failureCount} failed`,
    data: {
      total: recipients.length,
      success: successCount,
      failed: failureCount,
      results,
    },
  });
};

/**
 * Health check for SMS service
 * GET /sms/health
 */
export const smsHealthCheck = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, TWILIO_MESSAGING_SERVICE_SID } =
    process.env;

  const isConfigured = !!(
    TWILIO_ACCOUNT_SID &&
    TWILIO_AUTH_TOKEN &&
    (TWILIO_PHONE_NUMBER ?? TWILIO_MESSAGING_SERVICE_SID)
  );

  res.status(200).json({
    success: true,
    message: 'SMS service is running',
    data: {
      configured: isConfigured,
      hasAccountSid: !!TWILIO_ACCOUNT_SID,
      hasAuthToken: !!TWILIO_AUTH_TOKEN,
      hasPhoneNumber: !!TWILIO_PHONE_NUMBER,
      hasMessagingServiceSid: !!TWILIO_MESSAGING_SERVICE_SID,
    },
  });
};
