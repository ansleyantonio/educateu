import type { Request, Response } from 'express';
import prisma from '../../../prismaClient';
import { AppError } from '../../../utils/AppError';
import { sendInterviewConfirmationEmail } from './scheduledInterviewEmailService';
import z from 'zod';
import { zodSafeParse } from '../../../utils/zodUtils';

export const InterviewCreationRequestSchema = z.object({
  userId: z.string().uuid(),
  applicationId: z.string().uuid(),
  interviewDate: z.string(), // ISO date string
  startTime: z.string(), // ISO date string
  endTime: z.string(), // ISO date string
  title: z.string().optional(),
  platform: z.string().optional(),
  guests: z.array(z.string()).optional(),
  color: z.string().optional(),
});

// Controller for creating an interview
export async function createInterview(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validate request body using Zod safeParse
    const {
      userId,
      applicationId,
      interviewDate,
      startTime,
      endTime,
      title,
      platform = 'Google Meet',
      guests = [],
      color = '#3182ce',
    } = zodSafeParse(req.body, InterviewCreationRequestSchema);

    // Parse dates
    const interviewDateObj = new Date(interviewDate);
    const startTimeObj = new Date(startTime);
    const endTimeObj = new Date(endTime);

    // Validate end time is after start time
    if (endTimeObj <= startTimeObj) {
      throw new AppError(
        'endTime must be after startTime',
        'INVALID_TIME_RANGE',
        400
      );
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
    }

    // Verify user (interviewer) exists
    const interviewer = await prisma.userPortalCategoryRole.findUnique({
      where: { id: userId },
      include: {
        userPortalCategory: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!interviewer) {
      throw new AppError('Interviewer not found', 'INTERVIEWER_NOT_FOUND', 404);
    }

    // Generate title if not provided
    const interviewTitle = title ?? `Interview for ${applicationId}`;

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        title: interviewTitle,
        status: 'PENDING',
        interviewDate: interviewDateObj,
        startTime: startTimeObj,
        endTime: endTimeObj,
        platform,
        guests,
        color,
        interviewerId: userId,
        applicationId,
        bookedById: userId,
      },
      include: {
        application: {
          include: {
            personalInformation: true,
          },
        },
        interviewer: {
          include: {
            userPortalCategory: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // Send confirmation email immediately to all recipients
    try {
      await sendInterviewConfirmationEmail(interview.id);
      console.log(
        `[CreateInterview] Confirmation emails sent for interview: ${interview.id}`
      );
    } catch (emailError) {
      console.error(
        '[CreateInterview] Failed to send confirmation emails:',
        emailError
      );
      // Don't fail the request if email fails, just log it
    }

    res.status(201).json({
      success: true,
      message: 'Interview created successfully and confirmation emails sent',
      data: {
        interviewId: interview.id,
        title: interview.title,
        interviewDate: interview.interviewDate,
        startTime: interview.startTime,
        endTime: interview.endTime,
        platform: interview.platform,
        guests: interview.guests,
        studentEmail: interview.application.personalInformation?.email,
        interviewerEmail: interview.interviewer.userPortalCategory?.user?.email,
        totalRecipients:
          1 +
          (interview.interviewer.userPortalCategory?.user?.email ? 1 : 0) +
          interview.guests.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
        error: error.errorCode,
      });
      return;
    }

    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create interview',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
