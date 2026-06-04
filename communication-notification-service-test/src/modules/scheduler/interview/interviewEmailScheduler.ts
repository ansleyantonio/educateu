import cron from 'node-cron';
import {
  processScheduledInterviewEmails,
  getInterviewsInTimeRange,
} from './scheduledInterviewEmailService';
import { addInterviewEmailJob } from '../../../queue/bullmq';

interface ScheduledTask {
  name: string;
  cronExpression: string;
  task: () => Promise<void>;
  enabled: boolean;
}

interface TaskInstance {
  name: string;
  cronExpression: string;
  task: ReturnType<typeof cron.schedule>;
  enabled: boolean;
}

/**
 * Interview Email Scheduler
 * Automatically sends interview confirmation and reminder emails based on schedule
 * Uses BullMQ for async job processing
 */
export class InterviewEmailScheduler {
  private tasks: Map<string, TaskInstance> = new Map();
  private isRunning = false;

  /**
   * Initialize and start all scheduled tasks
   */
  public start(): void {
    if (this.isRunning) {
      console.log('[InterviewEmailScheduler] Already running, skipping initialization');
      return;
    }

    console.log('[InterviewEmailScheduler] Starting scheduled tasks...');

    this.registerTasks();

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.start();
      console.log(`[InterviewEmailScheduler] ✅ Task "${name}" scheduled with cron: "${taskInfo.cronExpression}"`);
    });

    this.isRunning = true;
    console.log('[InterviewEmailScheduler] All tasks started successfully\n');
  }

  /**
   * Stop all scheduled tasks
   */
  public stop(): void {
    console.log('[InterviewEmailScheduler] Stopping all tasks...');

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.stop();
      console.log(`[InterviewEmailScheduler] ⏹️  Task "${name}" stopped`);
    });

    this.isRunning = false;
    console.log('[InterviewEmailScheduler] All tasks stopped\n');
  }

  /**
   * Register all scheduled tasks
   */
  private registerTasks(): void {
    // Task 1: Send confirmation emails for interviews scheduled in the next hour
    this.registerTask({
      name: 'send-confirmation-emails',
      cronExpression: '*/15 * * * *', // Every 15 minutes
      task: async () => {
        await this.processConfirmationEmails();
      },
      enabled: true,
    });

    // Task 2: Send 24-hour reminder emails
    this.registerTask({
      name: 'send-24h-reminders',
      cronExpression: '*/30 * * * *', // Every 30 minutes
      task: async () => {
        await this.processReminderEmails('24H');
      },
      enabled: true,
    });

    // Task 3: Send 1-hour reminder emails
    this.registerTask({
      name: 'send-1h-reminders',
      cronExpression: '*/15 * * * *', // Every 15 minutes
      task: async () => {
        await this.processReminderEmails('1H');
      },
      enabled: true,
    });
  }

  /**
   * Register a single task
   */
  private registerTask(config: ScheduledTask): void {
    if (!config.enabled) {
      console.log(`[InterviewEmailScheduler] ⏭️  Skipping disabled task: ${config.name}`);
      return;
    }

    const task = cron.schedule(config.cronExpression, async () => {
      const startTime = Date.now();
      console.log(`[InterviewEmailScheduler] 🕐 Running task: ${config.name}`);

      try {
        await config.task();
        const duration = Date.now() - startTime;
        console.log(`[InterviewEmailScheduler] ✅ Task "${config.name}" completed in ${duration}ms`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[InterviewEmailScheduler] ❌ Task "${config.name}" failed: ${errorMessage}`);
      }
    });

    this.tasks.set(config.name, {
      name: config.name,
      cronExpression: config.cronExpression,
      task: task,
      enabled: config.enabled,
    });
  }

  /**
   * Process confirmation emails for newly scheduled interviews
   */
  private async processConfirmationEmails(): Promise<void> {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

    const interviews = await getInterviewsInTimeRange(now, oneHourFromNow);

    if (interviews.length === 0) {
      console.log('[InterviewEmailScheduler] No confirmation emails to send');
      return;
    }

    console.log(`[InterviewEmailScheduler] Queueing ${interviews.length} confirmation email(s)`);

    for (const interview of interviews) {
      try {
        // Add job to BullMQ queue instead of sending directly
        await addInterviewEmailJob(interview.interviewId, 'CONFIRMATION');
        console.log(`[InterviewEmailScheduler] ✅ Job queued for interview: ${interview.interviewId}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[InterviewEmailScheduler] ❌ Failed to queue job for ${interview.interviewId}: ${errorMessage}`);
      }
    }
  }

  /**
   * Process reminder emails for upcoming interviews
   */
  private async processReminderEmails(reminderType: '24H' | '1H'): Promise<void> {
    const result = await processScheduledInterviewEmails(reminderType);

    console.log(`[InterviewEmailScheduler] ${reminderType} reminders - Success: ${result.success}, Failed: ${result.failed}`);

    if (result.failed > 0) {
      result.results
        .filter((r: { interviewId: string; success: boolean; error?: string }) => !r.success)
        .forEach((r: { interviewId: string; success: boolean; error?: string }) => {
          console.error(`[InterviewEmailScheduler] ❌ ${r.interviewId}: ${r.error}`);
        });
    }
  }

  /**
   * Get status of all scheduled tasks
   */
  public getStatus(): Array<{ name: string; cron: string; running: boolean }> {
    return Array.from(this.tasks.values()).map((taskInfo) => ({
      name: taskInfo.name,
      cron: taskInfo.cronExpression,
      running: this.isRunning,
    }));
  }

  /**
   * Get scheduler configuration
   */
  public getConfig(): {
    isRunning: boolean;
    taskCount: number;
  } {
    return {
      isRunning: this.isRunning,
      taskCount: this.tasks.size,
    };
  }
}

// Export singleton instance
export const interviewEmailScheduler = new InterviewEmailScheduler();
