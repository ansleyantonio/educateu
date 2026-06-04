import { z } from "zod";

export const notificationPreferencesSchema = z
  .object({
    emailNotification: z.boolean().optional().default(true),
    assignmentNotification: z.boolean().optional().default(true),
    gradeUpdate: z.boolean().optional().default(true),
    forumReply: z.boolean().optional().default(true),
    announcements: z.boolean().optional().default(true),
  })
  .strict();

export const updateNotificationPreferencesSchema = notificationPreferencesSchema.partial();

export const createNotificationPreferencesSchema = notificationPreferencesSchema.extend({
  studentId: z.string().uuid(),
});

export const getNotificationPreferencesSchema = z.object({
  studentId: z.string().uuid(),
});

export const notificationPreferencesResponseSchema = z
  .object({
    id: z.string().uuid(),
    emailNotification: z.boolean(),
    assignmentNotification: z.boolean(),
    gradeUpdate: z.boolean(),
    forumReply: z.boolean(),
    announcements: z.boolean(),
    studentId: z.string().uuid(),
  })
  .strict();

export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>;
export type UpdateNotificationPreferences = z.infer<typeof updateNotificationPreferencesSchema>;
export type CreateNotificationPreferences = z.infer<typeof createNotificationPreferencesSchema>;
export type GetNotificationPreferences = z.infer<typeof getNotificationPreferencesSchema>;
export type NotificationPreferencesResponse = z.infer<typeof notificationPreferencesResponseSchema>;
