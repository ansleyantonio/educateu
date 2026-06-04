import type { Request, Response } from 'express';
import {
  sendVerificationEmail,
  emailVerification,
} from '../general/mail/mailer';
import { zodSafeParse } from '../../utils/zodUtils';
import {
  verificationEmailSchema,
  emailVerificationSchema,
} from '../../schemas/emailSchema';

// Verification email controller
export const sendVerificationEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, verificationEmailSchema);
  const { email } = validatedBody;

  const result = await sendVerificationEmail(email);

  res.status(200).json({
    success: true,
    message: 'Verification email sent successfully',
    data: result,
  });
};

// Email verification with access token controller
export const sendEmailVerificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, emailVerificationSchema);
  const { email, firstName, accessToken } = validatedBody;

  const user = { email, firstName: firstName ?? undefined };

  const result = await emailVerification(user, accessToken, firstName);

  res.status(200).json({
    success: true,
    message: 'Email verification sent successfully',
    data: result,
  });
};

// Export the service functions for use in other services
export {
  sendVerificationEmail,
  emailVerification,
} from '../general/mail/mailer';
