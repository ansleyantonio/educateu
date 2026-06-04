import twilio from 'twilio';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

// Twilio client instance
let twilioClient: twilio.Twilio | null = null;

/**
 * Get or create Twilio client instance
 */
export const getTwilioClient = (): twilio.Twilio => {
  twilioClient ??= twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
  return twilioClient;
};

// Export the client for backward compatibility
export const twilioClientInstance = getTwilioClient();

/**
 * SMS Result interface
 */
export interface SmsResult {
  success: boolean;
  message: string;
  sid?: string;
}

/**
 * SMS Service interface
 */
export interface SmsService {
  sendSms: (to: string, body: string) => Promise<SmsResult>;
  sendOtpSms: (to: string, otp: string) => Promise<SmsResult>;
  sendVerificationSms: (to: string, message: string) => Promise<SmsResult>;
  sendBulkSms: (recipients: string[], body: string) => Promise<SmsResult[]>;
}

/**
 * Twilio message create options interface
 */
interface TwilioMessageOptions {
  body: string;
  to: string;
  from?: string;
  messagingServiceSid?: string;
}

/**
 * Send SMS using Twilio
 */
export const sendSms = async (
  to: string,
  body: string
): Promise<SmsResult> => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) {
    throw new AppError(
      'Twilio configuration is missing. Please check your environment variables.',
      'TWILIO_CONFIG_ERROR',
      500
    );
  }

  if (!to) {
    throw new AppError('Phone number is required to send SMS', 'MISSING_PHONE_NUMBER', 400);
  }

  // Use MessagingServiceSid if available, otherwise fall back to phone number
  const hasMessagingService = !!env.TWILIO_MESSAGING_SERVICE_SID;
  const hasPhoneNumber = !!env.TWILIO_PHONE_NUMBER;

  if (!hasMessagingService && !hasPhoneNumber) {
    throw new AppError(
      'Either TWILIO_MESSAGING_SERVICE_SID or TWILIO_PHONE_NUMBER must be configured',
      'TWILIO_SENDER_CONFIG_ERROR',
      500
    );
  }

  try {
    const client = getTwilioClient();

    // Build message options dynamically based on available configuration
    const messageOptions: TwilioMessageOptions = {
      body,
      to,
    };

    // Prefer MessagingServiceSid over phone number
    if (hasMessagingService) {
      messageOptions.messagingServiceSid = env.TWILIO_MESSAGING_SERVICE_SID;
    } else if (hasPhoneNumber) {
      messageOptions.from = env.TWILIO_PHONE_NUMBER;
    }

    const message = await client.messages.create(messageOptions);

    console.log(`SMS sent successfully to ${to}, SID: ${message.sid}`);

    return {
      success: true,
      message: 'SMS sent successfully',
      sid: message.sid,
    };
  } catch (error) {
    console.error('Error sending SMS:', error);

    if (error instanceof Error) {
      // Handle Twilio-specific errors
      if ('code' in error) {
        const twilioError = error as { code: number; message: string };
        switch (twilioError.code) {
          case 21211:
            throw new AppError('Invalid phone number format', 'INVALID_PHONE_NUMBER', 400);
          case 21608:
            throw new AppError('Phone number not verified for trial account', 'PHONE_NOT_VERIFIED', 400);
          case 21610:
            throw new AppError('SMS sending not enabled for this number', 'SMS_NOT_ENABLED', 400);
          default:
            throw new AppError(
              `Failed to send SMS: ${twilioError.message}`,
              'SMS_SEND_FAILED',
              500
            );
        }
      }
    }

    throw new AppError(
      'Failed to send SMS',
      'SMS_SEND_FAILED',
      500
    );
  }
};

/**
 * Send OTP via SMS
 */
export const sendOtpSms = async (
  to: string,
  otp: string
): Promise<SmsResult> => {
  const body = `Your OTP is: ${otp}. This OTP is valid for 15 minutes. If you didn't request this, please ignore this message.`;
  
  try {
    return await sendSms(to, body);
  } catch (error) {
    console.error('Error sending OTP SMS:', error);
    throw error;
  }
};

/**
 * Send verification SMS with custom message
 */
export const sendVerificationSms = async (
  to: string,
  message: string
): Promise<SmsResult> => {
  try {
    return await sendSms(to, message);
  } catch (error) {
    console.error('Error sending verification SMS:', error);
    throw error;
  }
};

/**
 * Send bulk SMS to multiple recipients
 */
export const sendBulkSms = async (
  recipients: string[],
  body: string
): Promise<SmsResult[]> => {
  if (!recipients || recipients.length === 0) {
    throw new AppError('At least one recipient is required', 'NO_RECIPIENTS', 400);
  }

  const results: SmsResult[] = [];

  for (const recipient of recipients) {
    try {
      const result = await sendSms(recipient, body);
      results.push(result);
    } catch (error) {
      console.error(`Failed to send SMS to ${recipient}:`, error);
      results.push({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send SMS',
      });
    }
  }

  return results;
};
