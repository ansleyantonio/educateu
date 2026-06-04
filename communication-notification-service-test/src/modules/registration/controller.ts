import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { zodSafeParse } from '../../utils/zodUtils';
import { registrationEmailSchema } from '../../schemas/emailSchema';
import { sendRegistrationEmail as actualSendRegistrationEmail } from '../general/mail/mailer';

// Registration email controller
export const sendRegistrationEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validatedBody = zodSafeParse(req.body, registrationEmailSchema);

  const { email, username, firstName, password, loginUrl } = validatedBody;

  if (!email) {
    throw new AppError('Email is required', 'MISSING_EMAIL', 400);
  }

  const user = {
    email,
    username,
    firstName,
    password,
  };

  const result = await actualSendRegistrationEmail(user, loginUrl);

  res.status(200).json({
    success: true,
    message: 'Registration email sent successfully',
    data: result,
  });
};

export { actualSendRegistrationEmail as sendRegistrationEmail };
