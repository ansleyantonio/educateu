import type { Request, Response } from 'express';
import {
  getUpcomingInterviewsForEmails as getUpcomingInterviewsForEmailsService,
  getUpcomingInterviewsWithRecipients,
} from './scheduledInterviewEmailService';
import { AppError } from '../../../utils/AppError';

/**
 * Get upcoming interviews that will receive emails
 * GET /scheduler/interview/upcoming
 */
export async function getUpcomingInterviews(req: Request, res: Response): Promise<void> {
  try {
    const { start, end } = req.query;

    let startTime: Date | undefined;
    let endTime: Date | undefined;

    if (start) {
      startTime = new Date(start as string);
      if (isNaN(startTime.getTime())) {
        throw new AppError('Invalid start date format', 'INVALID_DATE', 400);
      }
    }

    if (end) {
      endTime = new Date(end as string);
      if (isNaN(endTime.getTime())) {
        throw new AppError('Invalid end date format', 'INVALID_DATE', 400);
      }
    }

    const upcomingInterviews = await getUpcomingInterviewsWithRecipients(startTime, endTime);

    res.json({
      success: true,
      count: upcomingInterviews.length,
      data: upcomingInterviews,
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

    console.error('Error fetching upcoming interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming interviews',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * Get interviews scheduled for email notifications (confirmation, 24h reminder, 1h reminder)
 * GET /scheduler/interview/upcoming/for-emails
 */
export async function getUpcomingInterviewsForEmails(req: Request, res: Response): Promise<void> {
  try {
    const upcomingInterviews = await getUpcomingInterviewsForEmailsService();

    res.json({
      success: true,
      data: upcomingInterviews,
      summary: {
        confirmationsCount: upcomingInterviews.confirmations.length,
        reminders24hCount: upcomingInterviews.reminders24h.length,
        reminders1hCount: upcomingInterviews.reminders1h.length,
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

    console.error('Error fetching upcoming interviews for emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming interviews for emails',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
