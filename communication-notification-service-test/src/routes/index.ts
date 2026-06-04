import { Router } from 'express';
import mainRoutes from './main.routes';
import registrationRoutes from '../modules/registration/routes';
import forgotPasswordRoutes from '../modules/forgot-password/routes';
import verificationRoutes from '../modules/verification/routes';
import applicationNotificationRoutes from '../modules/application-notification/routes';
import websocketNotificationRoutes from '../modules/websocket-notification/routes';

const router = Router();
// Register all routes
router.use('/', mainRoutes);
router.use('/registration', registrationRoutes);
router.use('/forgot-password', forgotPasswordRoutes);
router.use('/verification', verificationRoutes);
router.use('/application-notification', applicationNotificationRoutes);
router.use('/websocket-notification', websocketNotificationRoutes);

export default router;
