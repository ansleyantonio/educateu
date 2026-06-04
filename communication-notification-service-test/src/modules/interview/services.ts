import { logEmailNotification } from '../../utils/emailLogger';
import type { Interview } from '@prisma/client';
import { env } from '../../config/env';
import { EmailType } from '@prisma/client';
import { renderTemplate } from '../../utils/renderTemplate';
import { transporter } from '../notification/mail.service';

type Outcome = 'PENDING' | 'PASS' | 'FAIL' | 'CANCELLED' | 'RESCHEDULED';

const getOutcomeMeta = (
  outcome: Outcome
): { header: string; label: string; nextStepsMessage: string } => {
  const map = {
    PENDING: [
      'Booked',
      'Booked',
      'Your interview has been booked. Please check the updated details below.',
    ],
    PASS: [
      'Conditional Offer Letter',
      'Passed (Conditionally Approved)',
      'Congratulations! You passed the interview. This is a conditional approval and further steps may be required.',
    ],
    FAIL: [
      'Interview Result',
      'Not Selected',
      'Thank you for your time. We will not be moving forward at this stage.',
    ],
    RESCHEDULED: [
      'Interview Rescheduled',
      'Rescheduled',
      'Your interview has been rescheduled. Please check the updated details below.',
    ],
    CANCELLED: [
      'Interview Canceled',
      'Canceled',
      'Your interview has been canceled. We will reach out if needed.',
    ],
  } as const;

  const [header, label, nextStepsMessage] = map[outcome] ?? [
    'Interview Update',
    outcome,
    '',
  ];

  return { header, label, nextStepsMessage };
};

export const buildFallbackHtml = (
  fullName: string,
  outcome: Outcome,
  interview?: Interview
): string => {
  const { header, label, nextStepsMessage } = getOutcomeMeta(outcome);

  const formatDate = (date?: Date | string): string =>
    date
      ? new Intl.DateTimeFormat('en-BD', {
          timeZone: 'Asia/Dhaka',
          dateStyle: 'medium',
        }).format(new Date(date))
      : '-';

  const formatTime = (date?: Date | string): string =>
    date
      ? new Intl.DateTimeFormat('en-BD', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date(date))
      : '-';

  const link = interview?.interviewLink?.trim();

  // Hide details if outcome is 'pass'
  const shouldShowInterviewDetails = interview && outcome !== 'PASS';

  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9fafb; padding: 20px;">
    <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">

      <h2>Hi ${fullName},</h2>

      ${
        interview?.color
          ? `<div style="margin-top:10px; font-size:18px; font-weight:600; color:${interview.color};">
              ${header}
            </div>`
          : ''
      }

      <p style="font-size: 15px; color: #374151; margin-top:10px;">
        Your interview status is:
        <span style="color:${interview?.color}; font-weight:600;">
          ${label}
        </span>
      </p>

      ${
        shouldShowInterviewDetails
          ? `
        <div style="margin-top:20px; padding:16px; background:#f3f4f6; border-radius:10px;">
          
          <h3>Interview Details</h3>

          <p><strong>Title:</strong> ${interview.title}</p>
          <p><strong>Date:</strong> ${formatDate(interview.interviewDate)}</p>
          <p><strong>Time:</strong> ${formatTime(
            interview.startTime
          )} - ${formatTime(interview.endTime)}</p>
          <p><strong>Platform:</strong> ${interview.platform ?? '-'}</p>

          ${
            link
              ? `
            <div style="margin-top:15px;">
              <a href="${link}"
                 style="display:inline-block; background:#4f46e5; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">
                Join Interview
              </a>
            </div>
          `
              : `
            <p style="margin-top:15px; background:#fef3c7; padding:10px; border-radius:8px; color:#92400e;">
              ⚠️ Meeting link will be shared soon before the interview.
            </p>
          `
          }

        </div>
      `
          : ''
      }

      <p><strong>Next Steps:</strong></p>
      <p>${nextStepsMessage}</p>

      <p style="margin-top:24px; font-size:14px; color:#6b7280;">
        Best regards,<br/>
        <strong>Your Pen Team</strong>
      </p>

    </div>
  </div>
  `;
};

export const sendInterviewOutcomeEmail = async (
  fullName: string,
  email: string,
  outcome: Outcome,
  interview: Interview | undefined
): Promise<{ success: boolean; message: string }> => {
  const year = new Date().getFullYear();

  const emailTypeMap: Record<string, EmailType> = {
    PENDING: EmailType.INTERVIEW_CONFIRMATION_EMAIL,
    PASS: EmailType.APPLICANT_INTERVIEW_PASSED,
    FAIL: EmailType.APPLICANT_INTERVIEW_FAILED,
    CANCELLED: EmailType.APPLICANT_INTERVIEW_CANCELED,
    RESCHEDULED: EmailType.APPLICANT_INTERVIEW_RESCHEDULED,
  };

  const emailType =
    emailTypeMap[outcome] ?? EmailType.APPLICANT_INTERVIEW_FAILED;

  const templateData = {
    applicantName: fullName,
    year,
    interviewLink: interview?.interviewLink,
    interviewDate: interview?.interviewDate,
    interviewStartTime: interview?.startTime,
    interviewEndTime: interview?.endTime,
    // interviewerName: interview?.interviewerId,
    ...interview,
  };

  const template = await renderTemplate(emailType, templateData, {
    optionalFields: ['interviewerName'],
  });

  const emailBody =
    template.body ?? buildFallbackHtml(fullName, outcome, interview);

  const subjectMap: Record<string, string> = {
    PENDING: 'Interview Confirmation',
    PASS: 'Interview Passed',
    FAIL: 'Interview Result',
    CANCELLED: 'Interview Canceled',
    RESCHEDULED: 'Interview Rescheduled',
  };

  const subject = template.subject ?? subjectMap[outcome] ?? 'Interview Update';

  const mailOptions = {
    from: env.EMAIL_USER,
    to: [email, ...(interview?.guests ?? [])],
    subject,
    html: emailBody,
  };

  // Send email
  await transporter.sendMail(mailOptions);

  // Log success
  await logEmailNotification(
    emailType,
    email,
    `Interview email sent: ${outcome}`
  );

  return {
    success: true,
    message: 'Interview email sent successfully',
  };
};
