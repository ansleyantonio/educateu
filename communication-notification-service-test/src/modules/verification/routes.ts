import { Router } from 'express';
import {
  sendVerificationEmailController,
  sendEmailVerificationController,
} from './controller';
import { asyncWrapper } from '../../utils/asyncWrapper';

const router = Router();

// Verification email routes
router.post('/', asyncWrapper(sendVerificationEmailController));
router.post(
  '/email-verification',
  asyncWrapper(sendEmailVerificationController)
);

export default router;

