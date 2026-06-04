import prisma from '../../../prismaClient';
import { sendEmail } from '../../general/mail/mailer';
import { AppError } from '../../../utils/AppError';
import { logEmailNotification } from '../../../utils/emailLogger';
import type { EmailType } from '@prisma/client';

/**
 * Interview outcome email data
 */
export interface InterviewOutcomeEmailData {
  applicationId: string;
  interviewId: string;
  studentEmail: string;
  studentName: string;
  interviewTitle: string;
  outcome: 'pass' | 'fail' | 'canceled' | 'rescheduled';
  feedback?: string;
  nextSteps?: string;
}

/**
 * Fixed HTML template for interview outcome email
 */
// const INTERVIEW_OUTCOME_CONFIG = {
//   pass: {
//     label: 'Passed',
//     color: '#16a34a',
//     icon: '✅',
//     subject: '🎉 Interview Passed',
//     next: 'You will receive next steps within 5 business days.',
//     type: EmailType.APPLICANT_INTERVIEW_PASSED,
//   },
//   fail: {
//     label: 'Not Selected',
//     color: '#dc2626',
//     icon: '❌',
//     subject: 'Interview Result',
//     next: 'You may apply again in the future.',
//     type: EmailType.APPLICANT_INTERVIEW_FAILED,
//   },
//   canceled: {
//     label: 'Canceled',
//     color: '#f59e0b',
//     icon: '⚠️',
//     subject: 'Interview Canceled',
//     next: 'Your interview has been canceled.',
//     type: EmailType.APPLICANT_INTERVIEW_CANCELED,
//   },
//   rescheduled: {
//     label: 'Rescheduled',
//     color: '#2563eb',
//     icon: '🔄',
//     subject: 'Interview Rescheduled',
//     next: 'Your interview has been rescheduled.',
//     type: EmailType.APPLICANT_INTERVIEW_RESCHEDULED,
//   },
// } as const;

// type Outcome = keyof typeof INTERVIEW_OUTCOME_CONFIG;

// function getInterviewOutcomeTemplate(
//   studentName: string,
//   interviewTitle: string,
//   outcome: Outcome,
//   feedback: string,
//   nextStepsMessage: string
// ): string {
//   const { label, color, icon } = INTERVIEW_OUTCOME_CONFIG[outcome];

//   return `
//   <html>
//     <body style="margin:0;background:#f4f6f9;font-family:Arial,sans-serif;">
//       <div style="max-width:600px;margin:30px auto;background:#fff;border-radius:10px;padding:24px;">

//         <h2>Interview Update</h2>

//         <p>Hi ${studentName},</p>

//         <p>Thank you for attending <strong>${interviewTitle}</strong>.</p>

//         <div style="border-left:4px solid ${color};padding:15px;background:#f9fafb;">
//           <strong>${icon} ${label}</strong>
//         </div>

//         <p><strong>Feedback</strong></p>
//         <p>${feedback}</p>

//         <p><strong>Next Steps</strong></p>
//         <p>${nextStepsMessage}</p>

//         <p>Best regards,<br/><strong>Admissions Team</strong></p>

//       </div>
//     </body>
//   </html>
//   `;
// }
/**
 * Send interview outcome email
 * Sends emails to: student, interviewer, and guests
 */
// export async function sendInterviewOutcomeEmail(
//   interviewId: string,
//   outcome: 'pass' | 'fail' | 'canceled' | 'rescheduled',
//   feedback?: string,
//   nextSteps?: string
// ): Promise<{ success: boolean; message: string }> {
//   try {
//     const interview = await prisma.interview.findUnique({
//       where: { id: interviewId },
//       include: {
//         application: { include: { personalInformation: true } },
//         interviewer: {
//           include: { userPortalCategory: { include: { user: true } } },
//         },
//       },
//     });

//     if (!interview) {
//       throw new AppError('Interview not found', 'INTERVIEW_NOT_FOUND', 404);
//     }

//     const personal = interview.application.personalInformation;
//     const studentEmail = personal?.email;
//     if (!studentEmail) {
//       throw new AppError(
//         'Student email not found',
//         'STUDENT_EMAIL_NOT_FOUND',
//         404
//       );
//     }

//     const studentName =
//       `${personal?.firstName ?? ''} ${personal?.lastName ?? ''}`.trim() ||
//       'Student';

//     // Simple config (no repetition)

//     const config = INTERVIEW_OUTCOME_CONFIG[outcome];

//     const body = getInterviewOutcomeTemplate(
//       studentName,
//       interview.title,
//       outcome,
//       feedback ?? 'Thank you for attending the interview.',
//       nextSteps ?? config.next
//     );

//     const text = body.replace(/<[^>]*>/g, '');

