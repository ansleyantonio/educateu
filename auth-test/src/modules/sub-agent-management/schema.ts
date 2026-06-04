import { z } from "zod";

// Define the schema for roleData
const roleDataSchema = z
  .object({
    internalReference: z.string().optional(),
    userStatus: z.string().optional(),
    companyName: z.string().optional(),
    reportingTo: z.string().optional(),
  })
  .optional();

// Define the schema for userRoles
const userRolesSchema = z
  .array(
    z.object({
      roleData: roleDataSchema,
    }),
  )
  .optional();

// Register schema
export const subAgentSchema = z
  .object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    mobile: z.string(),
    username: z.string().optional(),
    password: z.string(),
    address: z.string().optional(),
    internalReference: z.string().optional(),
    companyName: z.string().optional().nullable(),
    userStatus: z
      .enum(["PENDING", "ACTIVE", "DEACTIVATED", "SUSPENDED"])
      .optional()
      .default("ACTIVE"),
    reportingTo: z.string().optional(),
    userRoles: userRolesSchema,
  })
  .strict()
  .partial();

export type SubAgentDataType = z.infer<typeof subAgentSchema>;

// Update schema
