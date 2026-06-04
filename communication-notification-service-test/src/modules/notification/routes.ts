import { Router } from 'express';
import {
  sendRegisterEmailController,
  sendWellbeingEmailController,
  sendNotesEmailController,
  sendInterviewEmailController,
  sendApplicationOutcomeEmailController,
  // sendPreScreenOutcomeEmailController,
} from './controller';
import { asyncWrapper } from '../../utils/asyncWrapper';
import { sendPreScreenOutcomeEmailController } from '../pre-screen/controllers';

const router = Router();

// Registration email route
router.post('/register', asyncWrapper(sendRegisterEmailController));

// Wellbeing status email route
router.post('/wellbeing', asyncWrapper(sendWellbeingEmailController));

// Notes email route
router.post('/notes', asyncWrapper(sendNotesEmailController));

// Interview scheduled email route
router.post('/interview', asyncWrapper(sendInterviewEmailController));

// Application outcome email route
router.post(
  '/application-outcome',
  asyncWrapper(sendApplicationOutcomeEmailController)
);
router.post(
  '/pre-screen-outcome',
  asyncWrapper(sendPreScreenOutcomeEmailController)
);

export default router;
