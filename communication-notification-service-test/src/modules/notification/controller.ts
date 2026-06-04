import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { zodSafeParse } from '../../utils/zodUtils';
import {
  sendRegisterEmail,
  sendWellbeingEmail,
  sendNotesEmail,
  sendInterviewEmail,
  sendApplicationOutcomeEmail,
  // sendPreScreenOutcomeEmail,
  transporter,
} from './mail.service';
import {
  registerEmailSchema,
  wellbeingEmailSchema,
  notesEmailSchema,
  interviewEmailSchema,
  applicationOutcomeEmailSchema,
  // sendPreScreenOutcomeEmailSchema,
} from '../../schemas/notificationSchema';
import {
  sendMultipleEmailsSchema,
  type sendMultipleEmailsSchemaType,
} from '../../schemas/bulkEmailSchema';

// Send registration email controller
export const sendRegisterEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, registerEmailSchema);

  const {
    email,
    name,
    password,
    loginUrl,
    courseTitle,
    userName,
    courseStartDate,
  } = validatedBody;

  // Ensure email is present since it's required for sending emails
  if (!email) {
    throw new AppError('Email is required', 'MISSING_EMAIL', 400);
  }

  // Call the actual email sending function
  const result = await sendRegisterEmail(
    email,
    name,
    password,
    userName,
    loginUrl,
    courseTitle,
    courseStartDate
  );

  res.status(200).json({
    success: true,
    message: 'Registration email sent successfully',
    data: result,
  });
};

// Send wellbeing status email controller
export const sendWellbeingEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, wellbeingEmailSchema);

  const { emails, applicantName, status } = validatedBody;

  // Ensure emails array is present and not empty
  if (!emails || emails.length === 0) {
    throw new AppError('At least one email is required', 'MISSING_EMAIL', 400);
  }

  // Call the actual email sending function
  const result = await sendWellbeingEmail(emails, applicantName, status);

  res.status(200).json({
    success: true,
    message: 'Wellbeing email sent successfully',
    data: result,
  });
};

// Send notes email controller
export const sendNotesEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, notesEmailSchema);

  const { emails, name, noteContent } = validatedBody;

  // Ensure emails array is present and not empty
  if (!emails || emails.length === 0) {
    throw new AppError('At least one email is required', 'MISSING_EMAIL', 400);
  }

  // Call the actual email sending function
  const result = await sendNotesEmail(emails, name, noteContent);

  res.status(200).json({
    success: true,
    message: 'Notes email sent successfully',
    data: result,
  });
};

// Send interview scheduled email controller
export const sendInterviewEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validatedBody = zodSafeParse(req.body, interviewEmailSchema);

  const {
    emails,
    name,
    interviewDate,
    interviewStartTime,
    interviewLink,
    interviewEndTime,
  } = validatedBody;

  // Ensure emails array is present and not empty
  if (!emails || emails.length === 0) {
    throw new AppError('At least one email is required', 'MISSING_EMAIL', 400);
  }

  // Call the actual email sending function
  const result = await sendInterviewEmail(
    emails,
    name,
    interviewLink,
    interviewDate,
    interviewStartTime,
    interviewEndTime
  );

  res.status(200).json({
    success: true,
    message: 'Interview email sent successfully',
    data: result,
  });
};

// Send application outcome email controller
export const sendApplicationOutcomeEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const hasExpectedFields =
    req.body.email && req.body.applicantName && req.body.applicationRef;

  let email, applicantName, applicationRef, outcome;

  if (hasExpectedFields) {
    const validatedBody = zodSafeParse(req.body, applicationOutcomeEmailSchema);

    ({ email, applicantName, applicationRef, outcome } = validatedBody);
  } else {
    // If the request contains applicationId and outcome (from the calling service), fetch the application details
    if (!req.body.applicationId || !req.body.outcome) {
      throw new AppError(
        'Either email/applicantName/applicationRef or applicationId/outcome must be provided',
        'MISSING_REQUIRED_FIELDS',
        400
      );
    }

    // Import prisma here to avoid circular dependencies
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    // Fetch application details using applicationId
    const application = await prisma.application.findUnique({
      where: { id: req.body.applicationId },
      include: {
        personalInformation: true,
      },
    });

    if (!application) {
      throw new AppError('Application not found', 'NOT_FOUND', 404);
    }

    // Extract required fields from the application
    email = application.personalInformation?.email;
    applicantName =
      `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim();
    applicationRef = application.applicationId ?? application.id;
    outcome = req.body.outcome;
  }

  // Ensure email is present since it's required for sending emails
  if (!email) {
    throw new AppError('Email is required', 'MISSING_EMAIL', 400);
  }

  // Call the actual email sending function
  const result = await sendApplicationOutcomeEmail(
    email,
    applicantName,
    applicationRef,
    outcome
  );

  res.status(200).json({
    success: true,
    message: 'Application outcome email sent successfully',
    data: result,
  });
};

// Service function for sending multiple emails
export const sendMultipleEmailsService = async (
  data: sendMultipleEmailsSchemaType
): Promise<string> => {
  const mailOptions = {
    from: process.env['EMAIL_USER'],
    to: data.email ?? [],
    cc: data.cc ?? [],
    bcc: data.bcc ?? [],
    subject: data.subject,
    html: data.body,
    attachments: data.attachments ?? [],
  };
  await transporter.sendMail(mailOptions);

  return 'Emails sent successfully';
};

// Bulk email controller function
export const sendMultipleEmails = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validated = zodSafeParse(req.body, sendMultipleEmailsSchema);

  // Call the actual email sending function
  const result = await sendMultipleEmailsService(validated);

  res.status(200).json({
    success: true,
    message: 'Bulk emails sent successfully',
    data: result,
  });
};
