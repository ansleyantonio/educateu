import { Router } from 'express';
import { interviewEmailScheduler } from './interview/interviewEmailScheduler';
import { incompleteApplicationScheduler } from './incomplete-application-reminder/incompleteApplicationScheduler.service';
import { courseStartReminderScheduler } from './course-start-reminder/courseStartReminderScheduler';
import {
  getUpcomingInterviews,
  getUpcomingInterviewsForEmails,
} from './interview/controller';
import { createInterview } from './interview/createInterviewController';

const router = Router();

interviewEmailScheduler.start();

incompleteApplicationScheduler.start();

courseStartReminderScheduler.start();

// API endpoints to view upcoming interviews
router.get('/interview/upcoming', getUpcomingInterviews);
router.get('/interview/upcoming/for-emails', getUpcomingInterviewsForEmails);

router.post('/interview/create', createInterview);

export default router;
