import { Router } from 'express';
import { asyncHandler } from '../../../middlewares/asyncHandler';
import * as controller from './controller';

const router = Router();

router.post('/', asyncHandler(controller.updateServerInfo));

export default router;
