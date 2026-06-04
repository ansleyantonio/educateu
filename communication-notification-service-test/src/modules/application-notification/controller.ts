import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { zodSafeParse } from '../../utils/zodUtils';
import {
  sendEmail,
  emailVerification,
  // emailVerifiedConfirmation,
  sendStripeApplicationOutcomeEmail,
  sendApprovalEmailToApplicant,
  // sendInterviewOutcomeEmail,
} from './applicationEmailService'; // Import your email functions
import type { ApplicationWithRelations } from './applicationEmailService'; // Import type separately
import {
  applicationSummarySchema,
  customApplicationNotificationSchema,
  realTimeApplicationNotificationSchema,
  emailVerificationRequestSchema,
} from '../../schemas/applicationNotificationSchema';
import { stripeApplicationOutcomeSchema } from '../../schemas/stripeApplicationOutcomeSchema';
// import { interviewOutcomeSchema } from '../../schemas/interviewOutcomeSchema';
import prisma from '../../prismaClient';
import { broadcastToUser } from '../../modules/websocket-notification/websocket';
import { transporter } from '../notification/mail.service';
import { createNotification } from '../../services/agentNotification.service';
import { sendApprovalEmailSchema } from './schema';

// Controller to send application profile summary email using applicationId
export const sendApplicationSummaryEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validated = zodSafeParse(req.body, applicationSummarySchema);
  const { applicationId } = validated;

  // Fetch application from database using applicationId
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      academicBackground: true,
      courseSelection: {
        include: {
          course: {
            include: {
              course: true,
            },
          },
        },
      },
      personalStatement: true,
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: {
        select: {
          email: true,
          relationship: true,
          otherRelationship: true,
        },
      },
      criminalBackground: true,
      supportingDocument: {
        include: {
          supportingDocumentAttachments: {
            include: {
              attachment: true,
            },
          },
        },
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
  }

  // Check if application stage is SUBMIT and email is verified
  // if (application.stage !== 'SUBMIT') {
  //   throw new AppError(
  //     'Application not in SUBMIT stage',
  //     'INVALID_APPLICATION_STAGE',
  //     400
  //   );
  // }

  if (!application.personalInformation?.verifiedEmail) {
    throw new AppError('Email not verified', 'EMAIL_NOT_VERIFIED', 400);
  }

  // Cast to ApplicationWithRelations
  const applicationData = application as unknown as ApplicationWithRelations;

  // Call the email sending function
  const result = await sendEmail(applicationData);

  res.status(200).json({
    success: true,
    message: 'Application summary email sent successfully',
    data: result,
  });
};

// Controller to send email verification
export const sendEmailVerificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(
    '[EMAIL_VERIFICATION_CONTROLLER_DEBUG] sendEmailVerificationController function entered'
  );

  // Validate request body using Zod
  const validated = zodSafeParse(req.body, emailVerificationRequestSchema);
  const { applicationId } = validated;
  const personalInformation = (
    await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        personalInformation: {
          select: {
            email: true,
            verifiedEmail: true,
          },
        },
      },
    })
  )?.personalInformation;

  if (!personalInformation?.email) {
    throw new AppError(
      'Email not found for this application',
      'EMAIL_NOT_FOUND',
      404
    );
  }

  // Call the email verification function
  if (personalInformation.verifiedEmail === true) {
    throw new AppError(
      'Email is already verified',
      'EMAIL_ALREADY_VERIFIED',
      400
    );
  }
  const result = await emailVerification(
    personalInformation.email,
    applicationId
  );

  console.log(
    '[EMAIL_VERIFICATION_CONTROLLER_DEBUG] Email verification sent successfully:',
    result
  );

  res.status(200).json({
    success: true,
    message: 'Email verification sent successfully',
    data: result,
  });
};

