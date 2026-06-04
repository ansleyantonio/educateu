import type { Request, Response } from 'express';
import { interviewOutcomeSchema } from '../../schemas/interviewOutcomeSchema';
import { zodSafeParse } from '../../utils/zodUtils';
import prisma from '../../prismaClient';
import { AppError } from '../../utils/AppError';
import { sendInterviewOutcomeEmail } from './services';

export const sendInterviewOutcomeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  const parsed = zodSafeParse(req.body, interviewOutcomeSchema);

  const { applicationId, outcome } = parsed;

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: {
      personalInformation: true,
      interviews: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!application) {
    throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
  }

  const interview = application.interviews[0];

  if (!interview) {
    throw new AppError(
      'No interview found for this application',
      'INTERVIEW_NOT_FOUND',
      404
    );
  }

  if (!application) {
    throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
  }

  if (!application.personalInformation?.email) {
    throw new AppError('Email not found', 'MISSING_EMAIL', 402);
  }

  await sendInterviewOutcomeEmail(
    `${application.personalInformation.firstName} ${application.personalInformation.lastName}`,
    application.personalInformation.email,
    outcome,
    interview
  );

  res.status(200).json({
    success: true,
    message: 'Interview outcome email sent successfully',
  });
};
