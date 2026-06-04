// import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { AppError } from '../../../utils/AppError';
import { env } from '../../../config/env';
import { EmailType } from '@prisma/client';
import {
  logEmailNotification,
  logBulkEmailNotifications,
} from '../../../utils/emailLogger';
import { renderTemplate } from '../../../utils/renderTemplate';
import { transporter } from '../../notification/mail.service';

export const sendOtpEmail = async (
  user: { email: string; firstName?: string | undefined },
  otp: string,
  firstName = 'there'
): Promise<{ success: boolean; message: string }> => {
  const year = new Date().getFullYear();

  const template = await renderTemplate('FORGOT_PASSWORD_EMAIL', {
    firstName: user?.firstName,
    otp,
    email: user.email,
  });

  // console.log('template', user?.firstName, firstName);

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto">
          <p>Hi ${user.firstName ?? firstName},</p>
          <p> Use the OTP below:</p>
          <h3 style="color: #2f54eb">${otp}</h3>
          <p>This OTP is valid for 15 minutes.</p>
          <p>If you didn't request this, you can ignore the email.</p>
          <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
          <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        </div>
      </body>
    </html>`;

  const emailBody = template?.body ?? htmlContent;
  const subject = template.subject ?? 'Your OTP verification code';

  const mailOptions = {
    from: env.EMAIL_USER,
    to: user.email,
    subject: subject,
    text: `Hi ${user.firstName ?? firstName}, your OTP is: ${otp}`, // Fallback for clients that don't support HTML
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${user.email}`);
    await logEmailNotification(
      EmailType.OTP_VERIFICATION_EMAIL,
      user.email,
      'OTP verification email sent successfully'
    );
    return { success: true, message: 'OTP email sent successfully' };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    await logEmailNotification(
      EmailType.OTP_VERIFICATION_EMAIL,
      user.email,
      'Failed to send OTP email',
      'FAILED'
    );
    throw new AppError('Failed to send OTP email', 'EMAIL_SEND_FAILED', 500);
  }
};

/**
 * Send registration email to user
 */
