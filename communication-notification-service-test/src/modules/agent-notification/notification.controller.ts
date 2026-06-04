import type { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { zodSafeParse } from '../../utils/zodUtils';
import * as service from '../../services/agentNotification.service';
import {
  createNotificationSchema,
  notificationFilterSchema,
  bulkUpdateNotificationStatusSchema,
  archiveNotificationSchema,
  createNotificationCommentSchema,
} from '../../schemas/agentNotificationSchema';

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  const filters = zodSafeParse(req.query, notificationFilterSchema);
  const result = await service.getUserNotifications(userId, filters);

  res.status(200).json({
    success: true,
    message: 'Notifications retrieved successfully',
    data: result.data,
    pagination: result.pagination,
  });
};

/**
 * Get unread notification count
 * GET /agent-notification/unread-count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  const result = await service.getUnreadCount(userId);

  res.status(200).json({
    success: true,
    message: 'Unread count retrieved successfully',
    data: result,
  });
};

/**
 * Get single notification by ID
 * GET /agent-notification/:id
 */
export const getNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  if (!id || Array.isArray(id)) {
    throw new AppError(
      'Notification ID is required',
      'MISSING_NOTIFICATION_ID',
      400
    );
  }

  const notification = await service.getNotificationById(id, userId);

  res.status(200).json({
    success: true,
    message: 'Notification retrieved successfully',
    data: notification,
  });
};

/**
 * Get comments for a notification
 * GET /agent-notification/:id/comments
 */
export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=123)',
      'MISSING_USER_ID',
      400
    );
  }

  if (!id || Array.isArray(id)) {
    throw new AppError(
      'Notification ID is required',
      'MISSING_NOTIFICATION_ID',
      400
    );
  }

  const comments = await service.getComments(id, userId);

  res.status(200).json({
    success: true,
    message: 'Comments retrieved successfully',
    data: comments,
  });
};

/**
 * Create a new notification
 * POST /agent-notification
 */
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = zodSafeParse(req.body, createNotificationSchema);
  const result = await service.createNotification(data);

  res.status(201).json({
    success: true,
    message: `Notification created for ${result.createdCount} user(s)`,
    data: result.notifications,
  });
};

/**
 * Mark notification as read
 * PATCH /agent-notification/:id/read
 */
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  if (!id || Array.isArray(id)) {
    throw new AppError(
      'Notification ID is required',
      'MISSING_NOTIFICATION_ID',
      400
    );
  }

  const notification = await service.markAsRead(id, userId);

  res.status(200).json({
    success: true,
    message: 'Notification marked as read successfully',
    data: notification,
  });
};

/**
 * Add a comment to a notification
 * POST /agent-notification/:id/comment
 */
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  if (!id || Array.isArray(id)) {
    throw new AppError(
      'Notification ID is required',
      'MISSING_NOTIFICATION_ID',
      400
    );
  }

  const data = zodSafeParse(req.body, createNotificationCommentSchema);

  // Ensure the notificationId in body matches the route parameter
  if (data.notificationId !== id) {
    throw new AppError('Notification ID mismatch', 'ID_MISMATCH', 400);
  }

  const comment = await service.addComment(data, userId);

  res.status(201).json({
    success: true,
    message: 'Comment added successfully',
    data: comment,
  });
};

/**
 * Delete a notification
 * DELETE /agent-notification/:id
 */
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;
  const { id } = req.params;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  if (!id || Array.isArray(id)) {
    throw new AppError(
      'Notification ID is required',
      'MISSING_NOTIFICATION_ID',
      400
    );
  }

  const result = await service.deleteNotification(id, userId);

  res.status(200).json({
    success: true,
    message: result.message,
  });
};

/**
 * Bulk update notification status
 * PATCH /agent-notification/bulk/status
 */
export const bulkUpdateStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  const data = zodSafeParse(req.body, bulkUpdateNotificationStatusSchema);
  const result = await service.bulkUpdateStatus(
    data.notificationIds,
    data.status,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'Notifications updated successfully',
    data: result,
  });
};

/**
 * Archive notifications
 * PATCH /agent-notification/bulk/archive
 */
export const archiveNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  const data = zodSafeParse(req.body, archiveNotificationSchema);
  const result = await service.archiveNotifications(
    data.notificationIds,
    userId
  );

  res.status(200).json({
    success: true,
    message: 'Notifications archived successfully',
    data: result,
  });
};

/**
 * Mark all notifications as read
 * POST /agent-notification/mark-all-read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.query['userId'] as string | undefined as
    | string
    | undefined;

  if (!userId) {
    throw new AppError(
      'User ID is required (pass as query param: ?userId=xxx)',
      'MISSING_USER_ID',
      400
    );
  }

  const result = await service.markAllAsRead(userId);

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read successfully',
    data: result,
  });
};