// Controller to send email verification only if UserPortalCategory user email is verified
export const sendEmailVerifiedConfirmation = async (
  req: Request,
  res: Response
): Promise<void> => {
  console.log(
    '[EMAIL_VERIFICATION_IF_VERIFIED_DEBUG] sendEmailVerificationIfVerifiedController function entered'
  );

  const validated = zodSafeParse(req.body, applicationSummarySchema);
  const { applicationId } = validated;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      academicBackground: true,
      courseSelection: {
        include: {
          course: {
            include: {
              course: true,
            },
          },
        },
      },
      personalStatement: true,
      disabilityAndAccessibility: true,
      nextOfKin: true,
      fund: true,
      reference: {
        select: {
          email: true,
          relationship: true,
          otherRelationship: true,
        },
      },
      criminalBackground: true,
      supportingDocument: {
        include: {
          supportingDocumentAttachments: {
            include: {
              attachment: true,
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
    throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
  }

  // Get user from UserPortalCategory
  const userPortalCategoryApp =
    application.userPortalCategoryRoleApplications[0];

  if (
    !userPortalCategoryApp?.userPortalCategoryRole?.userPortalCategory?.user
  ) {
    throw new AppError(
      'User not found for this application',
      'USER_NOT_FOUND',
      404
    );
  }

  const user =
    userPortalCategoryApp.userPortalCategoryRole.userPortalCategory.user;
  // const userEmail = user.agentEmail ?? application.personalInformation?.email;
  // if (!userEmail) {
  //   throw new AppError('User email is missing', 'EMAIL_MISSING', 400);
  // }

  // const firstName = application.personalInformation?.firstName;
  // const lastName = application.personalInformation?.lastName;
  // const userName =
  //   firstName || lastName
  //     ? `${firstName ?? ''} ${lastName ?? ''}`.trim()
  //     : 'Applicant';

  // const result = await emailVerifiedConfirmation(
  //   userEmail,
  //   userName,
  //   applicationId
  // );
  const userId = user.id;
  await createNotification({
    title: 'Email Verified',
    message: `Application ${application?.applicationId} email has been successfully verified.`,
    userIds: [userId],
    type: 'APPLICATION_SUBMITTED',
  });

  const applicationData = application as unknown as ApplicationWithRelations;

  // Call the email sending function
  const result = await sendEmail(applicationData);
  res.status(200).json({
    success: true,
    message: 'Email verification sent successfully',
    data: result,
  });
};

// Controller to send Stripe application outcome email
export const sendStripeApplicationOutcomeEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // console.log(
  //   '[STRIPE_APPLICATION_OUTCOME_CONTROLLER_DEBUG] sendStripeApplicationOutcomeEmailController function entered'
  // );

  // Validate request body using Zod
  const validated = zodSafeParse(req.body, stripeApplicationOutcomeSchema);

  // Extract validated data
  const { applicationId, outcome } = validated;

  // Call the email function
  const result = await sendStripeApplicationOutcomeEmail(
    applicationId,
    outcome
  );

  // console.log(
  //   '[STRIPE_APPLICATION_OUTCOME_CONTROLLER_DEBUG] Stripe application outcome email sent successfully:',
  //   result
  // );

  res.status(200).json({
    success: true,
    message: 'Stripe application outcome email sent successfully',
    data: result,
  });
};

// export const sendInterviewOutcomeEmailController = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   const parsed = zodSafeParse(req.body, interviewOutcomeSchema);
//
//   const { applicationId, outcome } = parsed;
//
//   const application = await prisma.application.findUnique({
//     where: { id: applicationId },
//     include: {
//       personalInformation: true,
//       interviews: {
//         where: {
//           status: 'PENDING',
//         },
//       },
//     },
//   });
//
//   const interview = application?.interviews[0];
//
//   if (!interview) {
//     throw new Error('No pending interview found');
//   }
//
//   if (!application) {
//     throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
//   }
//
//   if (!application.personalInformation?.email) {
//     throw new AppError('Email not found', 'MISSING_EMAIL', 402);
//   }
//
//   await sendInterviewOutcomeEmail(
//     `${application.personalInformation.firstName} ${application.personalInformation.lastName}`,
//     application.personalInformation.email,
//     outcome,
//     interview
//   );
//
//   res.status(200).json({
//     success: true,
//     message: 'Interview outcome email sent successfully',
//   });
// };

// Controller to send custom application notification via email
export const sendCustomApplicationNotificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validated = zodSafeParse(req.body, customApplicationNotificationSchema);
  const { applicationId, title, message } = validated;

  // Fetch application from database using applicationId
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
    },
  });

  if (!application) {
    throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
  }

  // Get user email from personalInformation
  const userEmail = application.personalInformation?.email;

  if (!userEmail) {
    throw new AppError('User email not found', 'MISSING_EMAIL', 400);
  }

  // Import nodemailer for sending email

  // Send email notification
  const mailOptions = {
    from: `"${process.env['EMAIL_FROM_NAME'] ?? 'Notification Service'}" <${process.env['EMAIL_USER']}>`,
    to: userEmail,
    subject: title,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${title}</h2>
        <p>${message}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #666; font-size: 12px;">This is an automated notification from our system.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({
    success: true,
    message: 'Custom application notification sent successfully',
    data: {
      applicationId,
      userEmail,
      title,
    },
  });
};

