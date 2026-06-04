import { Router } from 'express';
import {
  sendApplicationSummaryEmailController,
  sendEmailVerificationController,
  // sendInterviewOutcomeEmailController,
  sendStripeApplicationOutcomeEmailController,
  sendCustomApplicationNotificationController,
  sendRealTimeApplicationNotificationController,
  getApplicationNotificationPayloadController,
  sendEmailVerifiedConfirmation,
  sendApprovalEmail,
} from './controller';
import { sendApplicationDecisionRequestEmailController } from './decisionRequestController';
import { asyncWrapper } from '../../utils/asyncWrapper';
import { sendInterviewOutcomeController } from '../interview/controllers';

const router = Router();

// Application notification routes
router.post('/summary', asyncWrapper(sendApplicationSummaryEmailController));
router.post('/verify-email', asyncWrapper(sendEmailVerificationController));
router.post('/verify-confirmed', asyncWrapper(sendEmailVerifiedConfirmation));
router.post(
  '/stripe-outcome',
  asyncWrapper(sendStripeApplicationOutcomeEmailController)
);
router.post(
  '/decision-request',
  asyncWrapper(sendApplicationDecisionRequestEmailController)
);
router.post('/interview/outcome', asyncWrapper(sendInterviewOutcomeController));
router.post(
  '/custom-notification',
  asyncWrapper(sendCustomApplicationNotificationController)
);
router.post(
  '/realtime-notification',
  asyncWrapper(sendRealTimeApplicationNotificationController)
);
router.post(
  '/get-payload',
  asyncWrapper(getApplicationNotificationPayloadController)
);
router.post('/send-approval-email', asyncWrapper(sendApprovalEmail));

export default router;
