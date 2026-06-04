import { userStatus } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  firstName: z
    .string()
    .min(3, { message: "First name must be at least 3 characters" })
    .max(30, { message: "First name must be at most 30 characters" }),
  lastName: z
    .string()
    .min(3, { message: "Last name must be at least 3 characters" })
    .max(30, { message: "Last name must be at most 30 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
  username: z.string({ message: "Username is required" }),
  address: z.string().optional(), // Optional address
  mobile: z.string().optional(), // Correctly marked as optional

  portalCategoryId: z.string().optional(),
  roleId: z.string().uuid().optional().nullable(),
  roleName: z.string().optional().nullable(),
});

export const updateUserStatusSchema = z.object({
  userStatus: z.enum(["ACTIVE", "DEACTIVATED"], {
    message: "userStatus must be either 'ACTIVE' or 'DEACTIVATED'",
  }),
});
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "Refresh token is required" }),
});

export const updateUserSchema = z
  .object({
    email: z.string().email({ message: "Invalid email address" }),
    firstName: z
      .string()
      .min(3, { message: "First name must be at least 3 characters" })
      .max(30, { message: "First name must be at most 30 characters" }),
    lastName: z
      .string()
      .min(3, { message: "Last name must be at least 3 characters" })
      .max(30, { message: "Last name must be at most 30 characters" }),
    mobile: z.string().optional(),
    username: z.string().optional(),
    address: z.string().optional(),
    userStatus: z.nativeEnum(userStatus).optional(),
    mfaEnabled: z.boolean().optional(),
  })
  .partial();

export const AuditLogFilterSchema = z.object({
  filter: z.enum(["last30days", "all", "dateRange"]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.string().optional(),
});

export type AuditLogFilterDto = z.infer<typeof AuditLogFilterSchema>;
export const ModuleFilterSchema = z.object({
  moduleName: z.string().min(1, "Module name is required"),
  permission: z
    .array(z.string().min(1, "Permission cannot be empty"))
    .min(1, "At least one permission is required"),
});

export const RoleFilterSchema = z.object({
  name: z.string().min(1, "Role name is required"),
});

export const FilterTempUserSchema = z
  .object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
    moduleFilters: z
      .array(
        z.object({
          moduleName: z.string(),
          permission: z.array(z.string()).optional(),
        }),
      )
      .default([])
      .optional(),
    roleFilters: z
      .array(z.object({ name: z.string() }))
      .default([])
      .optional(),
    search: z.string().optional(),
    startDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    manualRevocation: z.boolean().optional(),
  })
  .strict();
