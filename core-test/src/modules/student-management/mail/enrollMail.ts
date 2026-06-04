import prisma from "../../../prismaClient";
import { AppError } from "../../../utils/AppError";
import { transporter } from "./config";

export const sendEnrollmentEmail = async (applicationId: string, amount: number, paymentType?: string) => {
  // 🟢 1. Fetch application with all needed relations
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      courseSelection: {
        include: {
          course: {
            include: {
              course: true, // include the real Course model
            },
          },
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
    throw new AppError("Application not found", "NOT_FOUND", 404);
  }

  // 🟢 2. Extract fields safely
  const studentName =
    `${application.personalInformation?.firstName ?? ""} ${application.personalInformation?.lastName ?? ""}`.trim();
  const studentEmail = application.personalInformation?.email;
  const agentEmail =
    application.userPortalCategoryRoleApplications[0]?.userPortalCategoryRole?.userPortalCategory?.user?.agentEmail;

  const courseName = application.courseSelection?.course?.course?.title ?? "your selected course";
  const courseId = application.courseSelection?.courseId ?? "N/A";

  if (!studentEmail && !agentEmail) {
    throw new AppError("No recipient email found", "NOT_FOUND", 404);
  }

  // 🟢 3. Prepare recipient list (TypeScript safe)
  const recipients = [studentEmail, agentEmail].filter((email): email is string => Boolean(email));

  // 🟢 4. Prepare HTML email
  const htmlContent = `
    <html>
      <body style="font-family: 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7fb;">
        <div style="max-width: 650px; margin: 40px auto; background: #ffffff; padding: 30px 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://img.icons8.com/color/96/000000/paid.png" alt="Payment Successful" style="width: 80px;"/>
            <h2 style="color: #2c3e50; margin-top: 10px;">Payment Confirmation</h2>
          </div>

          <p style="font-size: 16px;">Dear <strong>${studentName}</strong>,</p>

          <p style="font-size: 16px; margin-bottom: 20px;">
            We are pleased to inform you that your payment for the course
            <strong>${courseName}</strong> ${paymentType === "SEMESTER" ? "(Full-First Semester)" : ""} (Course ID: <strong>${courseId}</strong>) has been successfully received.
          </p>

          <div style="background-color: #f1f8ff; padding: 15px 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="font-size: 16px; margin: 0;">
              💳 <strong>Amount Paid:</strong> $${amount.toFixed(2)}
            </p>
            <p style="font-size: 16px; margin: 5px 0 0;">
              🧾 <strong>Application ID:</strong> ${applicationId}
            </p>
          </div>

          <p style="font-size: 16px; margin-bottom: 20px;">
            You are now officially enrolled! Please log in to your student portal to view your full enrollment details and access your learning materials.
          </p>

          <div style="text-align: center; margin-top: 30px;">
            <a href="https://yourstudentportal.com/login" 
               style="display: inline-block; background-color: #007bff; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-size: 16px;">
              Go to Student Portal
            </a>
          </div>

          <hr style="margin: 40px 0; border: none; border-top: 1px solid #eee;" />

          <p style="font-size: 13px; color: #888; text-align: center;">
            This is an automated message. Please do not reply.<br/>
            © ${new Date().getFullYear()} Your Institution Name. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;

  // 🟢 5. Send email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: recipients,
    subject: `Payment Received – Enrollment Successful for ${courseName}${paymentType === "SEMESTER" ? " (Full-First Semester)" : ""}`,
    html: htmlContent,
  });
};
