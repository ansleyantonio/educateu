import nodemailer from "nodemailer";
import prisma from "../../../prismaClient";
import { AppError } from "../../../utils/AppError";
import { send } from "process";

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

export const sendRegisterEmail = (email: string, name: string, password: string, loginUrl: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to the Platform",
    html: `<html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <p>Hi <strong>${name}</strong>,</p>
        <p>
          An account has been created for you by the administrator on
          <strong>Student Portal</strong>.
        </p>
        <h3>Account Details</h3>
        <ul style="list-style-type: none; padding-left: 0">
          <li><strong>Username:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
          <li>
            <strong>Login URL:</strong>
            <a href="${loginUrl}" target="_blank" rel="noopener noreferrer">${loginUrl}</a>
          </li>
        </ul>
        <p>We recommend logging in as soon as possible to update your password and complete your profile.</p>
        <p>
          If you have any questions or encounter any issues while logging in, feel free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>

        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Abree Team</p>
      </body>
    </html>`,
  };
  return transporter.sendMail(mailOptions);
};

export const sendWellbeingEmail = (emails: string[], name: string, status: string) => {
  let statusMessage = "";

  if (status === "APPROVED") {
    statusMessage = `
      <p>We are pleased to inform you that your Wellbeing Check Status has been ${status}.</p>
      <p>Congratulations on this achievement!</p>
    `;
  } else if (status === "PENDING") {
    statusMessage = `
      <p>Your Wellbeing Check Status is currently under review and is marked as ${status}.</p>
      <p>We will notify you once a decision has been made.</p>
    `;
  } else if (status === "REJECTED") {
    statusMessage = `
      <p>We regret to inform you that your Wellbeing Check Status has been ${status}.</p>
      <p>Please review the reasons for this decision and consider reapplying in the future.</p>
    `;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: `Application ${status} Notification`,
    html: `<html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
            Wellbeing Status Change for ${name}
          </h2>

          <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            ${statusMessage}
          </div>

          <p>
            If you have any questions or need further clarification regarding this decision, please feel free to email
            <a href="mailto:admin@arbreesolutions.com" style="color: #3498db; text-decoration: none;">admin@arbreesolutions.com</a>.
          </p>

          <p>We appreciate your understanding.</p>

          <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
            Best regards,<br />The Abree Team
          </p>
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendNotesEmail = (emails: string[], name: string, noteContent: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: `New Note Added For ${name}`,
    html: `<html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">  

          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
            New Note Added 
          </h2>


          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            A new note has been added to the application for ${name}:
          </p>

          <blockquote style="border-left: 4px solid #ccc; padding-left: 12px; margin: 20px 0; color: #555;">
            ${noteContent}
          </blockquote>

          <p style="font-size: 16px; line-height: 1.6;">
            Please log in to your account to view the full details.
          </p>

          <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
            Best regards,<br />The Abree Team
          </p>
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

export const sendInterviewEmail = (
  emails: string[],
  name: string,
  interviewDate: string,
  interviewStartTime: string,
  interviewEndTime: string,
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emails,
    subject: `Interview Scheduled for ${name}`,
    html: `<html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">  
          <h2 style="color: #2c3e50; text-align: center; margin-bottom: 20px;">
            Interview Scheduled for ${name}
          </h2>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">

            We are pleased to inform you that an interview has been scheduled for ${name}. Below are the details of the interview:
          </p>

          <ul style="list-style-type: none; padding-left: 0; font-size: 16px; line-height: 1.6; color: #555;">
            <li><strong>Date:</strong> ${interviewDate}</li>
            <li><strong>Time:</strong> ${interviewStartTime} - ${interviewEndTime}</li>
          </ul>
          <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
            Best regards,<br />The Abree Team
          </p>  
        </div>
      </body>
    </html>`,
  };

  return transporter.sendMail(mailOptions);
};

// export const sendApplicationOutcomeEmail = async (applicationId: string, outcome: string) => {
//   const application = await prisma.application.findUnique({
//     where: { id: applicationId },
//     include: {
//       personalInformation: true,
//       userPortalCategoryRoleApplications: {
//         include: {
//           userPortalCategoryRole: {
//             include: { userPortalCategory: { include: { user: true } } },
//           },
//         },
//       },
//     },
//   });

//   if (!application) {
//     throw new AppError("Application not found", "NOT_FOUND", 404);
//   }

//   const user = application?.userPortalCategoryRoleApplications?.[0]?.userPortalCategoryRole?.userPortalCategory?.user;
//   const senderEmail = user?.email || user?.agentEmail || user?.facultyEmail;
//   const applicantName =
//     `${application.personalInformation?.firstName ?? ""} ${application.personalInformation?.lastName ?? ""}`.trim();
//   const applicationRef = application.applicationId;

//   // Outcome-specific email configurations
//   const emailConfigs = {
//     APPROVED_UNCONDITIONAL: {
//       subject: `Congratulations! Your Application ${applicationRef} has been Approved`,
//       color: "#27ae60",
//       header: `Congratulations ${applicantName}!`,
//       content: `
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           We are pleased to inform you that your application has been <strong>unconditionally approved</strong>.
//         </p>
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           This means you have met all the requirements for admission. Welcome to our institution!
//         </p>
//         <p style="font-size: 16px; line-height: 1.6;">
//           Please log in to your account to view the full details and next steps for enrollment.
//         </p>
//       `,
//     },
//     APPROVED_CONDITIONAL: {
//       subject: `Your Application ${applicationRef} has been Conditionally Approved`,
//       color: "#f39c12",
//       header: `Congratulations ${applicantName}!`,
//       content: `
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           We are pleased to inform you that your application has been <strong>conditionally approved</strong>.
//         </p>
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           This means you have been accepted, but there are some conditions you need to fulfill before final admission.
//         </p>
//         <p style="font-size: 16px; line-height: 1.6;">
//           Please log in to your account to view the specific conditions and next steps.
//         </p>
//       `,
//     },
//     REJECTED: {
//       subject: `Update on Your Application ${applicationRef}`,
//       color: "#c0392b",
//       header: `Dear ${applicantName},`,
//       content: `
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           We regret to inform you that your application has not been successful at this time.
//         </p>
//         <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
//           We appreciate your interest in our institution and encourage you to consider applying again in the future.
//         </p>
//         <p style="font-size: 16px; line-height: 1.6;">
//           You may log in to your account for more information or to reapply in the future.
//         </p>
//       `,
//     },
//   };

//   const config = emailConfigs[outcome as keyof typeof emailConfigs] || {
//     subject: `Update on Your Application ${applicationRef}`,
//     color: "#3498db",
//     header: `Dear ${applicantName},`,
//     content: `
//       <p style="font-size: 16px; line-height: 1.6;">
//         Your application status has been updated to: <strong>${outcome}</strong>.
//       </p>
//     `,
//   };

//   const mailOptions: nodemailer.SendMailOptions = {
//     from: process.env.EMAIL_USER,
//     to: application.personalInformation?.email,
//     subject: config.subject,
//     html: `
//       <html>
//         <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
//           <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
//             <h2 style="color: ${config.color}; text-align: center; margin-bottom: 20px;">
//               ${config.header}
//             </h2>
//             ${config.content}
//             <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
//               Best regards,<br />The Abree Team
//             </p>
//           </div>
//         </body>
//       </html>
//     `,
//     ...(senderEmail ? { cc: senderEmail } : {}),
//   };

//   return transporter.sendMail(mailOptions);
// };
