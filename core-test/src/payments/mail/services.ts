import nodemailer from "nodemailer";
import prisma from "../../prismaClient";
import { AppError } from "../../utils/AppError";
import { transporter } from "../../modules/student-management/mail/config";
import { sendApplicationDecisionRequestNotification } from "../../utils/notificationService";

export const sendApplicationDecisionRequestEmail = async (applicationId: string, outcome: string) => {
  // Send notification via the notification service
  sendApplicationDecisionRequestNotification({ applicationId, outcome });

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
    },
  });

  if (!application) {
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }

  const applicantName =
    `${application.personalInformation?.firstName ?? ""} ${application.personalInformation?.lastName ?? ""}`.trim();
  const applicationRef = application.applicationId || application.id;

  // ✅ Validate backend URL
  const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
  if (!backendUrl) {
    throw new AppError("BACKEND_URL environment variable is not configured", "CONFIG_ERROR", 500);
  }

  // ✅ URLs for decision actions
  const approveUrl = `${backendUrl}/decision-emails/applicant/${applicationId}/decision?outcome=${outcome}`;
  const rejectUrl = `${backendUrl}/decision-emails/applicant/${applicationId}/decision?outcome=${outcome}`;

  const mailOptions: nodemailer.SendMailOptions = {
    from: process.env.EMAIL_USER,
    to: application.personalInformation?.email || "",
    subject: `Decision Required: Application ${applicationRef}`,
    html: `
        <html>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; background-color: #f4f4f4; padding: 20px;">
            <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <h2 style="color: #2c3e50;">Application Decision Required</h2>
              <p>Hello,</p>
              <p>An application from <strong>${applicantName}</strong> (Ref: ${applicationRef}) is awaiting your decision.</p>

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
                Email: ${application.personalInformation?.email || "N/A"}<br/>
                Application ID: ${applicationRef}
              </p>

              <p style="margin-top: 25px; color: #95a5a6; font-size: 12px; text-align: center;">
                © ${new Date().getFullYear()} Admissions Portal
              </p>
            </div>
          </body>
        </html>
      `,
  };

  return transporter.sendMail(mailOptions);
};
