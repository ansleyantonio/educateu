import cron from 'node-cron';
import {
  getIncompleteApplicationsOlderThan,
} from './incompleteApplicationReminder.service';
import { addIncompleteApplicationJob } from '../../../queue/bullmq';

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
 * Incomplete Application Reminder Scheduler
 * Automatically scans for incomplete applications and sends reminder emails
 * Uses BullMQ for async job processing
 */
export class IncompleteApplicationScheduler {
  private tasks: Map<string, TaskInstance> = new Map();
  private isRunning = false;
  private daysThreshold = 3;

  /**
   * Set the days threshold for incomplete applications
   */
  public setDaysThreshold(days: number): void {
    this.daysThreshold = days;
    console.log(`[IncompleteApplicationScheduler] Days threshold set to: ${days} days`);
  }

  /**
   * Initialize and start all scheduled tasks
   */
  public start(): void {
    if (this.isRunning) {
      console.log('[IncompleteApplicationScheduler] Already running, skipping initialization');
      return;
    }

    console.log('[IncompleteApplicationScheduler] Starting scheduled tasks...');

    this.registerTasks();

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.start();
      console.log(`[IncompleteApplicationScheduler] ✅ Task "${name}" scheduled with cron: "${taskInfo.cronExpression}"`);
    });

    this.isRunning = true;
    console.log('[IncompleteApplicationScheduler] All tasks started successfully\n');
  }

  /**
   * Stop all scheduled tasks
   */
  public stop(): void {
    console.log('[IncompleteApplicationScheduler] Stopping all tasks...');

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.stop();
      console.log(`[IncompleteApplicationScheduler] ⏹️  Task "${name}" stopped`);
    });

    this.isRunning = false;
    console.log('[IncompleteApplicationScheduler] All tasks stopped\n');
  }

  /**
   * Register all scheduled tasks
   */
  private registerTasks(): void {
    // Task 1: Daily check for incomplete applications
    this.registerTask({
      name: 'daily-incomplete-check',
      cronExpression: '0 9 * * *', // Every day at 9:00 AM
      task: async () => {
        await this.processDailyCheck();
      },
      enabled: true,
    });

    // Task 2: Hourly lightweight check
    this.registerTask({
      name: 'hourly-incomplete-check',
      cronExpression: '30 * * * *', // Every hour
      task: async () => {
        await this.processHourlyCheck();
      },
      enabled: true,
    });
  }

  /**
   * Register a single task
   */
  private registerTask(config: ScheduledTask): void {
    if (!config.enabled) {
      console.log(`[IncompleteApplicationScheduler] ⏭️  Skipping disabled task: ${config.name}`);
      return;
    }

    const task = cron.schedule(config.cronExpression, async () => {
      const startTime = Date.now();
      console.log(`[IncompleteApplicationScheduler] 🕐 Running task: ${config.name}`);

      try {
        await config.task();
        const duration = Date.now() - startTime;
        console.log(`[IncompleteApplicationScheduler] ✅ Task "${config.name}" completed in ${duration}ms`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[IncompleteApplicationScheduler] ❌ Task "${config.name}" failed: ${errorMessage}`);
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
   * Process daily check for incomplete applications
   */
  private async processDailyCheck(): Promise<void> {
    console.log('[IncompleteApplicationScheduler] 📋 Running daily incomplete application check...');

    const applications = await getIncompleteApplicationsOlderThan(this.daysThreshold);

    console.log(
      `[IncompleteApplicationScheduler] Found ${applications.length} incomplete applications older than ${this.daysThreshold} days`
    );

    // Queue jobs for each application
    let queuedCount = 0;
    for (const app of applications) {
      try {
        await addIncompleteApplicationJob(app.id, 'FIRST');
        queuedCount++;
        console.log(
          `[IncompleteApplicationScheduler] ✅ Job queued for application: ${app.applicationId ?? app.id}`
        );
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[IncompleteApplicationScheduler] ❌ Failed to queue job for ${app.applicationId ?? app.id}: ${errorMessage}`
        );
      }
    }

    console.log(
      `[IncompleteApplicationScheduler] Daily check complete - Queued: ${queuedCount}/${applications.length}`
    );
  }

  /**
   * Process hourly lightweight check
   */
  private async processHourlyCheck(): Promise<void> {
    const applications = await getIncompleteApplicationsOlderThan(this.daysThreshold);

    if (applications.length === 0) {
      console.log('[IncompleteApplicationScheduler] No incomplete applications to process');
      return;
    }

    console.log(`[IncompleteApplicationScheduler] Hourly check: ${applications.length} incomplete applications found`);
  }

  /**
   * Get scheduler configuration
   */
  public getConfig(): {
    isRunning: boolean;
    daysThreshold: number;
    taskCount: number;
  } {
    return {
      isRunning: this.isRunning,
      daysThreshold: this.daysThreshold,
      taskCount: this.tasks.size,
    };
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
}

// Export singleton instance
export const incompleteApplicationScheduler = new IncompleteApplicationScheduler();
