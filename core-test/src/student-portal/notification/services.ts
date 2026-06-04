import { PrismaClient } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import createAuditLog from "../../utils/auditlog";
import {
  CreateNotificationPreferences,
  UpdateNotificationPreferences,
  GetNotificationPreferences,
  NotificationPreferencesResponse,
} from "./schema";

const prisma = new PrismaClient();

export const getNotificationPreferencesService = async ({
  studentId,
}: GetNotificationPreferences): Promise<NotificationPreferencesResponse> => {
  const notificationPreferences = await prisma.notification.findUnique({
    where: { studentId },
  });

  if (!notificationPreferences) {
    throw new AppError("Notification preferences not found", "NOTIFICATION_PREFERENCES_NOT_FOUND", 404);
  }

  return {
    id: notificationPreferences.id,
    emailNotification: notificationPreferences.emailNotification,
    assignmentNotification: notificationPreferences.assignmentNotification,
    gradeUpdate: notificationPreferences.gradeUpdate,
    forumReply: notificationPreferences.forumReply,
    announcements: notificationPreferences.announcements,
    studentId: notificationPreferences.studentId,
  };
};

export const updateNotificationPreferencesService = async (data: UpdateNotificationPreferences, studentId: string) => {
  const existingPreferences = await prisma.notification.findUnique({
    where: { studentId },
  });

  if (!existingPreferences) {
    const createdPreferences = await prisma.notification.create({
      data: {
        studentId,
        emailNotification: data.emailNotification ?? true,
        assignmentNotification: data.assignmentNotification ?? true,
        gradeUpdate: data.gradeUpdate ?? true,
        forumReply: data.forumReply ?? true,
        announcements: data.announcements ?? true,
      },
    });

    return {
      id: createdPreferences.id,
      emailNotification: createdPreferences.emailNotification,
      assignmentNotification: createdPreferences.assignmentNotification,
      gradeUpdate: createdPreferences.gradeUpdate,
      forumReply: createdPreferences.forumReply,
      announcements: createdPreferences.announcements,
      studentId: createdPreferences.studentId,
    };
  }

  const updatedPreferences = await prisma.notification.update({
    where: { studentId },
    data: {
      ...(data.emailNotification !== undefined && { emailNotification: data.emailNotification }),
      ...(data.assignmentNotification !== undefined && { assignmentNotification: data.assignmentNotification }),
      ...(data.gradeUpdate !== undefined && { gradeUpdate: data.gradeUpdate }),
      ...(data.forumReply !== undefined && { forumReply: data.forumReply }),
      ...(data.announcements !== undefined && { announcements: data.announcements }),
    },
  });

  return {
    id: updatedPreferences.id,
    emailNotification: updatedPreferences.emailNotification,
    assignmentNotification: updatedPreferences.assignmentNotification,
    gradeUpdate: updatedPreferences.gradeUpdate,
    forumReply: updatedPreferences.forumReply,
    announcements: updatedPreferences.announcements,
    studentId: updatedPreferences.studentId,
  };
};
