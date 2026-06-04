import { z } from "zod";

const nonEmptyString = z.string().min(1, "Field cannot be empty");

export const userRoleSchema = z
  .object({
    userId: nonEmptyString,
    roleId: z.string().uuid(),
    roleData: z.any(),
    // userRoleApplications: z.array(z.any()).optional(), // Array of related UserRoleApplication objects (refine as needed)
  })
  .strict();
