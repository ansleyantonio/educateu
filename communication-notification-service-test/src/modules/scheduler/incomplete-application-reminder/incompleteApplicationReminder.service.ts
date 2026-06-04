import prisma from '../../../prismaClient';
import { sendEmail } from '../../general/mail/mailer';
import { AppError } from '../../../utils/AppError';
import { sendNotificationToUser } from '../../agent-notification/agent-notification.websocket';
import { EmailType } from '@prisma/client';
import { logEmailNotification } from '../../../utils/emailLogger';

/**
 * Interface for incomplete application reminder data
 */
export interface IncompleteApplicationData {
  id: string;
  applicationId: string | null;
  createdAt: Date;
  updatedAt: Date;
  status: string | null;
  stage: string | null;
  studentEmail: string;
  studentName: string;
  courseName?: string;
  missingDocuments: MissingDocument[];
  agentUserId?: string;
  agentEmail?: string;
}

/**
 * Interface for missing document information
 */
export interface MissingDocument {
  name: string;
  status: string | null;
  section: string;
}

/**
 * Interface for sending reminder email
 */
export interface SendReminderInput {
  applicationId: string;
  sendAt?: Date;
  reminderType?: 'FIRST' | 'SECOND' | 'FINAL';
}

/**
 * Interface for reminder email result
 */
export interface ReminderEmailResult {
  success: boolean;
  message: string;
  emailSent: boolean;
  inAppNotificationSent: boolean;
}

/**
 * Interface for application with all required relationships
 */
interface ApplicationWithRelations {
  id: string;
  applicationId: string | null;
  status: string | null;
  stage: string | null;
  createdAt: Date;
  updatedAt: Date;
  personalInformation: {
    firstName: string;
    lastName: string;
    email: string;
    verifiedEmail: boolean;
  } | null;
  courseSelection: {
    course: {
      course: {
        title: string | null;
      } | null;
    } | null;
  } | null;
  academicBackground: unknown | null;
  personalStatement: unknown | null;
  disabilityAndAccessibility: unknown | null;
  nextOfKin: unknown | null;
  fund: unknown | null;
  reference: unknown | null;
  criminalBackground: unknown | null;
  supportingDocument: {
    supportingDocumentAttachments: Array<{
      name: string | null;
      status: string | null;
    }>;
  } | null;
  userPortalCategoryRoleApplications: Array<{
    userPortalCategoryRole: {
      userPortalCategory: {
        user: {
          id: string;
          email: string | null;
          agentEmail: string | null;
        };
      };
    };
  }>;
}

/**
 * Get missing documents from an application
 */
function getMissingDocuments(
  application: ApplicationWithRelations
): MissingDocument[] {
  const missingDocs: MissingDocument[] = [];

  if (application.supportingDocument?.supportingDocumentAttachments) {
    const pendingDocs =
      application.supportingDocument.supportingDocumentAttachments.filter(
        doc => doc.status !== 'APPROVED'
      );
    missingDocs.push(
      ...pendingDocs.map(doc => ({
        name: doc.name ?? 'Supporting Document',
        status: doc.status ?? 'PENDING',
        section: 'Supporting Documents',
      }))
    );
  }

  const requiredSections = [
    {
      name: 'Academic Background',
      data: application.academicBackground,
      section: 'Academic Information',
    },
    {
      name: 'Personal Statement',
      data: application.personalStatement,
      section: 'Personal Statement',
    },
    {
      name: 'Next of Kin',
      data: application.nextOfKin,
      section: 'Next of Kin',
    },
    { name: 'Reference', data: application.reference, section: 'References' },
  ];

  requiredSections.forEach(section => {
    if (!section.data || Object.keys(section.data).length === 0) {
      missingDocs.push({
        name: section.name,
        status: 'INCOMPLETE',
        section: section.section,
      });
    }
  });

  return missingDocs;
}

/**
 * Check if application has all required documents
 */
function hasAllDocuments(application: ApplicationWithRelations): boolean {
  const missingDocs = getMissingDocuments(application);
  return missingDocs.length === 0;
}

/**
 * Get agent info from application
 */
function getAgentInfo(application: ApplicationWithRelations): {
  agentUserId: string | null;
  agentEmail: string | null;
} {
  const agentRole = application.userPortalCategoryRoleApplications?.find(
    app => app.userPortalCategoryRole.userPortalCategory.user.agentEmail
  );

  return {
    agentUserId:
      agentRole?.userPortalCategoryRole.userPortalCategory.user.id ?? null,
    agentEmail:
      agentRole?.userPortalCategoryRole.userPortalCategory.user.agentEmail ??
      null,
  };
}

/**
 * Calculate days since application creation
 */
