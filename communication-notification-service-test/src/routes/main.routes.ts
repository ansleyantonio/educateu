import { Router } from 'express';
import type { Request, Response } from 'express';
import { env } from '../config/env';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// Main route
router.get(
  '/',
  asyncWrapper(async (req: Request, res: Response) => {
    res.send('Notification Service is running! on port ' + env.PORT);
  })
);

// Health check endpoint
router.get(
  '/health',
  asyncWrapper(async (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      environment: env.NODE_ENV,
    });
  })
);

// Test route in main routes
router.post(
  '/test-main',
  asyncWrapper(async (req: Request, res: Response) => {
    console.log('Test-main route called with body:', req.body);
    res.status(200).json({
      message: 'Test-main route works!',
      body: req.body,
    });
  })
);

export default router;
