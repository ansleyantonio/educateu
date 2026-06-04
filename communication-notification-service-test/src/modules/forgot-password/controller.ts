import type { Request, Response } from 'express';
import { sendOtpEmail } from '../general/mail/mailer';
import { zodSafeParse } from '../../utils/zodUtils';
import { otpEmailSchema } from '../../schemas/emailSchema';

// Forgot password email controller
export const sendForgotPasswordEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, otpEmailSchema);
  const { email, firstName, otp } = validatedBody;

  const user = { email, firstName: firstName ?? undefined };

  const result = await sendOtpEmail(user, otp, firstName);

  res.status(200).json({
    success: true,
    message: 'Forgot password email sent successfully',
    data: result,
  });
};

// Export the service function for use in other services
export { sendOtpEmail } from '../general/mail/mailer';
