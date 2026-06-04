import { z } from "zod";

export const RoleDataSchema = z.object({
  userStatus: z.string(),
  companyName: z.string(),
  reportingTo: z.string().uuid(),
  internalReference: z.string(),
});

export const UserSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  mobile: z.string(),
  username: z.string(),
  password: z.string(),
  address: z.string(),
});

export const RoleSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  application: z.array(z.enum(["GET", "POST", "PUT", "PATCH"])),
});

export const SubAgentSchema = z.object({
  id: z.string().uuid(),
  roleData: RoleDataSchema,
  user: UserSchema,
  role: RoleSchema,
});

export type SubAgent = z.infer<typeof SubAgentSchema>;