export const sendRegistrationEmail = async (
  user: {
    email?: string | undefined;
    username?: string | undefined;
    firstName?: string | undefined;
    password?: string | undefined;
  },
  loginUrl?: string | undefined
): Promise<{ success: boolean; message: string }> => {
  // console.log(
  //   '[SEND_REGISTRATION_EMAIL_DEBUG] sendRegistrationEmail function called with:',
  //   { email: user.email, loginUrl }
  // );
  const year = new Date().getFullYear();

  const { email, username, firstName, password } = user;

  const template = await renderTemplate('REGISTRATION_EMAIL', {
    email,
    userName: username,
    firstName,
    password,
    loginUrl,
  });

  if (!email) {
    throw new AppError(
      'Email is required to send registration email',
      'MISSING_EMAIL',
      400
    );
  }

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <p>Hi <strong>${firstName ?? 'there'}</strong>,</p>
        <p>
          An account has been created for you by the administrator on
          <strong>educate-u</strong>.
        </p>
        <h3>Account Details</h3>
        <ul style="list-style-type: none; padding-left: 0">
        <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${username ?? 'N/A'}</li>
          ${password ? `<li><strong>Temporary Password:</strong> ${password}</li>` : ''}
          <li>
            <strong>Login URL:</strong>
            <a href="${loginUrl ?? ''}" target="_blank" rel="noopener noreferrer">${loginUrl ?? ''}</a>
          </li>
        </ul>
        <p>
          We recommend logging in as soon as possible to update your password and
          complete your profile.
        </p>
        <p>
          If you have any questions or encounter any issues while logging in, feel
          free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>
        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
      </body>
    </html>
  `;

  // Use template body or fallback to htmlContent
  const templateBody = template?.body ?? htmlContent;
  const subject = template.subject ?? 'Your Account Has Been Created';

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: subject,
    text: `Hi ${firstName ?? 'there'}, an account has been created for you.
Email: ${email}
Username: ${username ?? 'N/A'}
${password ? `Temporary Password: ${password}` : ''}
Login URL: ${loginUrl ?? ''}`,
    html: templateBody,
  };

  try {
    // console.log('Attempting to send registration email to:', email);
    // console.log('Using transporter with host:', env.EMAIL_HOST);
    // console.log('Email options prepared:', {
    //   to: email,
    //   subject: mailOptions.subject,
    // });

    await transporter.sendMail(mailOptions);
    // console.log('Email sent successfully to', email, 'with result:', result);

    await logEmailNotification(
      EmailType.REGISTRATION_EMAIL,
      email,
      'Registration email sent successfully'
    );
    return {
      success: true,
      message: 'Registration email sent successfully',
    };
  } catch (error) {
    console.error('Error sending registration email:', error);
    console.error('Error details:', {
      email: email,
      host: env.EMAIL_HOST,
      user: env.EMAIL_USER,
    });

    await logEmailNotification(
      EmailType.REGISTRATION_EMAIL,
      email,
      'Failed to send registration email',
      'FAILED'
    );

    // More detailed error logging
    if (error instanceof Error) {
      // console.error('SMTP Error details:');
      // console.error('- Name:', error.name);
      // console.error('- Message:', error.message);
      // console.error('- Stack:', error.stack);
    }

    throw new AppError(
      'Failed to send registration email: ' +
        (error instanceof Error ? error.message : 'Unknown error'),
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/**
 * Send password update email to user
 */
export const sendUpdatePasswordEmail = async (
  user: {
    email?: string | undefined;
    username?: string | undefined;
    firstName?: string | undefined;
    password?: string | undefined;
  },
  loginUrl?: string | undefined
): Promise<{ success: boolean; message: string }> => {
  const year = new Date().getFullYear();
  const { email, username, firstName, password } = user;

  if (!email) {
    throw new AppError(
      'Email is required to send password update email',
      'MISSING_EMAIL',
      400
    );
  }

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5">
        <p>Hi <strong>${firstName ?? 'there'}</strong>,</p>
        <p>
          Your account password has been updated by the administrator on
          <strong>educate-u</strong>.
        </p>
        <h3>Account Details</h3>
        <ul style="list-style-type: none; padding-left: 0">
        <li><strong>Email:</strong> ${email}</li>
          <li><strong>Username:</strong> ${username ?? 'N/A'}</li>
          ${password ? `<li><strong>New Password:</strong> ${password}</li>` : ''}
          <li>
            <strong>Login URL:</strong>
            <a href="${loginUrl ?? ''}" target="_blank" rel="noopener noreferrer">${loginUrl ?? ''}</a>
          </li>
        </ul>
        <p>
          We recommend logging in as soon as possible to verify your account.
        </p>
        <p>
          If you have any questions or encounter any issues while logging in, feel
          free to email
          <a href="mailto:admin@arbreesolutions.com">admin@arbreesolutions.com</a>.
        </p>
        <p>Welcome, and we're glad to have you on board!</p>
        <p style="margin-top: 2rem">Best regards,<br />The Arbree Team</p>
        <p style="font-size: 12px; color: #888">&copy; ${year} Arbree</p>
      </body>
    </html>
  `;

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: 'Your Account Password Has Been Updated',
    text: `Hi ${firstName ?? 'there'}, your account password has been updated.
Email: ${email}
Username: ${username ?? 'N/A'}
${password ? `New Password: ${password}` : ''}
Login URL: ${loginUrl ?? ''}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password update email sent successfully to ${email}`);
    await logEmailNotification(
      EmailType.PASSWORD_UPDATE_EMAIL,
      email,
      'Password update email sent successfully'
    );
    return {
      success: true,
      message: 'Password update email sent successfully',
    };
  } catch (error) {
    console.error('Error sending password update email:', error);
    await logEmailNotification(
      EmailType.PASSWORD_UPDATE_EMAIL,
      email,
      'Failed to send password update email',
      'FAILED'
    );
    throw new AppError(
      'Failed to send password update email',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/**
 * Send verification email to user
 */
export const sendVerificationEmail = async (
  email: string
): Promise<{ success: boolean; message: string }> => {
  if (!email) {
    throw new AppError(
      'Email is required to send verification email',
      'MISSING_EMAIL',
      400
    );
  }

  const token = crypto.randomBytes(32).toString('hex') + email;

  const mailOptions = {
    from: env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email',
    text: `Click the following link to verify your email: http://localhost:5000/mail/verify-email?token=${token}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent successfully to ${email}`);
    await logEmailNotification(
      EmailType.EMAIL_VERIFICATION_EMAIL,
      email,
      'Verification email sent successfully'
    );
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Error sending verification email: ', error);
    await logEmailNotification(
      EmailType.EMAIL_VERIFICATION_EMAIL,
      email,
      'Failed to send verification email',
      'FAILED'
    );
    throw new AppError(
      'Failed to send verification email',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/**
 * Send email verification with access token
 */
export const emailVerification = async (
  user: { email: string; firstName?: string | undefined },
  accessToken: string,
  firstName?: string | undefined
): Promise<{ success: boolean; message: string }> => {
  if (!user.email) {
    throw new AppError(
      'Email is required to send email verification',
      'MISSING_EMAIL',
      400
    );
  }

  // Encrypt the email for the verification URL
  const verificationUrl = `${env.STUDENT_LOGIN_URL}/password-recovery/${accessToken}`;

  const template = await renderTemplate('EMAIL_VERIFICATION_EMAIL', {
    email: user.email,
    firstName: user.firstName,
    verificationUrl,
  });

  const htmlContent = `
    <html>
      <body style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5;">
        <h2>📋 Email Verification</h2>
        <p>Hello ${firstName ?? user.firstName ?? 'there'},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}" target="_blank" style="
          display: inline-block;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 10px 0;
        ">Verify Email</a>

        <p style="margin-top: 20px; color: #666; font-size: 14px;">
          If the button doesn't work, copy and paste this URL into your browser:<br>
          <code style="background-color: #f4f4f4; padding: 5px; border-radius: 3px;">
            ${verificationUrl}
          </code>
        </p>
      </body>
    </html>
    `;

  const emailBody = template?.body ?? htmlContent;
  const subject = template.subject ?? 'Email Verification';

  const mailOptions = {
    from: env.EMAIL_USER,
    to: user.email,
    subject: subject,
    html: emailBody,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email verification sent successfully to ${user.email}`);
    await logEmailNotification(
      EmailType.EMAIL_VERIFICATION_EMAIL,
      user.email,
      'Email verification sent successfully'
    );
    return { success: true, message: 'Email verification sent successfully' };
  } catch (error) {
    console.error('Error sending email verification: ', error);
    await logEmailNotification(
      EmailType.EMAIL_VERIFICATION_EMAIL,
      user.email,
      'Failed to send email verification',
      'FAILED'
    );
    throw new AppError(
      'Failed to send email verification',
      'EMAIL_SEND_FAILED',
      500
    );
  }
};

/**
 * Generic send email function
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<{ success: boolean; message: string }> => {
  if (!to) {
    throw new AppError('Recipient email is required', 'MISSING_EMAIL', 400);
  }

  const mailOptions = {
    from: env.EMAIL_USER,
    to,
    subject,
    text: text ?? subject,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    await logEmailNotification(
      EmailType.BULK_MULTIPLE_EMAILS,
      to,
      `Email sent: ${subject}`
    );
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    await logEmailNotification(
      EmailType.BULK_MULTIPLE_EMAILS,
      to,
      `Failed to send email: ${subject}`,
      'FAILED'
    );
    throw new AppError('Failed to send email', 'EMAIL_SEND_FAILED', 500);
  }
};

/**
 * Send enrollment email to student and agent
 */
export const sendEnrollmentEmail = async (
  applicationId: string,
  amount: number,
  paymentType: string | undefined,
  studentName: string,
  studentEmail: string,
  agentEmail: string | undefined,
  courseName: string,
  courseId: string
): Promise<void> => {
  if (!studentEmail && !agentEmail) {
    throw new AppError('No recipient email found', 'NOT_FOUND', 404);
  }

  // 🟢 3. Prepare recipient list (TypeScript safe)
  const recipients = [studentEmail, agentEmail].filter(
    (email): email is string => Boolean(email)
  );

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
            <strong>${courseName}</strong> ${paymentType === 'SEMESTER' ? '(Full-First Semester)' : ''} (Course ID: <strong>${courseId}</strong>) has been successfully received.
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
    from: env.EMAIL_USER,
    to: recipients,
    subject: `Payment Received – Enrollment Successful for ${courseName}${paymentType === 'SEMESTER' ? ' (Full-First Semester)' : ''}`,
    html: htmlContent,
  });

  // 🟢 6. Log enrollment emails
  await logBulkEmailNotifications(
    EmailType.ENROLLMENT_EMAIL,
    recipients,
    `Enrollment email sent for ${courseName}`
  );
};
