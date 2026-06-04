import prisma from '../../../prismaClient';
import { sendEmail } from '../../general/mail/mailer';
import { AppError } from '../../../utils/AppError';
import { logEmailNotification } from '../../../utils/emailLogger';
import { EmailType } from '@prisma/client';

/**
 * Incomplete application email data
 */
export interface IncompleteApplicationEmailData {
  applicationId: string;
  studentEmail: string;
  studentName: string;
  courseName: string;
  applicationRef: string;
  missingDocs: Array<{
    name: string;
    status: string;
    section: string;
  }>;
  daysSinceCreation: number;
}

/**
 * Get missing documents from application
 */
export function getMissingDocuments(application: {
  academicBackground: unknown | null;
  personalStatement: unknown | null;
  nextOfKin: unknown | null;
  reference: unknown | null;
  supportingDocument: {
    supportingDocumentAttachments: Array<{
      name: string | null;
      status: string | null;
    }>;
  } | null;
}): Array<{
  name: string;
  status: string;
  section: string;
}> {
  const missingDocs: Array<{
    name: string;
    status: string;
    section: string;
  }> = [];

  // Check supporting documents
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

  // Check other required sections
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
    {
      name: 'Reference',
      data: application.reference,
      section: 'References',
    },
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
 * Calculate days since application creation
 */
export function getDaysSinceCreation(createdAt: Date): number {
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
 * Send incomplete application reminder email
 * This is the main template function for incomplete applications
 */
export async function sendIncompleteApplicationReminderEmail(
  applicationId: string,
  reminderType: 'FIRST' | 'SECOND' | 'FINAL' = 'FIRST'
): Promise<{
  success: boolean;
  message: string;
  emailSent: boolean;
}> {
  try {
    // Fetch application with all required relationships
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
      },
    });

    if (!application) {
      throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
    }

    // Corner Case: Check if email is verified
    if (!application.personalInformation?.verifiedEmail) {
      return await sendEmailVerificationReminder(application);
    }

    // Get missing documents
    const missingDocs = getMissingDocuments(application);

    // Check if application is complete
    if (missingDocs.length === 0) {
      console.log(
        `[IncompleteApplicationEmail] Application ${applicationId} has all documents, skipping reminder`
      );
      return {
        success: true,
        message: 'Application is complete, reminder suppressed',
        emailSent: false,
      };
    }

    const missingDocsList = missingDocs
      .map(doc => `• ${doc.name} (${doc.section})`)
      .join('\n');

    const applicantName =
      `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim() ||
      'Applicant';
    const courseName =
      application.courseSelection?.course?.course?.title ??
      'your chosen course';
    const applicationRef = application.applicationId ?? application.id;
    const daysSinceCreation = getDaysSinceCreation(application.createdAt);

    const subject = `Complete Your Application - ${applicationRef}`;
    const body = getIncompleteApplicationReminderTemplate(
      applicantName,
      courseName,
      applicationRef,
      missingDocsList,
      daysSinceCreation,
      reminderType
    );

    // Send email directly
    await sendEmail(
      application.personalInformation?.email ?? '',
      subject,
      body,
      body.replace(/<[^>]*>/g, '')
    );

    // Log to NotificationLog
    await logEmailNotification(
      EmailType.INCOMPLETE_APPLICATION_REMINDER_EMAIL,
      application.personalInformation?.email ?? '',
      `Incomplete application reminder sent: ${reminderType}`,
      'SENT'
    );

    return {
      success: true,
      message: 'Incomplete application reminder sent successfully',
      emailSent: true,
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
    };
  }
}

/**
 * Send email verification reminder
 * Corner Case: When applicant's email is unverified
 */
export async function sendEmailVerificationReminder(application: {
  id: string;
  personalInformation: {
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    verifiedEmail: boolean;
  } | null;
}): Promise<{
  success: boolean;
  message: string;
  emailSent: boolean;
}> {
  const applicantName =
    `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim() ||
    'Applicant';
  const email = application.personalInformation?.email;

  if (!email) {
    return {
      success: false,
      message: 'Email not found',
      emailSent: false,
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
  };
}

/**
 * Send final notice for incomplete application
 */
export async function sendFinalNoticeEmail(applicationId: string): Promise<{
  success: boolean;
  message: string;
  emailSent: boolean;
}> {
  return sendIncompleteApplicationReminderEmail(applicationId, 'FINAL');
}