//     const recipients = [
//       studentEmail,
//       interview.interviewer.userPortalCategory?.user?.email,
//       ...(interview.guests ?? []),
//     ].filter(Boolean) as string[];

//     await Promise.all(
//       recipients.map(async email => {
//         await sendEmail(email, config?.subject, body, text);
//         await logEmailNotification(
//           config?.type,
//           email,
//           `Interview ${outcome} email sent`
//         );
//       })
//     );

//     await prisma.application.update({
//       where: { id: interview.applicationId },
//       data: { interviewOutcome: outcome },
//     });

//     return {
//       success: true,
//       message: `Email sent to ${recipients.length} recipient(s)`,
//     };
//   } catch (error) {
//     if (error instanceof AppError) throw error;

//     throw new AppError(
//       'Failed to send interview outcome',
//       'EMAIL_SEND_FAILED',
//       500
//     );
//   }
// }

/**
 * Fixed HTML template for interview scheduled email
 */
function getInterviewScheduledTemplate(
  studentName: string,
  interviewTitle: string,
  interviewDate: string,
  startTime: string,
  endTime: string,
  platform: string,
  interviewLink: string | null,
  interviewerName: string,
  interviewerEmail: string
): string {
  const linkSection = interviewLink
    ? `<p style="margin: 10px 0;"><strong>Interview Link:</strong> <a href="${interviewLink}" target="_blank">${interviewLink}</a></p>`
    : '';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5282;">Interview Scheduled</h2>

          <p>Dear ${studentName},</p>

          <p>We are pleased to inform you that your interview has been scheduled. Please find the details below:</p>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 10px 0;"><strong>Interview Title:</strong> ${interviewTitle}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${interviewDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 10px 0;"><strong>Platform:</strong> ${platform}</p>
            ${linkSection}
            <p style="margin: 10px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>
            <p style="margin: 10px 0;"><strong>Interviewer Email:</strong> ${interviewerEmail}</p>
          </div>

          <p>A calendar invitation will be sent to you shortly. Please add it to your calendar to avoid missing the interview.</p>

          <p>If you need to reschedule, please contact us at least 24 hours in advance.</p>

          <p>Best regards,<br/>The Admissions Team</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send interview scheduled notification
 * Sends emails to: student, interviewer, and guests
 */
export async function sendInterviewScheduledEmail(
  interviewId: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: {
        application: {
          include: {
            personalInformation: true,
          },
        },
        interviewer: {
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      throw new AppError('Interview not found', 'INTERVIEW_NOT_FOUND', 404);
    }

    const studentEmail = interview.application.personalInformation?.email;
    if (!studentEmail) {
      throw new AppError(
        'Student email not found',
        'STUDENT_EMAIL_NOT_FOUND',
        404
      );
    }

    const studentName =
      `${interview.application.personalInformation?.firstName ?? ''} ${interview.application.personalInformation?.lastName ?? ''}`.trim() ||
      'Student';
    const interviewer = interview.interviewer.userPortalCategory?.user;
    const interviewerEmail = interviewer?.agentEmail ?? undefined;
    const guests = interview.guests ?? [];

    const subject = `Your Interview Has Been Scheduled - ${interview.title}`;
    const body = getInterviewScheduledTemplate(
      studentName,
      interview.title,
      formatDate(interview.interviewDate),
      formatTime(interview.startTime),
      formatTime(interview.endTime),
      interview.platform,
      interview.interviewLink,
      `${interviewer?.firstName ?? ''} ${interviewer?.lastName ?? ''}`.trim() ||
        'Interviewer',
      interviewerEmail ?? 'Not provided'
    );

    const textBody = body.replace(/<[^>]*>/g, '');

    // Collect all recipients
    const recipients: Array<{
      email: string;
      type: 'student' | 'interviewer' | 'guest';
    }> = [];

    // Add student
    recipients.push({ email: studentEmail, type: 'student' });

    // Add interviewer if email exists
    if (interviewerEmail) {
      recipients.push({ email: interviewerEmail, type: 'interviewer' });
    }

    // Add guests
    guests.forEach((guestEmail: string) => {
      if (guestEmail) {
        recipients.push({ email: guestEmail, type: 'guest' });
      }
    });

    // Send emails to all recipients
    for (const recipient of recipients) {
      await sendEmail(recipient.email, subject, body, textBody);

      // Log to NotificationLog
      await logEmailNotification(
        'INTERVIEW_SCHEDULED_EMAIL' as EmailType,
        recipient.email,
        `Interview scheduled notification sent for ${interview.title} to ${recipient.type}`,
        'SENT'
      );
    }

    return {
      success: true,
      message: `Interview scheduled email sent to ${recipients.length} recipient(s)`,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to send interview scheduled: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EMAIL_SEND_FAILED',
      500
    );
  }
}

/**
 * Format date for email template
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format time for email template
 */
function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
