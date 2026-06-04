import { EmailType } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { logBulkEmailNotifications } from '../../utils/emailLogger';
import { renderTemplate } from '../../utils/renderTemplate';
import { transporter } from '../notification/mail.service';

type OutcomeType =
  | 'DID_NOT_PICK_UP'
  | 'PRE_SCREENING_PASSED'
  | 'INCOMPLETE_OR_PENDING'
  | 'PRE_SCREENING_FAILED'
  // | 'PRE_SCREENING_FAILED_1ST_TIME'
  | 'PRE_SCREENING_FAILED_2ND_TIME';

interface OutcomeEmailConfig {
  subject: string;
  color: string;
  header: string;
  content: string;
}

export const sendPreScreenOutcomeEmail = async (
  emails: string[],
  applicantName: string,
  applicationId: string,
  outcome: string
): Promise<{ success: boolean; message: string }> => {
  const emailList = emails.filter(e => e && e.trim() !== '');

  if (emailList.length === 0) {
    throw new AppError(
      'No valid email recipients provided',
      'BAD_REQUEST',
      400
    );
  }

  const emailConfigs: Record<OutcomeType, OutcomeEmailConfig> = {
    DID_NOT_PICK_UP: {
      subject: `We Couldn't Reach You – Pre-Screening Attempt`,
      color: '#e74c3c',
      header: `Hello ${applicantName},`,
      content: `
        <p style="font-size: 16px; margin-bottom: 20px;">
          We attempted to contact you for your pre-screening, but couldn't reach you.
        </p>
        <p style="font-size: 16px;">
          Please keep your phone available for our next attempt or contact us to reschedule.
        </p>
      `,
    },

    PRE_SCREENING_PASSED: {
      subject: `Congratulations! You Passed the Pre-Screening`,
      color: '#2ecc71',
      header: `Hello ${applicantName},`,
      content: `
        <p style="font-size: 16px; margin-bottom: 20px;">
          Great news! You have successfully passed the pre-screening stage.
        </p>
        <p style="font-size: 16px;">
          Our team will contact you soon with the next steps.
        </p>
      `,
    },

    PRE_SCREENING_FAILED: {
      subject: `Update on Your Pre-Screening Result`,
      color: '#e74c3c',
      header: `Hello ${applicantName},`,
      content: `
        <p style="font-size: 16px; margin-bottom: 20px;">
          Thank you for your time and interest.
        </p>
        <p style="font-size: 16px;">
          Unfortunately, you did not pass the pre-screening stage.
        </p>
      `,
    },

    PRE_SCREENING_FAILED_2ND_TIME: {
      subject: `Final Update on Your Pre-Screening`,
      color: '#c0392b',
      header: `Hello ${applicantName},`,
      content: `
        <p style="font-size: 16px; margin-bottom: 20px;">
          After your second attempt, you were not successful.
        </p>
        <p style="font-size: 16px;">
          We will not be proceeding further with your application.
        </p>
      `,
    },

    INCOMPLETE_OR_PENDING: {
      subject: `Action Required: Complete Your Pre-Screening`,
      color: '#e67e22',
      header: `Hello ${applicantName},`,
      content: `
        <p style="font-size: 16px; margin-bottom: 20px;">
          Your pre-screening is marked as Incomplete or Pending.
        </p>
        <p style="font-size: 16px;">
          Please log in and complete the required steps.
        </p>
      `,
    },
  };

  const template = await renderTemplate(outcome as OutcomeType, {
    applicantName,
    applicationId,
  });

  const config = emailConfigs[outcome as OutcomeType] ?? {
    subject: `Update on Your Pre-Screening Status`,
    color: '#3498db',
    header: `Hello ${applicantName},`,
    content: `
        <p style="font-size: 16px;">
          Your pre-screening status has been updated to: <strong>${outcome}</strong>.
        </p>
      `,
  };

  const emailBody =
    template?.body ??
    `
      <html>
        <body style="font-family: Arial; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px;">
            <h2 style="color: ${config.color}; text-align: center;">
              ${config.header}
            </h2>
            ${config.content}
            <p style="margin-top: 30px;">
              Best regards,<br />The Abree Team
            </p>
          </div>
        </body>
      </html>
    `;

  const subject = template?.subject ?? config.subject;

  const mailOptions = {
    from: env.EMAIL_USER,
    to: emailList,
    subject: subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);

    await logBulkEmailNotifications(
      EmailType.APPLICATION_OUTCOME_EMAIL,
      emailList,
      `Pre-screen outcome email sent: ${outcome}`
    );

    return {
      success: true,
      message: 'Pre-screen outcome email sent successfully',
    };
  } catch {
    await logBulkEmailNotifications(
      EmailType.APPLICATION_OUTCOME_EMAIL,
      emailList,
      `Failed to send pre-screen outcome email: ${outcome}`,
      'FAILED'
    );

    throw new AppError(
      'Failed to send pre-screen outcome email',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};