// Controller to send real-time application notification via WebSocket
export const sendRealTimeApplicationNotificationController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validated = zodSafeParse(
    req.body,
    realTimeApplicationNotificationSchema
  );
  const { applicationId, title, message } = validated;

  // Fetch application from database and traverse to find userId
  // Application -> UserPortalCategoryRoleApplication -> UserPortalCategoryRole -> UserPortalCategory -> User
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
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

  // Get the first associated user (applications typically have one user)
  const userPortalCategoryApp =
    application.userPortalCategoryRoleApplications[0];

  if (
    !userPortalCategoryApp?.userPortalCategoryRole?.userPortalCategory?.user
  ) {
    throw new AppError(
      'User not found for this application',
      'USER_NOT_FOUND',
      404
    );
  }

  const user =
    userPortalCategoryApp.userPortalCategoryRole.userPortalCategory.user;
  const userId = user.id;

  // Send real-time notification via WebSocket
  broadcastToUser(userId, 'USER', {
    type: 'application_notification',
    data: {
      applicationId,
      title,
      message,
      timestamp: new Date().toISOString(),
    },
  });

  res.status(200).json({
    success: true,
    message: 'Real-time application notification sent successfully',
    data: {
      userId,
      title,
      message,
    },
  });
};

// Controller to get userId from applicationId and return notification payload
export const getApplicationNotificationPayloadController = async (
  req: Request,
  res: Response
): Promise<void> => {
  // Validate request body using Zod
  const validated = zodSafeParse(
    req.body,
    realTimeApplicationNotificationSchema
  );
  const { applicationId, title, message } = validated;

  // Fetch application from database and traverse to find userId
  // Application -> UserPortalCategoryRoleApplication -> UserPortalCategoryRole -> UserPortalCategory -> User
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
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

  // Get the first associated user (applications typically have one user)
  const userPortalCategoryApp =
    application.userPortalCategoryRoleApplications[0];

  if (
    !userPortalCategoryApp?.userPortalCategoryRole?.userPortalCategory?.user
  ) {
    throw new AppError(
      'User not found for this application',
      'USER_NOT_FOUND',
      404
    );
  }

  const user =
    userPortalCategoryApp.userPortalCategoryRole.userPortalCategory.user;
  const userId = user.id;

  // Return the notification payload with userId, title, and message
  res.status(200).json({
    success: true,
    data: {
      userId,
      title,
      message,
    },
  });
};

// Send approval email to applicant
export const sendApprovalEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const body = zodSafeParse(req.body, sendApprovalEmailSchema);

  const result = await sendApprovalEmailToApplicant(body);

  res.status(200).json({
    result,
  });
};
