import z from "zod";

export const notificationsLogReqBodySchema = z.object({
  emailType: z.array(z.string()).optional(),
  status: z.string().optional(),
  recipient: z.string().optional(),
  searchTerm: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
});

export type INotificationsLog = z.infer<typeof notificationsLogReqBodySchema>;
