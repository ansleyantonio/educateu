import { Router } from 'express';
import type { Request, Response } from 'express';
import type { Job } from 'bullmq';
import {
  getQueueStats,
  QueueNames,
  interviewEmailQueue,
  incompleteApplicationQueue,
  courseStartReminderQueue,
} from '../../queue/bullmq';

const router = Router();

/**
 * GET /queue/stats
 * Get statistics for all queues
 */
router.get(
  '/stats',
  async (_req: Request, res: Response) => {
    try {
      const stats = await getQueueStats();
      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
    }
  }
);

/**
 * GET /queue/:queueName/jobs
 * Get jobs from a specific queue by status
 */
router.get(
  '/:queueName/jobs',
  async (req: Request, res: Response) => {
    try {
      const queueName = Array.isArray(req.params['queueName']) 
        ? req.params['queueName'][0] 
        : req.params['queueName'];
      
      if (!queueName) {
        return res.status(400).json({
          success: false,
          error: 'Queue name is required',
        });
      }

      const { status = 'waiting', start = 0, end = 100 } = req.query;

      const validQueues: Record<string, typeof interviewEmailQueue> = {
        [QueueNames.INTERVIEW_EMAIL]: interviewEmailQueue,
        [QueueNames.INCOMPLETE_APPLICATION]: incompleteApplicationQueue,
        [QueueNames.COURSE_START_REMINDER]: courseStartReminderQueue,
      };

      if (!Object.keys(validQueues).includes(queueName)) {
        return res.status(400).json({
          success: false,
          error: `Invalid queue name. Valid options: ${Object.values(QueueNames).join(', ')}`,
        });
      }

      const queue = validQueues[queueName] as typeof interviewEmailQueue;

      let jobs;
      const startNum = parseInt(start as string);
      const endNum = parseInt(end as string);

      switch (status) {
        case 'waiting':
          jobs = await queue.getWaiting(startNum, endNum);
          break;
        case 'active':
          jobs = await queue.getActive(startNum, endNum);
          break;
        case 'completed':
          jobs = await queue.getCompleted(startNum, endNum);
          break;
        case 'failed':
          jobs = await queue.getFailed(startNum, endNum);
          break;
        case 'delayed':
          jobs = await queue.getDelayed(startNum, endNum);
          break;
        default:
          jobs = await queue.getWaiting(startNum, endNum);
      }

      res.json({
        success: true,
        data: {
          queueName,
          status,
          count: jobs.length,
          jobs: jobs.map((job: Job) => ({
            id: job.id,
            name: job.name,
            data: job.data,
            timestamp: job.timestamp,
            attemptsMade: job.attemptsMade,
          })),
        },
      });
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
      return;
    }
  }
);

/**
 * POST /queue/:queueName/retry-failed
 * Retry all failed jobs in a queue
 */
router.post(
  '/:queueName/retry-failed',
  async (req: Request, res: Response) => {
    try {
      const queueName = Array.isArray(req.params['queueName']) 
        ? req.params['queueName'][0] 
        : req.params['queueName'];
      
      if (!queueName) {
        return res.status(400).json({
          success: false,
          error: 'Queue name is required',
        });
      }

      const validQueues: Record<string, typeof interviewEmailQueue> = {
        [QueueNames.INTERVIEW_EMAIL]: interviewEmailQueue,
        [QueueNames.INCOMPLETE_APPLICATION]: incompleteApplicationQueue,
        [QueueNames.COURSE_START_REMINDER]: courseStartReminderQueue,
      };

      if (!Object.keys(validQueues).includes(queueName)) {
        return res.status(400).json({
          success: false,
          error: `Invalid queue name. Valid options: ${Object.values(QueueNames).join(', ')}`,
        });
      }

      const queue = validQueues[queueName] as typeof interviewEmailQueue;

      const failedJobs = await queue.getFailed(0, 100);
      let retryCount = 0;

      for (const job of failedJobs) {
        await job.retry();
        retryCount++;
      }

      res.json({
        success: true,
        data: {
          queueName,
          retryCount,
        },
      });
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
      return;
    }
  }
);

/**
 * DELETE /queue/:queueName/clear
 * Clear all completed jobs from a queue
 */
router.delete(
  '/:queueName/clear',
  async (req: Request, res: Response) => {
    try {
      const queueName = Array.isArray(req.params['queueName']) 
        ? req.params['queueName'][0] 
        : req.params['queueName'];
      
      if (!queueName) {
        return res.status(400).json({
          success: false,
          error: 'Queue name is required',
        });
      }

      const validQueues: Record<string, typeof interviewEmailQueue> = {
        [QueueNames.INTERVIEW_EMAIL]: interviewEmailQueue,
        [QueueNames.INCOMPLETE_APPLICATION]: incompleteApplicationQueue,
        [QueueNames.COURSE_START_REMINDER]: courseStartReminderQueue,
      };

      if (!Object.keys(validQueues).includes(queueName)) {
        return res.status(400).json({
          success: false,
          error: `Invalid queue name. Valid options: ${Object.values(QueueNames).join(', ')}`,
        });
      }

      const queue = validQueues[queueName] as typeof interviewEmailQueue;

      await queue.obliterate({ force: false });

      res.json({
        success: true,
        message: `Queue ${queueName} cleared successfully`,
      });
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({
        success: false,
        error: errorMessage,
      });
      return;
    }
  }
);

export default router;
