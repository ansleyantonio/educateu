import type { Request, Response } from 'express';
import prisma from '../../prismaClient';
import { AppError } from '../../utils/AppError';
import { zodSafeParse } from '../../utils/zodUtils';
import { sendPreScreenOutcomeEmailSchema } from './schema';
import { sendPreScreenOutcomeEmail } from './services';

export const sendPreScreenOutcomeEmailController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validatedBody = zodSafeParse(req.body, sendPreScreenOutcomeEmailSchema);
  const application = await prisma.application.findUnique({
    where: { id: validatedBody.applicationId },
    include: {
      personalInformation: true,
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
    throw new AppError('Application not found', 'NOT_FOUND', 404);
  }

  // Extract required fields from the application
  const email = application.personalInformation?.email;
  const firstRoleApp = application.userPortalCategoryRoleApplications?.[0];
  const agentEmail =
    firstRoleApp?.userPortalCategoryRole?.userPortalCategory?.user?.agentEmail;
  const applicantName =
    `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim();
  const applicationId = application?.applicationId ?? application.id;
  const outcome = validatedBody.outcome;

  const result = await sendPreScreenOutcomeEmail(
    [email ?? '', agentEmail ?? ''],
    applicantName,
    applicationId,
    outcome
  );

  res.status(200).json({
    success: true,
    message: 'Pre-screen outcome email sent successfully',
    data: result,
  });
};
