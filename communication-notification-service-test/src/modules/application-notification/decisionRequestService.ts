import type nodemailer from 'nodemailer';
import type { SentMessageInfo } from 'nodemailer';
import { EmailType } from '@prisma/client';
import prisma from '../../prismaClient';
import { AppError } from '../../utils/AppError';
import { logEmailNotification } from '../../utils/emailLogger';
import { renderTemplate } from '../../utils/renderTemplate';
import { transporter } from '../notification/mail.service';

export const sendApplicationDecisionRequestEmail = async (
  applicationId: string,
  outcome: string
): Promise<SentMessageInfo> => {
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      userPortalCategoryRoleApplications: {
        include: {
          userPortalCategoryRole: {
            include: {
              userPortalCategory: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      courseSelection: {
        select: {
          course: {
            select: {
              course: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 'NOT_FOUND', 404);
  }

  const courseTitle = application.courseSelection?.course?.course.title;
  const applicantId = application?.applicationId ?? application.id;
  const applicantName =
    `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim();
  const applicationReference = application.applicationId ?? application.id;

  // Validate backend URL
  const backendUrl = process.env['BACKEND_URL'] ?? 'http://localhost:3000';
  if (!backendUrl) {
    throw new AppError(
      'BACKEND_URL environment variable is not configured',
      'CONFIG_ERROR',
      500
    );
  }

  // URLs for decision actions
  const approveUrl = `${backendUrl}/decision-emails/applicant/${applicationId}/decision?outcome=${outcome}`;
  const rejectUrl = `${backendUrl}/api/v1/public/reject/applications/${applicationId}`;

  const template = await renderTemplate(
    EmailType.APPLICATION_DECISION_REQUEST_EMAIL,
    {
      email: application.personalInformation?.email ?? '',
      courseTitle,
      applicationId: applicantId,
      applicantName,
      applicationReference,
      approveUrl,
      rejectUrl,
    },
    { optionalFields: ['email'] }
  );

  const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50;">Application Decision Required</h2>
              <p>Hello,</p>
              <p>An application from <strong>${applicantName}</strong> (Ref: ${applicationReference}) is awaiting your decision.</p>
              
              <div style="margin: 20px 0; text-align: center;">
                <a href="${approveUrl}"
                   style="background-color: #27ae60; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; margin-right: 15px; font-weight: bold;">
                   ✅ Accept
                </a>
                <a href="${rejectUrl}"
                   style="background-color: #c0392b; color: white; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                   ❌ Reject
                </a>
              </div>

              <p style="font-size: 14px; color: #7f8c8d;">You will be redirected to confirm your action.</p>

              <hr style="margin: 25px 0; border: none; border-top: 1px solid #ddd;" />

              <p style="color: #2c3e50;">
                <strong>Applicant Details:</strong><br/>
                Name: ${applicantName}<br/>
                Email: ${application.personalInformation?.email ?? 'N/A'}<br/>
                Application ID: ${applicationId}
              </p>

              <p style="margin-top: 25px; color: #95a5a6; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Admissions Portal
              </p>
            </div>
          </body>
        </html>
      `;

  const emailBody = template.body ?? htmlContent;
  const subject =
    template.subject ??
    `Decision Required: Application ${applicationReference}`;
  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env['EMAIL_USER'],
    to: application.personalInformation?.email ?? '',
    subject: subject,
    html: emailBody,
  };

  await transporter.sendMail(mailOptions);

  // Log application decision request email
  if (application.personalInformation?.email) {
    await logEmailNotification(
      EmailType.APPLICATION_DECISION_REQUEST_EMAIL,
      application.personalInformation.email,
      `Application decision request email sent for ${applicationId}`
    );
  }

  return;
};
