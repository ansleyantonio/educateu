import { Router } from 'express';
import { asyncWrapper } from '../../../../utils/asyncWrapper';
import {
  sendEnrollmentEmailController,
  sendMultiDeviceLoginAlertController,
  sendMultipleLoginEmailsController,
} from '../controller';

const router = Router();

// Send enrollment email route
router.post('/enrollment', asyncWrapper(sendEnrollmentEmailController));
router.post(
  '/multiple-login-alert',
  asyncWrapper(sendMultipleLoginEmailsController)
);
router.post(
  '/multi-device-login-alert',
  asyncWrapper(sendMultiDeviceLoginAlertController)
);
export default router;
