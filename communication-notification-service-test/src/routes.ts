import { Router } from 'express';
// import { asyncWrapper } from './utils/asyncWrapper'; // Removed unused import
import mainRoutes from './routes/main.routes';

// Import module routes
import registrationRoutes from './modules/registration/routes';

import forgotPasswordRoutes from './modules/forgot-password/routes';

import verificationRoutes from './modules/verification/routes';

import notificationRoutes from './modules/notification/routes';

import applicationNotificationRoutes from './modules/application-notification/routes';
import { sendMultipleEmails } from './modules/notification/controller';

import chatRoutes from './modules/chat/chat.routes';
import smsRoutes from './modules/sms/routes';
import agentNotificationRoutes from './modules/agent-notification/routes';
import serverInfoRoutes from './modules/websocket-notification/server-info/routes';
import bellRouter from './modules/bell-test/routes';
import notificationLogRoutes from './modules/notification-log/routes';
import schedulerRoutes from './modules/scheduler/routes';
import queueRoutes from './modules/queue/queue.routes';
import generaleEmailRoutes from './modules/general/mail/routes/enrollmentEmail.route';
const router = Router();

router.use('/', mainRoutes);

router.use('/registration', registrationRoutes);
router.use('/forgot-password', forgotPasswordRoutes);
router.use('/verification', verificationRoutes);
router.use('/notification', notificationRoutes);
router.use('/email', generaleEmailRoutes);
router.use('/application-notification', applicationNotificationRoutes);
router.post('/bulk-email', sendMultipleEmails);
router.use('/chat', chatRoutes);
router.use('/sms', smsRoutes);
router.use('/real-time-notification', agentNotificationRoutes);
router.use('/server-info', serverInfoRoutes);
router.use('/bell-test', bellRouter);
router.use('/notification-log', notificationLogRoutes);

// docker run -d -p 6379:6379 --name redis-queue redis:latest
router.use('/scheduler', schedulerRoutes);
router.use('/queue', queueRoutes);

export default router;
