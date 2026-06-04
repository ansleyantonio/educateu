import { Router } from 'express';
import * as controller from './notification.controller';

const router = Router();

/**
 * Agent Notification Routes
 * Base: /agent-notification
 * 
 * Use Cases:
 * - Application submitted notifications
 * - Document request notifications
 * - Comment/reply notifications
 */

// Get notifications for user (with filters: status, type, isArchived, search, page, limit)
router.get('/', controller.getNotifications);

// Get unread notification count (for bell icon badge)
router.get('/unread-count', controller.getUnreadCount);

// Get single notification by ID
router.get('/:id', controller.getNotificationById);

// Get comments for a notification
router.get('/:id/comments', controller.getComments);

// Create a new notification (document request, comment, application submitted)
router.post('/', controller.createNotification);

// Mark notification as read
router.patch('/:id/read', controller.markAsRead);

// Add a comment/reply to a notification
router.post('/:id/comment', controller.addComment);

// Delete a notification
router.delete('/:id', controller.deleteNotification);

// Bulk operations
router.patch('/bulk/status', controller.bulkUpdateStatus);
router.patch('/bulk/archive', controller.archiveNotifications);

// Mark all as read
router.post('/mark-all-read', controller.markAllAsRead);

export default router;
