import type { Request, Response } from 'express';
import { zodSafeParse } from '../../utils/zodUtils';
import { sendApplicationDecisionRequestEmail } from './decisionRequestService';
import { decisionRequestSchema } from '../../schemas/decisionRequestSchema';

export const sendApplicationDecisionRequestEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(
    '[DECISION_REQUEST_CONTROLLER_DEBUG] sendApplicationDecisionRequestEmailController function entered'
  );

  // Validate request body using Zod
  const validated = zodSafeParse(req.body, decisionRequestSchema);

  // Extract validated data
  const { applicationId, outcome } = validated;

  // Call the email function
  const result = await sendApplicationDecisionRequestEmail(applicationId, outcome);

  console.log(
    '[DECISION_REQUEST_CONTROLLER_DEBUG] Application decision request email sent successfully:',
    result
  );

  res.status(200).json({
    success: true,
    message: 'Application decision request email sent successfully',
    data: result,
  });
};