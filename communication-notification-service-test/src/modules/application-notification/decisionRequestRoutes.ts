import express from 'express';
import { sendApplicationDecisionRequestEmailController } from './decisionRequestController';

const router = express.Router();

// POST route to send application decision request email
router.post('/decision-request', sendApplicationDecisionRequestEmailController);

export default router;