function getDaysSinceCreation(createdAt: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - createdAt.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Fixed HTML template for incomplete application reminder
 */
function getIncompleteApplicationReminderTemplate(
  applicantName: string,
  courseName: string,
  applicationRef: string,
  missingDocsList: string,
  daysSinceCreation: number,
  reminderType: 'FIRST' | 'SECOND' | 'FINAL'
): string {
  const urgencyColor =
    reminderType === 'FINAL'
      ? '#c53030'
      : reminderType === 'SECOND'
        ? '#d69e2e'
        : '#2c5282';
  const urgencyText =
    reminderType === 'FINAL'
      ? 'Final Notice'
      : reminderType === 'SECOND'
        ? 'Second Reminder'
        : 'Friendly Reminder';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${urgencyColor};">${urgencyText}</h2>
          
          <p>Dear ${applicantName},</p>
          
          <p>We noticed that your application for <strong>${courseName}</strong> (Reference: ${applicationRef}) is still incomplete.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${urgencyColor};">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Missing/Incomplete Items:</strong></p>
            <div style="background-color: white; padding: 15px; border-radius: 4px;">
              <p style="margin: 0; white-space: pre-line;">${missingDocsList}</p>
            </div>
          </div>
          
          <p>To avoid delays in processing your application, please complete the missing sections as soon as possible.</p>
          
          <div style="background-color: #ebf8ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Application Status:</strong> DRAFT<br/>
            <strong>Days Since Creation:</strong> ${daysSinceCreation} days</p>
          </div>
          
          <div style="margin: 30px 0; text-align: center;">
            <p style="margin-bottom: 15px;">Please log in to your account to complete your application:</p>
            <a href="#" style="background-color: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Complete Your Application</a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br/>The Admissions Team</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Fixed HTML template for email verification reminder
 */
function getEmailVerificationTemplate(applicantName: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c5282;">Email Verification Required</h2>
          
          <p>Dear ${applicantName},</p>
          
          <p>Thank you for starting your application. Before you can proceed, we need to verify your email address.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p>Please click the button below to verify your email address:</p>
            <div style="margin: 20px 0; text-align: center;">
              <a href="#" style="background-color: #2c5282; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Verify Email</a>
            </div>
            <p style="margin: 0; color: #718096; font-size: 14px;">This link will expire in 24 hours.</p>
          </div>
          
          <p>If you did not create an application, please ignore this email.</p>
          
          <p>Best regards,<br/>The Admissions Team</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send incomplete application reminder email to applicant
 */
export const sendIncompleteApplicationReminderEmail = async (
  applicationId: string,
  reminderType: 'FIRST' | 'SECOND' | 'FINAL' = 'FIRST'
): Promise<ReminderEmailResult> => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        personalInformation: true,
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
              },
            },
          },
        },
        academicBackground: true,
        personalStatement: true,
        disabilityAndAccessibility: true,
        nextOfKin: true,
        fund: true,
        reference: true,
        criminalBackground: true,
        supportingDocument: {
          include: {
            supportingDocumentAttachments: true,
          },
        },
        userPortalCategoryRoleApplications: {
          include: {
            userPortalCategoryRole: {
              include: {
                userPortalCategory: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
    }

    const typedApplication = application as unknown as ApplicationWithRelations;

    // Corner Case: Check if email is verified
    if (!typedApplication.personalInformation?.verifiedEmail) {
      return await sendEmailVerificationReminder(typedApplication);
    }

    // Check if all documents are submitted (suppress reminder)
    if (hasAllDocuments(typedApplication)) {
      console.log(
        `[IncompleteApplicationReminder] Application ${applicationId} has all documents, skipping reminder`
      );
      return {
        success: true,
        message: 'Application is complete, reminder suppressed',
        emailSent: false,
        inAppNotificationSent: false,
      };
    }

    const missingDocs = getMissingDocuments(typedApplication);
    const missingDocsList = missingDocs
      .map(doc => `• ${doc.name} (${doc.section})`)
      .join('\n');

    const applicantName =
      `${typedApplication.personalInformation?.firstName ?? ''} ${typedApplication.personalInformation?.lastName ?? ''}`.trim() ||
      'Applicant';
    const courseName =
      typedApplication.courseSelection?.course?.course?.title ??
      'your chosen course';
    const applicationRef =
      typedApplication.applicationId ?? typedApplication.id;
    const agentInfo = getAgentInfo(typedApplication);

    const subject = `Complete Your Application - ${applicationRef}`;
    const body = getIncompleteApplicationReminderTemplate(
      applicantName,
      courseName,
      applicationRef,
      missingDocsList,
      getDaysSinceCreation(typedApplication.createdAt),
      reminderType
    );

    // Send email directly
    await sendEmail(
      // typedApplication.personalInformation?.email ?? '',
      agentInfo?.agentEmail ??
        typedApplication.personalInformation?.email ??
        '',
      subject,
      body,
      body.replace(/<[^>]*>/g, '')
    );

    // Log to NotificationLog
    await logEmailNotification(
      EmailType.INCOMPLETE_APPLICATION_REMINDER_EMAIL,
      typedApplication.personalInformation?.email ?? '',
      `Incomplete application reminder sent: ${reminderType}`,
      'SENT'
    );

    // Send in-app notification to agent (if agent exists)
    let inAppNotificationSent = false;
    if (agentInfo.agentUserId) {
      try {
        sendNotificationToUser(agentInfo.agentUserId, {
          notificationId: `incomplete-app-${application.id}-${Date.now()}`,
          action: 'created',
          notification: {
            type: 'INCOMPLETE_APPLICATION_REMINDER',
            applicationId: application.id,
            applicationRef,
            applicantName,
            missingDocuments: missingDocs,
            reminderType,
            message: `Application ${applicationRef} is incomplete. Missing: ${missingDocs.map(d => d.name).join(', ')}`,
          },
        });
        inAppNotificationSent = true;
        console.log(
          `[IncompleteApplicationReminder] In-app notification sent to agent for application ${applicationId}`
        );
      } catch (error) {
        console.error(
          `[IncompleteApplicationReminder] Failed to send in-app notification: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    return {
      success: true,
      message: 'Incomplete application reminder sent successfully',
      emailSent: true,
      inAppNotificationSent,
    };
  } catch (error) {
    console.error('Error in sendIncompleteApplicationReminderEmail:', error);

    if (error instanceof AppError) {
      throw error;
    }

    return {
      success: false,
      message: `Failed to send reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      emailSent: false,
      inAppNotificationSent: false,
    };
  }
};

/**
 * Send email verification reminder
 */
async function sendEmailVerificationReminder(
  application: ApplicationWithRelations
): Promise<ReminderEmailResult> {
  const applicantName =
    `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim() ||
    'Applicant';
  const email = application.personalInformation?.email;

  if (!email) {
    return {
      success: false,
      message: 'Email not found',
      emailSent: false,
      inAppNotificationSent: false,
    };
  }

  const subject = 'Verify Your Email to Complete Application';
  const body = getEmailVerificationTemplate(applicantName);

  // Send email directly
  await sendEmail(email, subject, body, body.replace(/<[^>]*>/g, ''));

  // Log to NotificationLog
  await logEmailNotification(
    EmailType.INCOMPLETE_APPLICATION_VERIFICATION_REMINDER_EMAIL,
    email,
    'Incomplete application verification reminder sent',
    'SENT'
  );

  return {
    success: true,
    message: 'Email verification reminder sent',
    emailSent: true,
    inAppNotificationSent: false,
  };
}

/**
 * Get incomplete applications older than specified days
 */
export const getIncompleteApplicationsOlderThan = async (
  days: number
): Promise<
  Array<{ id: string; applicationId: string | null; createdAt: Date }>
> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const applications = await prisma.application.findMany({
    where: {
      status: 'DRAFT',
      createdAt: {
        lt: cutoffDate,
      },
    },
    select: {
      id: true,
      applicationId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return applications;
};

/**
 * Check if reminder was already sent for an application
 */
export const hasReminderBeenSent = async (
  applicationId: string,
  withinDays: number = 7
): Promise<boolean> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - withinDays);

  const existingLog = await prisma.emailLog.findFirst({
    where: {
      metadata: {
        path: ['applicationId'],
        equals: applicationId,
      },
      status: 'SENT',
      createdAt: {
        gte: cutoffDate,
      },
    },
  });

  return !!existingLog;
};

/**
 * Process all incomplete applications and send reminders
 */
export const processIncompleteApplicationReminders = async (
  daysThreshold: number = 3,
  reminderType: 'FIRST' | 'SECOND' | 'FINAL' = 'FIRST'
): Promise<{
  total: number;
  success: number;
  failed: number;
  skipped: number;
  results: Array<{
    applicationId: string;
    success: boolean;
    error?: string;
  }>;
}> => {
  const applications = await getIncompleteApplicationsOlderThan(daysThreshold);

  console.log(
    `[IncompleteApplicationReminder] Found ${applications.length} incomplete applications older than ${daysThreshold} days`
  );

  const results: Array<{
    applicationId: string;
    success: boolean;
    error?: string;
  }> = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const app of applications) {
    const alreadySent = await hasReminderBeenSent(app.id);

    if (alreadySent) {
      console.log(
        `[IncompleteApplicationReminder] ⏭️ Reminder already sent for application: ${app.applicationId ?? app.id}`
      );
      skippedCount++;
      results.push({
        applicationId: app.applicationId ?? app.id,
        success: true,
      });
      continue;
    }

    try {
      const result = await sendIncompleteApplicationReminderEmail(
        app.id,
        reminderType
      );

      if (result.success) {
        successCount++;
        console.log(
          `[IncompleteApplicationReminder] ✅ Reminder sent for application: ${app.applicationId ?? app.id}`
        );
        results.push({
          applicationId: app.applicationId ?? app.id,
          success: true,
        });
      } else {
        failedCount++;
        console.error(
          `[IncompleteApplicationReminder] ❌ Failed to send reminder for ${app.applicationId ?? app.id}: ${result.message}`
        );
        results.push({
          applicationId: app.applicationId ?? app.id,
          success: false,
          error: result.message,
        });
      }
    } catch (error) {
      failedCount++;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error(
        `[IncompleteApplicationReminder] ❌ Failed to send reminder for ${app.applicationId ?? app.id}: ${errorMessage}`
      );
      results.push({
        applicationId: app.applicationId ?? app.id,
        success: false,
        error: errorMessage,
      });
    }
  }

  return {
    total: applications.length,
    success: successCount,
    failed: failedCount,
    skipped: skippedCount,
    results,
  };
};
