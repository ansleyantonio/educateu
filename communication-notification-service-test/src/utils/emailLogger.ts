import prisma from '../prismaClient';
import type { EmailType } from '@prisma/client';
import type { Prisma } from '@prisma/client';

/**
 * Log email notification to the database
 */
export const logEmailNotification = async (
  emailType: EmailType,
  recipient: string,
  message: string,
  status: 'SENT' | 'FAILED' = 'SENT',
  userId?: string
): Promise<void> => {
  try {
    const data: Prisma.NotificationLogCreateInput = {
      emailType,
      recipient,
      message,
      status,
      ...(userId && { userId }),
    };

    await prisma.notificationLog.create({ data });
    console.log(`[EMAIL_LOG] Logged ${emailType} to ${recipient} - ${status}`);
  } catch (error) {
    console.error('[EMAIL_LOG_ERROR] Failed to log email notification:', error);
    // Don't throw error to avoid breaking email sending flow
  }
};

/**
 * Log multiple email notifications (for bulk emails)
 */
export const logBulkEmailNotifications = async (
  emailType: EmailType,
  recipients: string[],
  message: string,
  status: 'SENT' | 'FAILED' = 'SENT',
  userId?: string
): Promise<void> => {
  try {
    const logs: Prisma.NotificationLogCreateManyInput[] = recipients.map(
      recipient => ({
        emailType,
        recipient,
        message,
        status,
        ...(userId && { userId }),
      })
    );

    await prisma.notificationLog.createMany({ data: logs });
    console.log(
      `[EMAIL_LOG] Logged ${emailType} to ${recipients.length} recipients - ${status}`
    );
  } catch (error) {
    console.error(
      '[EMAIL_LOG_ERROR] Failed to log bulk email notifications:',
      error
    );
    // Don't throw error to avoid breaking email sending flow
  }
};
