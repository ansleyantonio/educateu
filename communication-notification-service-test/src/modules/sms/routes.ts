import { Router } from 'express';
import {
  sendSingleSms,
  sendOtp,
  sendVerification,
  sendBulk,
  smsHealthCheck,
} from './controller';

const router = Router();

/**
 * SMS Routes
 * Base path: /sms
 */

// Health check endpoint
router.get('/health', smsHealthCheck);

// Send a single SMS
router.post('/send', sendSingleSms);

// Send OTP via SMS
router.post('/send-otp', sendOtp);

// Send verification SMS
router.post('/send-verification', sendVerification);

// Send bulk SMS
router.post('/send-bulk', sendBulk);

export default router;
