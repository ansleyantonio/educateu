import type { Request, Response } from 'express';
// import { AppError } from '../../../utils/AppError';
import { enrollmentEmailSchema } from '../../../schemas/emailSchema';
import { sendEnrollmentEmailService } from '../../../services/enrollmentEmailService';
import { zodSafeParse } from '../../../utils/zodUtils';
import { transporter } from '../../notification/mail.service';
import prisma from '../../../prismaClient';
import z from 'zod';
// Send enrollment email controller

export const multiDeviceSchema = z.object({
  userId: z.string(),
});
export const sendEnrollmentEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod schema
  const { applicationId, amount, paymentType } = zodSafeParse(
    req.body,
    enrollmentEmailSchema
  );
  await sendEnrollmentEmailService(applicationId, amount, paymentType);

  res.status(200).json({
    success: true,
    message: 'Enrollment email sent successfully',
    applicationId,
    // try {
    //
    //   });
    // } catch (error) {
    //   console.error('Error sending enrollment email:', error);
    //   throw new AppError('Failed to send enrollment email', 'EMAIL_SEND_FAILED', 500);
  });
};

export const sendMultipleLoginEmailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;
  const htmlBody = `
<p>Someone has requested a login link for your account. If you did not request this, please ignore this email.</p>

`;
  await transporter.sendMail({
    from: process.env['EMAIL_USER'],
    to: email,
    subject: 'Many login attempts detected',
    html: htmlBody,
  });
  res.status(200).json({
    success: true,
    message: 'Login alert email sent successfully',
  });
};

export const sendMultiDeviceLoginAlertController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = zodSafeParse(req.body, multiDeviceSchema);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      firstName: true,
      email: true,
      facultyEmail: true,
      agentEmail: true,
      username: true,
      facultyUser: true,
      agentUser: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // get first valid email
  const userEmail =
    user.email?.trim() ?? user.facultyEmail?.trim() ?? user.agentEmail?.trim();

  if (!userEmail) {
    throw new Error('No valid email found for user');
  }

  const loginName =
    user.username ?? user.facultyUser ?? user.agentUser ?? 'User';

  const htmlBody = `
      <h2>Security Alert: Multiple Device Login Attempt</h2>

      <p>Hello ${loginName},</p>

      <p>
        We detected a login attempt from an additional device on your account.
      </p>

      <p>
        Your account allows a maximum number of active devices. 
        A login attempt from another device was detected.
      </p>

      <p>
        If this was <strong>not you</strong>, we recommend:
      </p>

      <ul>
        <li>Change your password immediately</li>
        <li>Review your active sessions</li>
        <li>Enable MFA if available</li>
      </ul>

      <p>
        If this was you, please logout from an existing device and try again.
      </p>

      <br />

      <p>
        Regards,<br />
        Security Team
      </p>
    `;

  await transporter.sendMail({
    from: process.env['EMAIL_USER'],
    to: userEmail,
    subject: 'Security Alert: Multiple Device Login Attempt',
    html: htmlBody,
  });

  res.status(200).json({
    success: true,
    message: 'Login alert email sent successfully',
  });
};
