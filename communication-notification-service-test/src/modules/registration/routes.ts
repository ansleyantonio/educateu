import { Router } from 'express';
import { sendRegistrationEmailController } from './controller';
import { asyncWrapper } from '../../utils/asyncWrapper';

const router = Router();

// Registration email routes
router.post('/', asyncWrapper(sendRegistrationEmailController));

export default router;
