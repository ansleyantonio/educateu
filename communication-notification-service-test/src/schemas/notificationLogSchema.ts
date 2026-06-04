import { z } from 'zod';

// Schema for query parameters (filtering and pagination)
export const getNotificationLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum(['SENT', 'FAILED']).optional(),
  emailType: z.string().optional(),
  recipient: z.string().email().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type GetNotificationLogsQuerySchema = z.infer<
  typeof getNotificationLogsQuerySchema
>;

// Schema for parsing comma-separated email types
export const emailTypeArraySchema = z.string().transform((val) => {
  return val.split(',').map((t) => t.trim()).filter((t) => t.length > 0);
});
