import nodemailer from 'nodemailer';
import { env } from '../../config/env';
import { AppError } from '../../utils/AppError';
import { EmailType } from '@prisma/client';
import {
  logEmailNotification,
  logBulkEmailNotifications,
} from '../../utils/emailLogger';
import { renderTemplate } from '../../utils/renderTemplate';

// Create transporter for sending emails
let transporterInstance: nodemailer.Transporter | null = null;

// export const getTransporter = (): nodemailer.Transporter => {
//   transporterInstance ??= nodemailer.createTransport({
//     host: env.EMAIL_HOST,
//     port: parseInt(String(env.EMAIL_PORT || '587')),
//     secure: false,
//     ignoreTLS: true,

//     auth: {
//       user: env.EMAIL_USER || '',
//       pass: env.EMAIL_PASS || '',
//     },
//   });
//   return transporterInstance;
// };
export const getTransporter = (): nodemailer.Transporter => {
  transporterInstance ??= nodemailer.createTransport({
    host: process.env['SMTP_HOST'], // 18.171.208.170
    port: parseInt(String(process.env['SMTP_PORT'] ?? '1025')), // 1035
    secure: false,
    ignoreTLS: true,
  });
  return transporterInstance;
};
export const transporter = getTransporter();

/**
 * Send registration/welcome email to user
 */
export const sendRegisterEmail = async (
  email: string,
  name: string,
  password: string,
  userName: string,
  loginUrl: string,
  courseTitle?: string,
  courseStartDate?: string
): Promise<{ success: boolean; message: string }> => {
  const template = await renderTemplate(
    'STUDENT_REGISTRATION_EMAIL',
    {
      email,
      name,
      password,
      userName,
      loginUrl,
      courseTitle,
      courseStartDate,
    },
    { optionalFields: ['CourseStartDate', 'courseTitle'] }
  );

  const htmlContent = `<html>
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
          ${courseTitle ? `<li><strong>Course Title:</strong> ${courseTitle}</li>` : ''}
          ${courseStartDate ? `<li><strong>Course Start Date:</strong> ${courseStartDate}</li>` : ''}
        </ul>
        <p>We recommend logging in as soon as possible to update your password and complete your profile.</p>
        <p>
          If you have any questions or encounter any issues while logging in, feel free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>

        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Abree Team</p>
      </body>
    </html>`;

  const emailBody = template?.body ?? htmlContent;
  const subject = template.subject ?? 'Welcome to the Platform';

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent successfully to ${email}`);
    await logEmailNotification(
      EmailType.REGISTRATION_EMAIL,
      email,
      'Registration email sent successfully'
    );
    return { success: true, message: 'Registration email sent successfully' };
  } catch (error) {
    console.error('Error sending registration email:', error);
    await logEmailNotification(
      EmailType.REGISTRATION_EMAIL,
      email,
      'Failed to send registration email',
      'FAILED'
    );
    throw new AppError(
      'Failed to send registration email',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/**
 * Send wellbeing status email to user
 */
type WellbeingStatus = 'APPROVED' | 'PENDING' | 'REJECTED';

const STATUS_MESSAGES: Record<WellbeingStatus, string> = {
  APPROVED: `
    <p>
      We are pleased to inform you that your
      Wellbeing Check Status has been
      <strong>APPROVED</strong>.
    </p>
  `,

  PENDING: `
    <p>
      Your Wellbeing Check Status is currently
      under review.
    </p>
  `,

  REJECTED: `
    <p>
      We regret to inform you that your
      Wellbeing Check Status has been
      <strong>REJECTED</strong>.
    </p>
  `,
};

export const sendWellbeingEmail = async (
  emails: string[],
  applicantName: string,
  status: WellbeingStatus
): Promise<void> => {
  const fallbackHtml = `
    <div
      style="
        font-family: Arial, sans-serif;
        max-width: 600px;
        margin: auto;
        padding: 24px;
        background: #fff;
      "
    >
      <h2>Wellbeing Status Update</h2>

      <p>Hello ${applicantName},</p>

      ${STATUS_MESSAGES[status]}

      <p>
        If you have any questions, please contact
        admin@arbreesolutions.com.
      </p>

      <p>
        Best regards,
        <br />
        The Pen Team
      </p>
    </div>
  `;

  const emailType =
    status === 'APPROVED'
      ? EmailType.WELLBEING_APPROVED_EMAIL
      : status === 'REJECTED'
        ? EmailType.WELLBEING_REJECTED_EMAIL
        : EmailType.WELLBEING_STATUS_EMAIL;

  const template = await renderTemplate(emailType, {
    applicantName,
    status,
  });

  await transporter.sendMail({
    from: env.EMAIL_USER,
    to: emails,
    subject: template?.subject ?? `Wellbeing Status ${status}`,
    html: template?.body ?? fallbackHtml,
  });

  void logBulkEmailNotifications(
    EmailType.WELLBEING_STATUS_EMAIL,
    emails,
    'Wellbeing status email sent successfully'
  );
};

/**
 * Send notes email to users
 */
export const sendNotesEmail = async (
  emails: string[],
  name: string,
  noteContent: string
): Promise<{ success: boolean; message: string }> => {
  const template = await renderTemplate('WELLBEING_STATUS_EMAIL', {
    name,
    noteContent,
  });

  const htmlContent = `<html>
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
    </html>`;

  const emailBody = template?.body ?? htmlContent;
  const subject = template.subject ?? `New Note Added For ${name}`;

  const mailOptions = {
    from: env.EMAIL_USER,
    to: emails,
    subject: subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Notes email sent successfully to ${emails.join(', ')}`);
    await logBulkEmailNotifications(
      EmailType.NOTES_EMAIL,
      emails,
      'Notes email sent successfully'
    );
    return { success: true, message: 'Notes email sent successfully' };
  } catch (error) {
    console.error('Error sending notes email:', error);
    await logBulkEmailNotifications(
      EmailType.NOTES_EMAIL,
      emails,
      'Failed to send notes email',
      'FAILED'
    );
    throw new AppError('Failed to send notes email', 'EMAIL_SEND_FAILED', 500);
  }
};

