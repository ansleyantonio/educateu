import z from "zod";

export const registerSchema = z.object({
  username: z
    .string({ message: "Username is required" })
    .min(3, { message: "Username must be at least 3 characters" }),
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
  mobile: z.string().optional(),
  roleName: z.string().optional().nullable(),
});

export type CreateBulkUserSchema = z.infer<typeof registerSchema>;

const ModulePermissionSchema = z.enum(["GET", "POST", "DELETE"]);

// Module Schema
const ModuleSchema = z.object({
  moduleId: z.string().uuid(),
  modulePermission: z.array(ModulePermissionSchema).default([]),
});

// Portal Category Schema
const PortalCategorySchema = z.object({
  portalCategoryId: z.string().uuid(),
  modules: z.array(ModuleSchema),
});

// Main Payload Schema
export const UserPortalSchema = z.object({
  userId: z.array(z.string().uuid()),
  portalCategories: z.array(PortalCategorySchema),
});

// Type inference (optional)
export type UserPortal = z.infer<typeof UserPortalSchema>;
