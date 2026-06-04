import type { Request, Response } from 'express';
import prisma from '../../prismaClient';
import { zodSafeParse } from '../../utils/zodUtils';
import { getNotificationLogsQuerySchema, emailTypeArraySchema } from '../../schemas/notificationLogSchema';

export const getNotificationLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  const validatedQuery = zodSafeParse(
    req.query,
    getNotificationLogsQuerySchema
  );

  const { page, limit, status, emailType, recipient, startDate, endDate } =
    validatedQuery;

  const skip = (page - 1) * limit;

  // Build where clause for filtering
  const where: Record<string, unknown> = {};

  if (status) {
    where['status'] = status;
  }

  // Support comma-separated emailType values
  if (emailType) {
    const emailTypeResult = emailTypeArraySchema.safeParse(emailType);
    if (emailTypeResult.success) {
      const emailTypes = emailTypeResult.data;
      where['emailType'] = emailTypes.length === 1
        ? emailTypes[0]
        : { in: emailTypes };
    }
  }

  if (recipient) {
    where['recipient'] = recipient;
  }

  if (startDate || endDate) {
    where['createdAt'] = {};
    if (startDate) {
      (where['createdAt'] as Record<string, unknown>)['gte'] = new Date(
        startDate
      );
    }
    if (endDate) {
      (where['createdAt'] as Record<string, unknown>)['lte'] = new Date(
        endDate
      );
    }
  }

  // Fetch logs with pagination
  const [logs, total] = await Promise.all([
    prisma.notificationLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notificationLog.count({ where }),
  ]);

  // Format logs with recipient + message
  const formattedLogs = logs.map(log => ({
    ...log,
    message: `${log.recipient} - ${log.message}`,
  }));

  res.status(200).json({
    success: true,
    data: {
      logs: formattedLogs,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    },
  });
};

export const getNotificationLogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const log = await prisma.notificationLog.findUnique({
    where: { id: String(id) },
  });

  if (!log) {
    res.status(404).json({
      success: false,
      message: 'Notification log not found',
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: log,
  });
};
