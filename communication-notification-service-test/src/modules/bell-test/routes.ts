import type { Request, Response } from 'express';
import { Router } from 'express';
import path from 'path';

const bellRouter = Router();

/**
 * Serve the notification bell test page
 * GET /bell-test
 */
bellRouter.get('/', (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'notification-bell-test.html'));
});

export default bellRouter;