/**
 * Send interview scheduled email to users
 */
export const sendInterviewEmail = async (
  emails: string[],
  name: string,
  interviewLink: string,
  interviewStartTime: string,
  interviewDate: string,
  interviewEndTime: string
): Promise<{ success: boolean; message: string }> => {
  // const template = await renderTemplate('INTERVIEW_REMINDER_EMAIL_24H', {
  //   interviewLink,
  //   name,
  //   interviewDate,
  //   interviewStartTime,
  //   interviewEndTime,
  // });
  const template = await renderTemplate('INTERVIEW_CONFIRMATION_EMAIL', {
    interviewLink,
    name,
    interviewDate,
    interviewStartTime,
    interviewEndTime,
  });

  const htmlContent = `<html>
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
            Best regards,<br />The Pen Team
          </p>  
        </div>
      </body>
    </html>`;

  const emailBody = template?.body ?? htmlContent;
  const subject = template.subject ?? `Interview Scheduled for ${name}`;

  const mailOptions = {
    from: env.EMAIL_USER,
    to: emails,
    subject,
    html: emailBody,
  };

  // Send email (errors will bubble up)
  await transporter.sendMail(mailOptions);

  // Log success
  await logBulkEmailNotifications(
    EmailType.INTERVIEW_CONFIRMATION_EMAIL,
    emails,
    'Interview confirmation email sent successfully'
  );

  return { success: true, message: 'Interview email sent successfully' };
};

/**
 * Send application outcome email to user
 */
export const sendApplicationOutcomeEmail = async (
  email: string,
  applicantName: string,
  applicationRef: string,
  outcome: string
): Promise<{ success: boolean; message: string }> => {
  // Outcome-specific email configurations
  const emailConfigs = {
    APPROVED_UNCONDITIONAL: {
      subject: `Congratulations! Your Application ${applicationRef} has been Approved`,
      color: '#27ae60',
      header: `Congratulations ${applicantName}!`,
      content: `
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We are pleased to inform you that your application has been <strong>unconditionally approved</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          This means you have met all the requirements for admission. Welcome to our institution!
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Please log in to your account to view the full details and next steps for enrollment.
        </p>
      `,
    },
    APPROVED_CONDITIONAL: {
      subject: `Your Application ${applicationRef} has been Conditionally Approved`,
      color: '#f39c12',
      header: `Congratulations ${applicantName}!`,
      content: `
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We are pleased to inform you that your application has been <strong>conditionally approved</strong>.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          This means you have been accepted, but there are some conditions you need to fulfill before final admission.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          Please log in to your account to view the specific conditions and next steps.
        </p>
      `,
    },
    REJECTED: {
      subject: `Update on Your Application ${applicationRef}`,
      color: '#c0392b',
      header: `Dear ${applicantName},`,
      content: `
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We regret to inform you that your application has not been successful at this time.
        </p>
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          We appreciate your interest in our institution and encourage you to consider applying again in the future.
        </p>
        <p style="font-size: 16px; line-height: 1.6;">
          You may log in to your account for more information or to reapply in the future.
        </p>
      `,
    },
  };

  const config = emailConfigs[outcome as keyof typeof emailConfigs] || {
    subject: `Update on Your Application ${applicationRef}`,
    color: '#3498db',
    header: `Dear ${applicantName},`,
    content: `
      <p style="font-size: 16px; line-height: 1.6;">
        Your application status has been updated to: <strong>${outcome}</strong>.
      </p>
    `,
  };

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: config.subject,
    html: `
      <html>
        <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f9f9f9;">
          <div style="max-width: 600px; margin: auto; background: #fff; padding: 20px 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <h2 style="color: ${config.color}; text-align: center; margin-bottom: 20px;">
              ${config.header}
            </h2>
            ${config.content}
            <p style="margin-top: 30px; font-weight: bold; color: #2c3e50;">
              Best regards,<br />The Abree Team
            </p>
          </div>
        </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application outcome email sent successfully to ${email}`);
    await logEmailNotification(
      EmailType.APPLICATION_OUTCOME_EMAIL,
      email,
      `Application outcome email sent: ${outcome}`
    );
    return {
      success: true,
      message: 'Application outcome email sent successfully',
    };
  } catch (error) {
    console.error('Error sending application outcome email:', error);
    await logEmailNotification(
      EmailType.APPLICATION_OUTCOME_EMAIL,
      email,
      `Failed to send application outcome email: ${outcome}`,
      'FAILED'
    );
    throw new AppError(
      'Failed to send application outcome email',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/* =========================
   UPDATED FUNCTION
========================= */
