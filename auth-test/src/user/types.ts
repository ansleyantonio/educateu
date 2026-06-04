import { z } from "zod";

const nonEmptyStringSchema = z.string().min(3);

export const assignRoleReqBodySchema = z.object({
  userId: z.string().uuid(),
  admin: z
    .object({
      roleId: z.string().uuid(),
      roleName: nonEmptyStringSchema,
    })
    .optional(),
  agent: z
    .object({
      roleId: z.string().uuid(),
      roleName: nonEmptyStringSchema,
    })
    .optional(),
});

export type AssignRoleReqBody = z.infer<typeof assignRoleReqBodySchema>;
