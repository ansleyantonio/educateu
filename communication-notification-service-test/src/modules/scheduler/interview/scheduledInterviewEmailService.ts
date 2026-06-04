import prisma from '../../../prismaClient';
import { sendEmail } from '../../general/mail/mailer';
import { AppError } from '../../../utils/AppError';
import { logEmailNotification } from '../../../utils/emailLogger';
import type { EmailType } from '@prisma/client';

/**
 * Interview email schedule data
 */
export interface InterviewEmailSchedule {
  applicationId: string;
  interviewId: string;
  studentEmail: string;
  studentName: string;
  interviewDate: Date;
  startTime: Date;
  endTime: Date;
  platform: string;
  interviewLink?: string | null;
  guests?: string[];
  interviewerName?: string;
  interviewerEmail?: string;
}

export type InterviewReminderType = '24H' | '1H';

export interface ScheduledEmailResult {
  success: boolean;
  message: string;
}

/**
 * Fixed HTML template for interview confirmation email
 */
function getInterviewConfirmationTemplate(
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
          <h2 style="color: #2c5282;">Interview Confirmation</h2>
          
          <p>Dear ${studentName},</p>
          
          <p>Your interview has been scheduled successfully. Here are the details:</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 10px 0;"><strong>Interview Title:</strong> ${interviewTitle}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${interviewDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 10px 0;"><strong>Platform:</strong> ${platform}</p>
            ${linkSection}
            <p style="margin: 10px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>
            <p style="margin: 10px 0;"><strong>Interviewer Email:</strong> ${interviewerEmail}</p>
          </div>
          
          <p>Please make sure to join the interview on time. If you have any questions, feel free to reach out to your interviewer.</p>
          
          <p>Best regards,<br/>The Admissions Team</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Fixed HTML template for interview reminder email
 */
function getInterviewReminderTemplate(
  studentName: string,
  interviewTitle: string,
  interviewDate: string,
  startTime: string,
  endTime: string,
  platform: string,
  interviewLink: string | null,
  interviewerName: string,
  interviewerEmail: string,
  reminderTime: string
): string {
  const linkSection = interviewLink
    ? `<p style="margin: 10px 0;"><strong>Interview Link:</strong> <a href="${interviewLink}" target="_blank">${interviewLink}</a></p>`
    : '';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5282;">Interview Reminder</h2>
          
          <p>Dear ${studentName},</p>
          
          <p>This is a friendly reminder that your interview is scheduled in <strong>${reminderTime}</strong>.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 10px 0;"><strong>Interview Title:</strong> ${interviewTitle}</p>
            <p style="margin: 10px 0;"><strong>Date:</strong> ${interviewDate}</p>
            <p style="margin: 10px 0;"><strong>Time:</strong> ${startTime} - ${endTime}</p>
            <p style="margin: 10px 0;"><strong>Platform:</strong> ${platform}</p>
            ${linkSection}
            <p style="margin: 10px 0;"><strong>Interviewer:</strong> ${interviewerName}</p>
            <p style="margin: 10px 0;"><strong>Interviewer Email:</strong> ${interviewerEmail}</p>
          </div>
          
          <p>Please ensure you are ready and logged in on time. Good luck!</p>
          
          <p>Best regards,<br/>The Admissions Team</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send interview confirmation email when interview is scheduled
 * Sends emails to: student, interviewer, and guests
 */
export async function sendInterviewConfirmationEmail(
  interviewId: string
): Promise<ScheduledEmailResult> {
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

    // Only send for PENDING and RESCHEDULED
    const allowedStatuses = ['PENDING', 'RESCHEDULED'];
    if (
      interview.status &&
      !allowedStatuses.includes(interview.status.toUpperCase())
    ) {
      return {
        success: true,
        message: `Interview email skipped for status: ${interview.status}`,
      };
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
    const interviewerEmail = interviewer?.email;
    const guests = interview.guests ?? [];

    const subject = `Interview Confirmation - ${interview.title}`;
    const body = getInterviewConfirmationTemplate(
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
        'INTERVIEW_CONFIRMATION_EMAIL',
        recipient.email,
        `Interview confirmation sent for ${interview.title} to ${recipient.type}`,
        'SENT'
      );
    }

    return {
      success: true,
      message: `Interview confirmation email sent to ${recipients.length} recipient(s)`,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to send interview confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EMAIL_SEND_FAILED',
      500
    );
  }
}

/**
 * Send interview reminder email (24h or 1h before)
 * Sends emails to: student, interviewer, and guests
 */
export async function sendInterviewReminderEmail(
  interviewId: string,
  reminderType: InterviewReminderType = '24H'
): Promise<ScheduledEmailResult> {
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

    // Only send for PENDING and RESCHEDULED
    const allowedStatuses = ['PENDING', 'RESCHEDULED'];
    if (
      interview.status &&
      !allowedStatuses.includes(interview.status.toUpperCase())
    ) {
      return {
        success: true,
        message: `Interview email skipped for status: ${interview.status}`,
      };
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
    const interviewerEmail = interviewer?.email;
    const guests = interview.guests ?? [];

    const subject = `Interview Reminder - ${interview.title} (in ${reminderType === '24H' ? '24 hours' : '1 hour'})`;
    const body = getInterviewReminderTemplate(
      studentName,
      interview.title,
      formatDate(interview.interviewDate),
      formatTime(interview.startTime),
      formatTime(interview.endTime),
      interview.platform,
      interview.interviewLink,
      `${interviewer?.firstName ?? ''} ${interviewer?.lastName ?? ''}`.trim() ||
        'Interviewer',
      interviewerEmail ?? 'Not provided',
      reminderType === '24H' ? '24 hours' : '1 hour'
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
      const emailType: EmailType =
        reminderType === '24H'
          ? 'INTERVIEW_REMINDER_EMAIL_24H'
          : 'INTERVIEW_REMINDER_EMAIL_1H';

      await logEmailNotification(
        emailType,
        recipient.email,
        `Interview reminder (${reminderType}) sent for ${interview.title} to ${recipient.type}`,
        'SENT'
      );
    }

    return {
      success: true,
      message: `Interview reminder email (${reminderType}) sent to ${recipients.length} recipient(s)`,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      `Failed to send interview reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      'EMAIL_SEND_FAILED',
      500
    );
  }
}

/**
 * Get all interviews scheduled for a specific time range
 */
export async function getInterviewsInTimeRange(
  startTime: Date,
  endTime: Date
): Promise<InterviewEmailSchedule[]> {
  const interviews = await prisma.interview.findMany({
    where: {
      interviewDate: {
        gte: startTime,
        lte: endTime,
      },
      status: {
        in: ['PENDING', 'RESCHEDULED'],
      },
    },
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

  return interviews.map(interview => {
    const interviewer = interview.interviewer.userPortalCategory?.user;
    return {
      applicationId: interview.applicationId,
      interviewId: interview.id,
      studentEmail: interview.application.personalInformation?.email ?? '',
      studentName:
        `${interview.application.personalInformation?.firstName ?? ''} ${interview.application.personalInformation?.lastName ?? ''}`.trim() ||
        '',
      interviewDate: interview.interviewDate,
      startTime: interview.startTime,
      endTime: interview.endTime,
      platform: interview.platform,
      interviewLink: interview.interviewLink,
      guests: interview.guests ?? [],
      ...(interviewer?.agentEmail && {
        interviewerEmail: interviewer.agentEmail,
      }),
      ...(interviewer && {
        interviewerName:
          `${interviewer.firstName} ${interviewer.lastName}`.trim(),
      }),
    };
  });
}
export async function processScheduledInterviewEmails(
  reminderType: InterviewReminderType
): Promise<{
  success: number;
  failed: number;
  results: Array<{ interviewId: string; success: boolean; error?: string }>;
}> {
  const now = new Date();
  const targetTime = new Date(
    now.getTime() + (reminderType === '24H' ? 24 : 1) * 60 * 60 * 1000
  );

  const interviews = await getInterviewsInTimeRange(now, targetTime);
  const results: Array<{
    interviewId: string;
    success: boolean;
    error?: string;
  }> = [];

  for (const interview of interviews) {
    try {
      await sendInterviewReminderEmail(interview.interviewId, reminderType);
      results.push({ interviewId: interview.interviewId, success: true });
    } catch (error) {
      results.push({
        interviewId: interview.interviewId,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return {
    success: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results,
  };
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

/**
 * Get upcoming interviews that will receive emails
 * Returns interviews scheduled for confirmation, 24h reminder, and 1h reminder
 */
export async function getUpcomingInterviewsForEmails(): Promise<{
  confirmations: InterviewEmailSchedule[];
  reminders24h: InterviewEmailSchedule[];
  reminders1h: InterviewEmailSchedule[];
}> {
  const now = new Date();
  const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  // Get interviews for confirmation (next 1 hour)
  const confirmations = await getInterviewsInTimeRange(now, oneHourFromNow);

  // Get interviews for 24h reminder (23-25 hours from now)
  const twentyThreeHoursFromNow = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const twentyFiveHoursFromNow = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const reminders24h = await getInterviewsInTimeRange(
    twentyThreeHoursFromNow,
    twentyFiveHoursFromNow
  );

  // Get interviews for 1h reminder (0-2 hours from now)
  const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const reminders1h = await getInterviewsInTimeRange(now, twoHoursFromNow);

  return {
    confirmations,
    reminders24h,
    reminders1h,
  };
}

/**
 * Get all upcoming interviews with recipient information
 */
export async function getUpcomingInterviewsWithRecipients(
  startTime?: Date,
  endTime?: Date
): Promise<
  Array<{
    interviewId: string;
    title: string;
    interviewDate: Date;
    startTime: Date;
    endTime: Date;
    platform: string;
    studentEmail: string;
    studentName: string;
    interviewerEmail?: string;
    interviewerName?: string;
    guests: string[];
    totalRecipients: number;
  }>
> {
  const now = new Date();
  const start = startTime ?? now;
  const end = endTime ?? new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Default: next 7 days

  const interviews = await prisma.interview.findMany({
    where: {
      interviewDate: {
        gte: start,
        lte: end,
      },
      status: {
        in: ['PENDING', 'RESCHEDULED'],
      },
    },
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
    orderBy: {
      interviewDate: 'asc',
    },
  });

  return interviews.map(interview => {
    const interviewer = interview.interviewer.userPortalCategory?.user;
    const studentEmail = interview.application.personalInformation?.email ?? '';
    const guests = interview.guests ?? [];

    // Count total recipients
    let totalRecipients = 1; // Student
    if (interviewer?.email) totalRecipients += 1; // Interviewer
    totalRecipients += guests.length; // Guests

    return {
      interviewId: interview.id,
      title: interview.title,
      interviewDate: interview.interviewDate,
      startTime: interview.startTime,
      endTime: interview.endTime,
      platform: interview.platform,
      meetingLink: interview.interviewLink ?? '',
      studentEmail,
      studentName:
        `${interview.application.personalInformation?.firstName ?? ''} ${interview.application.personalInformation?.lastName ?? ''}`.trim() ||
        'N/A',
      ...(interviewer?.email && { interviewerEmail: interviewer.email }),
      ...(interviewer && {
        interviewerName:
          `${interviewer.firstName} ${interviewer.lastName}`.trim(),
      }),
      guests,
      totalRecipients,
    };
  });
}
