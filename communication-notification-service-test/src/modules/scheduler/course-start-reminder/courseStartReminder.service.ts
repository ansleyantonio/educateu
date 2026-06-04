import prisma from '../../../prismaClient';
import { sendEmail } from '../../general/mail/mailer';
import { AppError } from '../../../utils/AppError';
import { EmailType } from '@prisma/client';
import { logEmailNotification } from '../../../utils/emailLogger';

/**
 * Interface for course start reminder data
 */
export interface CourseStartReminderData {
  courseId: string;
  courseTitle: string;
  courseCode: string | null;
  startDate: Date;
  studentEmail: string;
  studentName: string;
  applicationId: string;
  applicationRef: string;
}

/**
 * Reminder type for distinguishing 7-day and 10-day reminders
 */
export type ReminderType = '7_DAYS' | '10_DAYS';

/**
 * Interface for course with enrollments
 */
export interface CourseWithEnrollments {
  id: string;
  title: string | null;
  code: string | null;
  startDate: Date | null;
  enrollments: Array<{
    id: string;
    application: {
      id: string;
      applicationId: string | null;
      personalInformation: {
        firstName: string;
        lastName: string;
        email: string;
      } | null;
    } | null;
  }>;
}

/**
 * Interface for reminder email result
 */
export interface ReminderEmailResult {
  success: boolean;
  message: string;
  emailSent: boolean;
}

/**
 * Custom HTML template for course start reminder
 */
