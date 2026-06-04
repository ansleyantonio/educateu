import type { Request, Response } from 'express';
import { zodSafeParse } from '../../../utils/zodUtils';
import { serverInfoSchema } from './serverInfoSchema';
// import * as service from '../../services/serverInfo.service';
import { sendServerInfoToUser } from './server-info.websocket';

/**
 * Handle Server Info Update
 * POST /server-info
 */
export const updateServerInfo = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = zodSafeParse(req.body, serverInfoSchema);

  const resultMessage = await sendServerInfoToUser(
    data.userId,
    data.type,
    data?.deviceId
  );

  res.status(200).json({
    success: true,
    message: 'Send server info successfully',
    data: resultMessage,
  });
};
