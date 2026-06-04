import { z } from 'zod';

export const serverInfoSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  type: z.enum(['module', 'session', 'logout', 'profile'], {
    message: "Type must be either 'module' or 'session' or 'logout'",
  }),
  deviceId: z.string().optional(),
});

export type ServerInfoInput = z.infer<typeof serverInfoSchema>;
