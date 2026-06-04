import prisma from '../prismaClient';
import type { Prisma, AgentNotification } from '@prisma/client';
import { AppError } from '../utils/AppError';
import type {
  CreateNotificationInput,
  NotificationFilterInput,
  CreateNotificationCommentInput,
} from '../schemas/agentNotificationSchema';
import { sendNotificationToUser } from '../modules/agent-notification/agent-notification.websocket';

/**
 * Agent Notification Service
 *
 * Handles all database operations related to agent notifications
 */

interface Comment {
  id: string;
  authorId: string;
  authorName?: string | null;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface MetadataWithComments {
  comments?: Comment[];
  [key: string]: unknown;
}

/**
 * Create notifications for multiple users
 */
export const createNotification = async (
  data: CreateNotificationInput
): Promise<{ createdCount: number; notifications: AgentNotification[] }> => {
  // Create notifications and return them directly
  const createdNotifications = await prisma.agentNotification.createManyAndReturn({
    data: data.userIds.map(userId => ({
      userId,
      title: data.title,
      message: data.message,
      type: data.type as 'APPLICATION_SUBMITTED' | 'DOCUMENT_REQUEST',
      metadata: (data.metadata ?? null) as Prisma.InputJsonValue,
      relatedEntity: data.relatedEntity ?? null,
    })),
  });

  // Send WebSocket notification to each user if connected
  createdNotifications.forEach((notification: AgentNotification) => {
    sendNotificationToUser(notification.userId, {
      notificationId: notification.id,
      action: 'created',
      notification: notification as unknown as Record<string, unknown>,
    });
  });

  return {
    createdCount: createdNotifications.length,
    notifications: createdNotifications,
  };
};

/**
 * Get notifications for a user with filters and pagination
 */
export const getUserNotifications = async (
  userId: string,
  filters: NotificationFilterInput
): Promise<{
  data: AgentNotification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> => {
  const { status, type, isArchived, search, page = 1, limit = 20 } = filters;

  // Build where clause
  const where: Record<string, unknown> = {
    userId,
  };

  if (status) {
    if (status === 'ARCHIVED') {
      where['isArchived'] = true;
    } else {
      where['isArchived'] = false;
      where['status'] = status;
    }
  } else if (isArchived !== undefined) {
    where['isArchived'] = isArchived;
  }

  if (type) {
    where['type'] = type as 'APPLICATION_SUBMITTED' | 'DOCUMENT_REQUEST';
  }

  if (search) {
    where['OR'] = [
      { title: { contains: search, mode: 'insensitive' } },
      { message: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Calculate skip for pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.agentNotification.count({ where });

  // Get notifications
  const notifications = await prisma.agentNotification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get unread notification count for a user
 */
export const getUnreadCount = async (userId: string): Promise<{ count: number }> => {
  const count = await prisma.agentNotification.count({
    where: {
      userId,
      status: 'UNREAD',
      isArchived: false,
    },
  });

  return { count };
};

/**
 * Get single notification by ID
 */
export const getNotificationById = async (
  id: string,
  userId: string
): Promise<AgentNotification> => {
  const notification = await prisma.agentNotification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError(
      'You do not have permission to access this notification',
      'FORBIDDEN',
      403
    );
  }

  return notification;
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  id: string,
  userId: string
): Promise<AgentNotification> => {
  const notification = await prisma.agentNotification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError(
      'You do not have permission to modify this notification',
      'FORBIDDEN',
      403
    );
  }

  const updated = await prisma.agentNotification.update({
    where: { id },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  return updated;
};

/**
 * Delete a notification
 */
export const deleteNotification = async (
  id: string,
  userId: string
): Promise<{ success: boolean; message: string }> => {
  const notification = await prisma.agentNotification.findUnique({
    where: { id },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError(
      'You do not have permission to delete this notification',
      'FORBIDDEN',
      403
    );
  }

  await prisma.agentNotification.delete({
    where: { id },
  });

  return { success: true, message: 'Notification deleted successfully' };
};

/**
 * Bulk update notification status
 */
export const bulkUpdateStatus = async (
  notificationIds: string[],
  status: 'UNREAD' | 'READ' | 'ARCHIVED',
  userId: string
): Promise<{ updatedCount: number; notificationIds: string[] }> => {
  // Verify all notifications belong to the user
  const notifications = await prisma.agentNotification.findMany({
    where: {
      id: { in: notificationIds },
    },
  });

  if (notifications.length !== notificationIds.length) {
    throw new AppError('One or more notifications not found', 'NOT_FOUND', 404);
  }

  const unauthorized = notifications.some(n => n.userId !== userId);
  if (unauthorized) {
    throw new AppError(
      'You do not have permission to modify some of these notifications',
      'FORBIDDEN',
      403
    );
  }

  const updateData: Record<string, unknown> = { status };
  if (status === 'READ') {
    updateData['readAt'] = new Date();
  }
  if (status === 'ARCHIVED') {
    updateData['isArchived'] = true;
    updateData['archivedAt'] = new Date();
  }

  const result = await prisma.agentNotification.updateMany({
    where: {
      id: { in: notificationIds },
    },
    data: updateData,
  });

  return {
    updatedCount: result.count,
    notificationIds,
  };
};

/**
 * Archive notifications
 */
export const archiveNotifications = async (
  notificationIds: string[],
  userId: string
): Promise<{ updatedCount: number; notificationIds: string[] }> => {
  // Verify all notifications belong to the user
  const notifications = await prisma.agentNotification.findMany({
    where: {
      id: { in: notificationIds },
    },
  });

  if (notifications.length !== notificationIds.length) {
    throw new AppError('One or more notifications not found', 'NOT_FOUND', 404);
  }

  const unauthorized = notifications.some(n => n.userId !== userId);
  if (unauthorized) {
    throw new AppError(
      'You do not have permission to modify some of these notifications',
      'FORBIDDEN',
      403
    );
  }

  const result = await prisma.agentNotification.updateMany({
    where: {
      id: { in: notificationIds },
    },
    data: {
      isArchived: true,
      status: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });

  return {
    updatedCount: result.count,
    notificationIds,
  };
};

/**
 * Mark all notifications as read for a user
 */
export const markAllAsRead = async (userId: string): Promise<{ updatedCount: number }> => {
  const result = await prisma.agentNotification.updateMany({
    where: {
      userId,
      status: 'UNREAD',
      isArchived: false,
    },
    data: {
      status: 'READ',
      readAt: new Date(),
    },
  });

  return {
    updatedCount: result.count,
  };
};

/**
 * Add a comment to a notification
 * Note: Uses metadata field as workaround until AgentNotificationComment model is added
 */
export const addComment = async (
  data: CreateNotificationCommentInput,
  authorId: string
): Promise<{
  id: string;
  notificationId: string;
  authorId: string;
  authorName: null;
  message: string;
  createdAt: string;
  updatedAt: string;
}> => {
  const notification = await prisma.agentNotification.findUnique({
    where: { id: data.notificationId },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  // Get existing comments from metadata or initialize empty array
  const existingMetadata = notification.metadata as MetadataWithComments | null;
  const comments =
    (existingMetadata?.['comments'] as Comment[] | undefined) ?? [];

  const newComment: Comment = {
    id: `temp-${Date.now()}`,
    authorId,
    authorName: null,
    message: data.message,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedMetadata: MetadataWithComments = {
    ...existingMetadata,
    comments: [...comments, newComment],
  };

  await prisma.agentNotification.update({
    where: { id: data.notificationId },
    data: {
      metadata: updatedMetadata as Prisma.InputJsonValue,
    },
  });

  return {
    id: newComment.id,
    notificationId: data.notificationId,
    authorId,
    authorName: null,
    message: data.message,
    createdAt: newComment.createdAt,
    updatedAt: newComment.updatedAt,
  };
};

/**
 * Get comments for a notification
 * Note: Reads from metadata field as workaround until AgentNotificationComment model is added
 */
export const getComments = async (
  notificationId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    notificationId: string;
    authorId: string;
    authorName: string | null;
    message: string;
    createdAt: string;
    updatedAt: string;
  }>
> => {
  const notification = await prisma.agentNotification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('Notification not found', 'NOT_FOUND', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError(
      'You do not have permission to view comments for this notification',
      'FORBIDDEN',
      403
    );
  }

  // Read comments from metadata
  const existingMetadata = notification.metadata as MetadataWithComments | null;
  const comments =
    (existingMetadata?.['comments'] as Comment[] | undefined) ?? [];

  return comments.map((comment: Comment) => ({
    id: comment.id,
    notificationId,
    authorId: comment.authorId,
    authorName: comment.authorName ?? null,
    message: comment.message,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  }));
};
