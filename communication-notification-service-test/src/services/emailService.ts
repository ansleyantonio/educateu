import {
  sendRegistrationEmail,
  sendOtpEmail,
  sendUpdatePasswordEmail,
  sendVerificationEmail,
  emailVerification,
  sendEmail,
} from '../modules/general/mail/mailer';

export interface UserEmailData {
  email?: string;
  username?: string;
  firstName?: string;
  password?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
}

export interface EmailService {
  sendRegistrationEmail: (
    user: UserEmailData,
    loginUrl?: string
  ) => Promise<EmailResult>;
  sendOtpEmail: (
    user: { email: string; firstName?: string },
    otp: string,
    firstName?: string
  ) => Promise<EmailResult>;
  sendUpdatePasswordEmail: (
    user: UserEmailData,
    loginUrl?: string
  ) => Promise<EmailResult>;
  sendVerificationEmail: (email: string) => Promise<EmailResult>;
  sendEmailVerification: (
    user: { email: string; firstName?: string },
    accessToken: string,
    firstName?: string
  ) => Promise<EmailResult>;
  sendGenericEmail: (
    to: string,
    subject: string,
    html: string,
    text?: string
  ) => Promise<EmailResult>;
}

class EmailServiceImpl implements EmailService {
  async sendRegistrationEmail(
    user: UserEmailData,
    loginUrl?: string
  ): Promise<EmailResult> {
    return await sendRegistrationEmail(user, loginUrl);
  }

  async sendOtpEmail(
    user: { email: string; firstName?: string },
    otp: string,
    firstName = 'there'
  ): Promise<EmailResult> {
    return await sendOtpEmail(user, otp, firstName);
  }

  async sendUpdatePasswordEmail(
    user: UserEmailData,
    loginUrl?: string
  ): Promise<EmailResult> {
    return await sendUpdatePasswordEmail(user, loginUrl);
  }

  async sendVerificationEmail(email: string): Promise<EmailResult> {
    return await sendVerificationEmail(email);
  }

  async sendEmailVerification(
    user: { email: string; firstName?: string },
    accessToken: string,
    firstName = 'there'
  ): Promise<EmailResult> {
    return await emailVerification(user, accessToken, firstName);
  }

  async sendGenericEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<EmailResult> {
    return await sendEmail(to, subject, html, text);
  }
}

export const emailService = new EmailServiceImpl();
