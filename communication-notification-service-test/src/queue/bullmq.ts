import { Queue, Worker } from 'bullmq';
import type { Job } from 'bullmq';
import ioredis from 'ioredis';
import { sendInterviewConfirmationEmail } from '../modules/scheduler/interview/scheduledInterviewEmailService';
import { sendIncompleteApplicationReminderEmail } from '../modules/scheduler/incomplete-application-reminder/incompleteApplicationReminder.service';
import { sendCourseStartReminderEmail } from '../modules/scheduler/course-start-reminder/courseStartReminder.service';
import type { ReminderType } from '../modules/scheduler/course-start-reminder/courseStartReminder.service';

// Redis connection
const redisConnection = new ioredis({
  host: process.env['REDIS_HOST'] ?? 'localhost',
  port: parseInt(process.env['REDIS_PORT'] ?? '6379', 10),
  password: process.env['REDIS_PASSWORD'] ?? undefined,
  maxRetriesPerRequest: null, // Required for BullMQ workers
  retryStrategy: (times: number): number | null => {
    if (times > 3) {
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

redisConnection.on('error', (error) => {
  console.error('[Redis] Connection error:', error);
});

redisConnection.on('connect', () => {
  console.log('[Redis] Connected successfully');
});

// Queue names
export const QueueNames = {
  INTERVIEW_EMAIL: 'interview-email-queue',
  INCOMPLETE_APPLICATION: 'incomplete-application-queue',
  COURSE_START_REMINDER: 'course-start-reminder-queue',
} as const;

export type QueueName = (typeof QueueNames)[keyof typeof QueueNames];

// Job data types
export interface InterviewEmailJobData {
  interviewId: string;
  emailType: 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_1H';
}

export interface IncompleteApplicationJobData {
  applicationId: string;
  reminderType: 'FIRST' | 'SECOND' | 'FINAL';
}

export interface CourseStartReminderJobData {
  applicationId: string;
  courseId: string;
  reminderType: ReminderType;
}

// Union type for all job data
export type JobData =
  | InterviewEmailJobData
  | IncompleteApplicationJobData
  | CourseStartReminderJobData;

// Queues
export const interviewEmailQueue = new Queue(QueueNames.INTERVIEW_EMAIL, {
  connection: redisConnection,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 1000,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

export const incompleteApplicationQueue = new Queue(
  QueueNames.INCOMPLETE_APPLICATION,
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 1000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  }
);

export const courseStartReminderQueue = new Queue(
  QueueNames.COURSE_START_REMINDER,
  {
    connection: redisConnection,
    defaultJobOptions: {
      removeOnComplete: 100,
      removeOnFail: 1000,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  }
);

// Processors
async function interviewEmailProcessor(
  job: Job<InterviewEmailJobData>
): Promise<{ success: boolean; interviewId: string; emailType: string }> {
  const { interviewId, emailType } = job.data;

  console.log(
    `[BullMQ] Processing interview email job: ${job.id} - ${interviewId} (${emailType})`
  );

  try {
    await sendInterviewConfirmationEmail(interviewId);
    console.log(
      `[BullMQ] ✅ Interview email sent successfully: ${interviewId} (${emailType})`
    );
    return { success: true, interviewId, emailType };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[BullMQ] ❌ Failed to send interview email ${interviewId}: ${errorMessage}`
    );
    throw error;
  }
}

async function incompleteApplicationProcessor(
  job: Job<IncompleteApplicationJobData>
): Promise<{ success: boolean; applicationId: string; reminderType: string }> {
  const { applicationId, reminderType } = job.data;

  console.log(
    `[BullMQ] Processing incomplete application job: ${job.id} - ${applicationId} (${reminderType})`
  );

  try {
    const result = await sendIncompleteApplicationReminderEmail(
      applicationId,
      reminderType
    );

    if (!result.success) {
      throw new Error(result.message);
    }

    console.log(
      `[BullMQ] ✅ Incomplete application reminder sent successfully: ${applicationId}`
    );
    return { success: true, applicationId, reminderType };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[BullMQ] ❌ Failed to send incomplete application reminder ${applicationId}: ${errorMessage}`
    );
    throw error;
  }
}

async function courseStartReminderProcessor(
  job: Job<CourseStartReminderJobData>
): Promise<{ success: boolean; applicationId: string; courseId: string; reminderType: string }> {
  const { applicationId, courseId, reminderType } = job.data;
  const daysLabel = reminderType === '10_DAYS' ? '10' : '7';

  console.log(
    `[BullMQ] Processing course start reminder job: ${job.id} - ${applicationId} (${daysLabel}-day)`
  );

  try {
    const result = await sendCourseStartReminderEmail(applicationId, courseId, reminderType);

    if (!result.success) {
      throw new Error(result.message);
    }

    console.log(
      `[BullMQ] ✅ Course start reminder (${daysLabel}-day) sent successfully: ${applicationId}`
    );
    return { success: true, applicationId, courseId, reminderType };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(
      `[BullMQ] ❌ Failed to send course start reminder ${applicationId}: ${errorMessage}`
    );
    throw error;
  }
}

// Workers
export const interviewEmailWorker = new Worker<InterviewEmailJobData>(
  QueueNames.INTERVIEW_EMAIL,
  interviewEmailProcessor,
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

export const incompleteApplicationWorker =
  new Worker<IncompleteApplicationJobData>(
    QueueNames.INCOMPLETE_APPLICATION,
    incompleteApplicationProcessor,
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

export const courseStartReminderWorker = new Worker<CourseStartReminderJobData>(
  QueueNames.COURSE_START_REMINDER,
  courseStartReminderProcessor,
  {
    connection: redisConnection,
    concurrency: 5,
  }
);

// Worker event listeners
function setupWorkerListeners(
  worker: Worker,
  queueName: string
): void {
  worker.on('completed', (job) => {
    console.log(`[BullMQ] Job completed: ${job.id} in ${queueName}`);
  });

  worker.on('failed', (job, error) => {
    console.error(
      `[BullMQ] Job failed: ${job?.id} in ${queueName} - ${error.message}`
    );
  });

  worker.on('error', (error) => {
    console.error(`[BullMQ] Worker error in ${queueName}:`, error);
  });
}

setupWorkerListeners(interviewEmailWorker, QueueNames.INTERVIEW_EMAIL);
setupWorkerListeners(
  incompleteApplicationWorker,
  QueueNames.INCOMPLETE_APPLICATION
);
setupWorkerListeners(courseStartReminderWorker, QueueNames.COURSE_START_REMINDER);

// Helper functions to add jobs to queues
export async function addInterviewEmailJob(
  interviewId: string,
  emailType: 'CONFIRMATION' | 'REMINDER_24H' | 'REMINDER_1H'
): Promise<Job<InterviewEmailJobData>> {
  const job = await interviewEmailQueue.add(
    `${interviewId}-${emailType}-${Date.now()}`,
    { interviewId, emailType }
  );
  console.log(
    `[BullMQ] Added interview email job: ${job.id} - ${interviewId} (${emailType})`
  );
  return job;
}

export async function addIncompleteApplicationJob(
  applicationId: string,
  reminderType: 'FIRST' | 'SECOND' | 'FINAL' = 'FIRST'
): Promise<Job<IncompleteApplicationJobData>> {
  const job = await incompleteApplicationQueue.add(
    `${applicationId}-${reminderType}-${Date.now()}`,
    { applicationId, reminderType }
  );
  console.log(
    `[BullMQ] Added incomplete application job: ${job.id} - ${applicationId} (${reminderType})`
  );
  return job;
}

export async function addCourseStartReminderJob(
  applicationId: string,
  courseId: string,
  reminderType: ReminderType = '7_DAYS'
): Promise<Job<CourseStartReminderJobData>> {
  const daysLabel = reminderType === '10_DAYS' ? '10' : '7';
  const job = await courseStartReminderQueue.add(
    `${applicationId}-${courseId}-${reminderType}-${Date.now()}`,
    { applicationId, courseId, reminderType }
  );
  console.log(
    `[BullMQ] Added course start reminder job (${daysLabel}-day): ${job.id} - ${applicationId}`
  );
  return job;
}

// Graceful shutdown
export async function closeBullMQ(): Promise<void> {
  console.log('[BullMQ] Closing queues and workers...');

  await Promise.all([
    interviewEmailQueue.close(),
    incompleteApplicationQueue.close(),
    courseStartReminderQueue.close(),
    interviewEmailWorker.close(),
    incompleteApplicationWorker.close(),
    courseStartReminderWorker.close(),
    redisConnection.quit(),
  ]);

  console.log('[BullMQ] All queues and workers closed successfully');
}

// Get queue stats
export async function getQueueStats(): Promise<{
  [key: string]: {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  };
}> {
  const [interviewStats, incompleteStats, courseStartStats] = await Promise.all([
    Promise.all([
      interviewEmailQueue.getWaitingCount(),
      interviewEmailQueue.getActiveCount(),
      interviewEmailQueue.getCompletedCount(),
      interviewEmailQueue.getFailedCount(),
    ]),
    Promise.all([
      incompleteApplicationQueue.getWaitingCount(),
      incompleteApplicationQueue.getActiveCount(),
      incompleteApplicationQueue.getCompletedCount(),
      incompleteApplicationQueue.getFailedCount(),
    ]),
    Promise.all([
      courseStartReminderQueue.getWaitingCount(),
      courseStartReminderQueue.getActiveCount(),
      courseStartReminderQueue.getCompletedCount(),
      courseStartReminderQueue.getFailedCount(),
    ]),
  ]);

  return {
    [QueueNames.INTERVIEW_EMAIL]: {
      waiting: interviewStats[0],
      active: interviewStats[1],
      completed: interviewStats[2],
      failed: interviewStats[3],
    },
    [QueueNames.INCOMPLETE_APPLICATION]: {
      waiting: incompleteStats[0],
      active: incompleteStats[1],
      completed: incompleteStats[2],
      failed: incompleteStats[3],
    },
    [QueueNames.COURSE_START_REMINDER]: {
      waiting: courseStartStats[0],
      active: courseStartStats[1],
      completed: courseStartStats[2],
      failed: courseStartStats[3],
    },
  };
}
