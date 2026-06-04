import { Router } from 'express';
import { asyncWrapper } from '../../utils/asyncWrapper';
import { getNotificationLogs, getNotificationLogById } from './controller';

const router = Router();

router.get('/', asyncWrapper(getNotificationLogs));
router.get('/:id', asyncWrapper(getNotificationLogById));

export default router;