function getCourseStartReminderTemplate(
  studentName: string,
  courseTitle: string,
  courseCode: string | null,
  startDate: Date,
  daysUntilStart: number,
  reminderType: ReminderType
): string {
  const startDateFormatted = startDate.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isTenDays = reminderType === '10_DAYS';
  const emoji = isTenDays ? '📅' : '📚';
  const headline = isTenDays
    ? 'Course Starting in 10 Days!'
    : 'Course Starting Soon!';
  const urgencyColor = isTenDays ? '#f59e0b' : '#2c5282';
  const bgColor = isTenDays ? '#fffbeb' : '#ebf8ff';
  const borderColor = isTenDays ? '#f59e0b' : '#2c5282';

  return `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: ${urgencyColor};">${emoji} ${headline}</h2>

          <p>Dear ${studentName},</p>

          <p>We're excited to let you know that your course is starting in <strong>${daysUntilStart} days</strong>!</p>

          <div style="background-color: ${bgColor}; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${borderColor};">
            <h3 style="margin: 0 0 15px 0; color: ${urgencyColor};">Course Details</h3>
            <p style="margin: 0 0 10px 0;"><strong>Course Name:</strong> ${courseTitle}</p>
            ${courseCode ? `<p style="margin: 0 0 10px 0;"><strong>Course Code:</strong> ${courseCode}</p>` : ''}
            <p style="margin: 0 0 10px 0;"><strong>Start Date:</strong> ${startDateFormatted}</p>
            <p style="margin: 0;"><strong>Days Until Start:</strong> ${daysUntilStart} days</p>
          </div>

          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2d3748;">Before Your Course Starts:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 10px;">Ensure you have access to your student portal</li>
              <li style="margin-bottom: 10px;">Check your course materials and syllabus</li>
              <li style="margin-bottom: 10px;">Prepare any required textbooks or resources</li>
              <li style="margin-bottom: 10px;">Test your internet connection and technical setup</li>
              <li style="margin-bottom: 10px;">Join any pre-course orientation sessions if available</li>
            </ul>
          </div>

          <div style="background-color: #f0fff4; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #9ae6b4;">
            <p style="margin: 0; color: #276749;"><strong>💡 Tip:</strong> Make sure to log in to your student portal at least 24 hours before the course starts to familiarize yourself with the platform.</p>
          </div>

          <div style="margin: 30px 0; text-align: center;">
            <p style="margin-bottom: 15px;">Access your course materials:</p>
            <a href="#" style="background-color: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Go to Student Portal</a>
          </div>

          <p>If you have any questions or need assistance before your course starts, please don't hesitate to contact our support team.</p>

          <p>We look forward to seeing you in class!</p>

          <p>Best regards,<br/>The Education Team</p>

          <hr style="margin: 30px 0; border: none; border-top: 1px solid #e2e8f0;" />
          <p style="font-size: 12px; color: #718096; text-align: center;">
            This is an automated reminder. Please do not reply to this email.<br/>
            © ${new Date().getFullYear()} EducateU. All rights reserved.
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Calculate days until course start
 */
function getDaysUntilStart(startDate: Date): number {
  const now = new Date();
  const courseStart = new Date(startDate);
  const diffTime = courseStart.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Send course start reminder email to student
 */
export const sendCourseStartReminderEmail = async (
  applicationId: string,
  courseId: string,
  reminderType: ReminderType = '7_DAYS'
): Promise<ReminderEmailResult> => {
  try {
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        personalInformation: true,
        courseSelection: {
          include: {
            course: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      throw new AppError('Application not found', 'APPLICATION_NOT_FOUND', 404);
    }

    // Only send if application is APPROVED (unconditional or conditional)
    if (
      application.outcome !== 'APPROVED_UNCONDITIONAL' &&
      application.outcome !== 'APPROVED_CONDITIONAL'
    ) {
      console.log(
        `[CourseStartReminder] Application ${applicationId} is not APPROVED (outcome: ${application.outcome}), skipping reminder`
      );
      return {
        success: true,
        message: 'Application not APPROVED, reminder suppressed',
        emailSent: false,
      };
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        title: true,
        code: true,
        startDate: true,
      },
    });

    if (!course?.startDate) {
      throw new AppError(
        'Course not found or start date not set',
        'COURSE_NOT_FOUND',
        404
      );
    }

    const studentEmail = application.personalInformation?.email;
    if (!studentEmail) {
      throw new AppError('Student email not found', 'EMAIL_NOT_FOUND', 404);
    }

    const studentName =
      `${application.personalInformation?.firstName ?? ''} ${application.personalInformation?.lastName ?? ''}`.trim();

    const courseTitle = course.title ?? 'your course';
    const courseCode = course.code;
    const startDate = course.startDate;
    const daysUntilStart = getDaysUntilStart(startDate);

    const daysLabel = reminderType === '10_DAYS' ? '10' : '7';
    const subject = `📅 Your Course Starts in ${daysLabel} Days!`;
    const body = getCourseStartReminderTemplate(
      studentName,
      courseTitle,
      courseCode,
      startDate,
      daysUntilStart,
      reminderType
    );

    // Send email
    await sendEmail(studentEmail, subject, body, body.replace(/<[^>]*>/g, ''));

    // Log to NotificationLog with reminder type in message
    await logEmailNotification(
      EmailType.COURSE_START_REMINDER_EMAIL,
      studentEmail,
      `Course start reminder (${daysLabel} days) sent for course: ${courseTitle}`,
      'SENT'
    );

    console.log(
      `[CourseStartReminder] ✅ Course start reminder (${daysLabel} days) sent to ${studentEmail} for application ${applicationId}`
    );

    return {
      success: true,
      message: 'Course start reminder sent successfully',
      emailSent: true,
    };
  } catch (error) {
    console.error('Error in sendCourseStartReminderEmail:', error);

    if (error instanceof AppError) {
      throw error;
    }

    return {
      success: false,
      message: `Failed to send reminder: ${error instanceof Error ? error.message : 'Unknown error'}`,
      emailSent: false,
    };
  }
};

/**
 * Get upcoming courses with enrollments within specified days
 * @param daysBefore - Number of days before course start to look for
 * @param exactMatch - If true, only return courses starting exactly on daysBefore, otherwise return courses within range
 */
export const getUpcomingCoursesWithEnrollments = async (
  daysBefore: number,
  exactMatch: boolean = true
): Promise<CourseWithEnrollments[]> => {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysBefore);
  targetDate.setHours(0, 0, 0, 0);

  let startDate: Date;
  if (exactMatch) {
    // For exact match, set start and end to the same day
    startDate = new Date(targetDate);
  } else {
    // For range, look back 1 day
    startDate = new Date(targetDate);
    startDate.setDate(startDate.getDate() - 1);
  }

  // Get all approved applications with course selections
  const applications = await prisma.application.findMany({
    where: {
      OR: [
        { outcome: 'APPROVED_UNCONDITIONAL' },
        { outcome: 'APPROVED_CONDITIONAL' },
      ],
      courseSelection: {
        isNot: null,
      },
    },
    include: {
      personalInformation: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
      courseSelection: {
        include: {
          course: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  code: true,
                  startDate: true,
                },
              },
            },
          },
        },
      },
    },
  });

  // Group applications by course
  const courseMap = new Map<string, CourseWithEnrollments>();

  for (const app of applications) {
    const courseData = app.courseSelection?.course?.course;

    if (!courseData?.startDate) {
      continue;
    }

    const courseStartDate = new Date(courseData.startDate);
    courseStartDate.setHours(0, 0, 0, 0);

    // Check if course starts within the target date
    if (exactMatch) {
      // Exact match: course must start on the target date
      if (courseStartDate.getTime() !== targetDate.getTime()) {
        continue;
      }
    } else {
      // Range match: course must start between startDate and targetDate
      if (courseStartDate < startDate || courseStartDate > targetDate) {
        continue;
      }
    }

    const existingCourse = courseMap.get(courseData.id);

    if (!existingCourse) {
      courseMap.set(courseData.id, {
        id: courseData.id,
        title: courseData.title,
        code: courseData.code,
        startDate: courseData.startDate,
        enrollments: [
          {
            id: app.id,
            application: {
              id: app.id,
              applicationId: app.applicationId,
              personalInformation: app.personalInformation,
            },
          },
        ],
      });
    } else {
      existingCourse.enrollments.push({
        id: app.id,
        application: {
          id: app.id,
          applicationId: app.applicationId,
          personalInformation: app.personalInformation,
        },
      });
    }
  }

  return Array.from(courseMap.values());
};

/**
 * Check if reminder was already sent for a course enrollment
 * @param applicationId - The application ID
 * @param courseId - The course ID
 * @param reminderType - The type of reminder to check for ('7_DAYS' or '10_DAYS')
 * @param withinDays - Number of days to look back for existing logs
 */
export const hasReminderBeenSent = async (
  applicationId: string,
  courseId: string,
  reminderType: ReminderType,
  withinDays: number = 10
): Promise<boolean> => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - withinDays);

  const daysLabel = reminderType === '10_DAYS' ? '10' : '7';
  const existingLog = await prisma.notificationLog.findFirst({
    where: {
      message: {
        contains: `(${daysLabel} days)`,
      },
      recipient: {
        contains: '', // Will be filtered by application lookup
      },
      status: 'SENT',
      createdAt: {
        gte: cutoffDate,
      },
    },
  });

  return !!existingLog;
};

/**
 * Process all upcoming courses and send reminders
 * @param daysBefore - Number of days before course start
 * @param reminderType - Type of reminder ('7_DAYS' or '10_DAYS')
 */
export const processCourseStartReminders = async (
  daysBefore: number,
  reminderType: ReminderType
): Promise<{
  total: number;
  success: number;
  failed: number;
  skipped: number;
  results: Array<{
    applicationId: string;
    courseId: string;
    success: boolean;
    error?: string;
  }>;
}> => {
  const courses = await getUpcomingCoursesWithEnrollments(daysBefore, true);
  const daysLabel = reminderType === '10_DAYS' ? '10' : '7';

  console.log(
    `[CourseStartReminder] Found ${courses.length} course(s) starting in ${daysLabel} days`
  );

  const results: Array<{
    applicationId: string;
    courseId: string;
    success: boolean;
    error?: string;
  }> = [];
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;

  for (const course of courses) {
    if (!course.startDate) {
      console.log(
        `[CourseStartReminder] ⏭️  Skipping course ${course.id} - no start date`
      );
      continue;
    }

    console.log(
      `[CourseStartReminder] Processing course: ${course.title ?? course.id} (${course.enrollments.length} students) - ${daysLabel} day reminder`
    );

    for (const enrollment of course.enrollments) {
      if (!enrollment.application) {
        console.log(
          `[CourseStartReminder] ⏭️  Skipping enrollment ${enrollment.id} - no application`
        );
        skippedCount++;
        continue;
      }

      const applicationId = enrollment.application.id;

      // Check if reminder already sent for this type
      const alreadySent = await hasReminderBeenSent(
        applicationId,
        course.id,
        reminderType
      );

      if (alreadySent) {
        console.log(
          `[CourseStartReminder] ⏭️  ${daysLabel}-day reminder already sent for application: ${applicationId}`
        );
        skippedCount++;
        results.push({
          applicationId,
          courseId: course.id,
          success: true,
        });
        continue;
      }

      try {
        const result = await sendCourseStartReminderEmail(
          applicationId,
          course.id,
          reminderType
        );

        if (result.success) {
          if (result.emailSent) {
            successCount++;
            console.log(
              `[CourseStartReminder] ✅ ${daysLabel}-day reminder sent for application: ${applicationId}`
            );
          } else {
            skippedCount++;
            console.log(
              `[CourseStartReminder] ⏭️  Skipped (not APPROVED): ${applicationId}`
            );
          }
          results.push({
            applicationId,
            courseId: course.id,
            success: true,
          });
        } else {
          failedCount++;
          console.error(
            `[CourseStartReminder] ❌ Failed to send ${daysLabel}-day reminder for ${applicationId}: ${result.message}`
          );
          results.push({
            applicationId,
            courseId: course.id,
            success: false,
            error: result.message,
          });
        }
      } catch (error) {
        failedCount++;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[CourseStartReminder] ❌ Failed to send ${daysLabel}-day reminder for ${applicationId}: ${errorMessage}`
        );
        results.push({
          applicationId,
          courseId: course.id,
          success: false,
          error: errorMessage,
        });
      }
    }
  }

  return {
    total: successCount + failedCount + skippedCount,
    success: successCount,
    failed: failedCount,
    skipped: skippedCount,
    results,
  };
};
