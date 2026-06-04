import { z } from 'zod';

// Enums
export const notificationTypeEnum = z.enum([
  'APPLICATION_SUBMITTED',
  'DOCUMENT_REQUEST',
]);
export const notificationStatusEnum = z.enum(['UNREAD', 'READ', 'ARCHIVED']);
export const entityTypeEnum = z.enum(['APPLICATION', 'COMMENT', 'DOCUMENT']);

// Schema for creating a notification
export const createNotificationSchema = z.object({
  userIds: z.array(z.string().min(1, 'User ID is required')).min(1, 'At least one user ID is required'),
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required'),
  type: notificationTypeEnum.default('APPLICATION_SUBMITTED'),
  metadata: z.record(z.string(), z.unknown()).optional(),
  relatedEntity: z.string().optional(),
  entityType: entityTypeEnum.optional(),
});

// Schema for updating notification status
export const updateNotificationStatusSchema = z.object({
  status: notificationStatusEnum,
});

// Schema for bulk update notification status
export const bulkUpdateNotificationStatusSchema = z.object({
  notificationIds: z
    .array(z.string().uuid())
    .min(1, 'At least one notification ID is required'),
  status: notificationStatusEnum,
});

// Schema for archiving notifications
export const archiveNotificationSchema = z.object({
  notificationIds: z
    .array(z.string().uuid())
    .min(1, 'At least one notification ID is required'),
  isArchived: z.boolean(),
});

// Schema for notification comment
export const createNotificationCommentSchema = z.object({
  notificationId: z.string().uuid('Invalid notification ID'),
  message: z.string().min(1, 'Message is required').max(2000),
});

// Schema for notification filters
export const notificationFilterSchema = z.object({
  status: notificationStatusEnum.optional(),
  type: notificationTypeEnum.optional(),
  isArchived: z.boolean().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// Schema for notification response
export const notificationResponseSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: notificationTypeEnum,
  status: notificationStatusEnum,
  isArchived: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).nullable(),
  relatedEntity: z.string().nullable(),
  readAt: z.string().datetime().nullable(),
  archivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for notification comment response
export const notificationCommentResponseSchema = z.object({
  id: z.string().uuid(),
  notificationId: z.string().uuid(),
  authorId: z.string(),
  authorName: z.string().nullable(),
  message: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schema for bulk update response
export const bulkUpdateResponseSchema = z.object({
  updatedCount: z.number(),
  notificationIds: z.array(z.string().uuid()),
});

// Schema for unread count response
export const unreadCountResponseSchema = z.object({
  count: z.number(),
});

// Export types
export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type UpdateNotificationStatusInput = z.infer<
  typeof updateNotificationStatusSchema
>;
export type BulkUpdateNotificationStatusInput = z.infer<
  typeof bulkUpdateNotificationStatusSchema
>;
export type CreateNotificationCommentInput = z.infer<
  typeof createNotificationCommentSchema
>;
export type NotificationFilterInput = z.infer<typeof notificationFilterSchema>;
export type NotificationResponse = z.infer<typeof notificationResponseSchema>;
export type NotificationCommentResponse = z.infer<
  typeof notificationCommentResponseSchema
>;
export type BulkUpdateResponse = z.infer<typeof bulkUpdateResponseSchema>;
export type UnreadCountResponse = z.infer<typeof unreadCountResponseSchema>;
