import cron from 'node-cron';
import { getUpcomingCoursesWithEnrollments } from './courseStartReminder.service';
import { addCourseStartReminderJob } from '../../../queue/bullmq';
import type { ReminderType } from './courseStartReminder.service';

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

export class CourseStartReminderScheduler {
  private tasks: Map<string, TaskInstance> = new Map();
  private isRunning = false;
  private daysBeforeCourse = 7;

  /**
   * Set the days before course start to send reminder
   */
  public setDaysBeforeCourse(days: number): void {
    this.daysBeforeCourse = days;
    console.log(
      `[CourseStartReminderScheduler] Days before course set to: ${days} days`
    );
  }

  /**
   * Initialize and start all scheduled tasks
   */
  public start(): void {
    if (this.isRunning) {
      console.log(
        '[CourseStartReminderScheduler] Already running, skipping initialization'
      );
      return;
    }

    console.log('[CourseStartReminderScheduler] Starting scheduled tasks...');

    this.registerTasks();

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.start();
      console.log(
        `[CourseStartReminderScheduler] ✅ Task "${name}" scheduled with cron: "${taskInfo.cronExpression}"`
      );
    });

    this.isRunning = true;
    console.log(
      '[CourseStartReminderScheduler] All tasks started successfully\n'
    );
  }

  /**
   * Stop all scheduled tasks
   */
  public stop(): void {
    console.log('[CourseStartReminderScheduler] Stopping all tasks...');

    this.tasks.forEach((taskInfo, name) => {
      taskInfo.task.stop();
      console.log(`[CourseStartReminderScheduler] ⏹️  Task "${name}" stopped`);
    });

    this.isRunning = false;
    console.log('[CourseStartReminderScheduler] All tasks stopped\n');
  }

  /**
   * Register all scheduled tasks
   */
  private registerTasks(): void {
    // Task 1: Daily check for courses starting in 10 days
    this.registerTask({
      name: 'daily-course-start-check-10-days',
      cronExpression: '0 10 * * *', // Every day at 10:00 AM
      task: async () => {
        await this.processDailyCourseStartCheck(10, '10_DAYS');
      },
      enabled: true,
    });

    // Task 2: Daily check for courses starting in 7 days
    this.registerTask({
      name: 'daily-course-start-check-7-days',
      cronExpression: '0 10 * * *', // Every day at 10:00 AM
      task: async () => {
        await this.processDailyCourseStartCheck(7, '7_DAYS');
      },
      enabled: true,
    });

    // Task 3: Hourly lightweight check for 10-day reminders
    this.registerTask({
      name: 'hourly-course-start-check-10-days',
      cronExpression: '0 * * * *', // Every hour at minute 0
      task: async () => {
        await this.processHourlyCourseStartCheck(10, '10_DAYS');
      },
      enabled: true,
    });

    // Task 4: Hourly lightweight check for 7-day reminders
    this.registerTask({
      name: 'hourly-course-start-check-7-days',
      cronExpression: '30 * * * *', // Every hour at minute 30
      task: async () => {
        await this.processHourlyCourseStartCheck(7, '7_DAYS');
      },
      enabled: true,
    });
  }

  /**
   * Register a single task
   */
  private registerTask(config: ScheduledTask): void {
    if (!config.enabled) {
      console.log(
        `[CourseStartReminderScheduler] ⏭️  Skipping disabled task: ${config.name}`
      );
      return;
    }

    const task = cron.schedule(config.cronExpression, async () => {
      const startTime = Date.now();
      console.log(
        `[CourseStartReminderScheduler] 🕐 Running task: ${config.name}`
      );

      try {
        await config.task();
        const duration = Date.now() - startTime;
        console.log(
          `[CourseStartReminderScheduler] ✅ Task "${config.name}" completed in ${duration}ms`
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[CourseStartReminderScheduler] ❌ Task "${config.name}" failed: ${errorMessage}`
        );
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
   * Process daily check for courses starting in specified days
   */
  private async processDailyCourseStartCheck(
    daysBefore: number,
    reminderType: ReminderType
  ): Promise<void> {
    const daysLabel = reminderType === '10_DAYS' ? '10' : '7';
    console.log(
      `[CourseStartReminderScheduler] 📋 Running daily ${daysLabel}-day course start reminder check...`
    );

    const courses = await getUpcomingCoursesWithEnrollments(daysBefore, true);

    console.log(
      `[CourseStartReminderScheduler] Found ${courses.length} course(s) starting in ${daysLabel} days`
    );

    // Queue jobs for each enrollment
    let queuedCount = 0;
    let totalCount = 0;

    for (const course of courses) {
      for (const enrollment of course.enrollments) {
        totalCount++;
        try {
          const applicationId = enrollment.application?.id;
          if (!applicationId) {
            console.log(
              '[CourseStartReminderScheduler] ⏭️  Skipping enrollment - no application ID'
            );
            continue;
          }
          await addCourseStartReminderJob(applicationId, course.id, reminderType);
          queuedCount++;
          console.log(
            `[CourseStartReminderScheduler] ✅ ${daysLabel}-day job queued for application: ${applicationId}`
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error(
            `[CourseStartReminderScheduler] ❌ Failed to queue job for ${enrollment.application?.id}: ${errorMessage}`
          );
        }
      }
    }

    console.log(
      `[CourseStartReminderScheduler] Daily ${daysLabel}-day check complete - Queued: ${queuedCount}/${totalCount}`
    );
  }

  /**
   * Process hourly lightweight check
   */
  private async processHourlyCourseStartCheck(
    daysBefore: number,
    reminderType: ReminderType
  ): Promise<void> {
    const daysLabel = reminderType === '10_DAYS' ? '10' : '7';
    const courses = await getUpcomingCoursesWithEnrollments(daysBefore, true);

    if (courses.length === 0) {
      console.log(
        `[CourseStartReminderScheduler] No upcoming courses to process for ${daysLabel}-day reminder`
      );
      return;
    }

    let totalEnrollments = 0;
    courses.forEach(course => {
      totalEnrollments += course.enrollments.length;
    });

    console.log(
      `[CourseStartReminderScheduler] Hourly check: ${courses.length} course(s) starting in ${daysLabel} days with ${totalEnrollments} enrollment(s)`
    );
  }

  /**
   * Get scheduler configuration
   */
  public getConfig(): {
    isRunning: boolean;
    daysBeforeCourse: number;
    taskCount: number;
  } {
    return {
      isRunning: this.isRunning,
      daysBeforeCourse: this.daysBeforeCourse,
      taskCount: this.tasks.size,
    };
  }

  /**
   * Get status of all scheduled tasks
   */
  public getStatus(): Array<{ name: string; cron: string; running: boolean }> {
    return Array.from(this.tasks.values()).map(taskInfo => ({
      name: taskInfo.name,
      cron: taskInfo.cronExpression,
      running: this.isRunning,
    }));
  }
}

// Export singleton instance
export const courseStartReminderScheduler = new CourseStartReminderScheduler();
