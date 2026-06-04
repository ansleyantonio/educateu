import { Router } from 'express';
import {
  sendChatMessageController,
  getChatHistoryController,
  markMessagesReadController,
  getUnreadCountController,
  getConversationsController,
  deleteChatMessageController,
} from './chat.controller';
import { asyncWrapper } from '../../utils/asyncWrapper';

const router = Router();

// Send a chat message
router.post('/send', asyncWrapper(sendChatMessageController));

// Get chat history between two participants
router.get('/history', asyncWrapper(getChatHistoryController));

// Mark all messages as read
router.post('/mark-read', asyncWrapper(markMessagesReadController));

// Get unread message count
router.get('/unread-count', asyncWrapper(getUnreadCountController));

// Get all conversations
router.get('/conversations', asyncWrapper(getConversationsController));

// Delete a chat message
router.delete('/:messageId', asyncWrapper(deleteChatMessageController));

export default router;
