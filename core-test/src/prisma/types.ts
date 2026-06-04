import { z } from "zod";

const userStatusEnum = z.enum(["ACTIVE", "PENDING", "DEACTIVATED", "SUSPENDED"]);

export const UserSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobile: z.string().min(10, { message: "Mobile number must be at least 10 digits" }),
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).optional(),
  password: z.string().min(3, { message: "Password must be at least 6 characters" }),
  address: z.string().optional(),
  emailVerified: z.boolean().default(false),
  passwordChanged: z.boolean().default(false),
  userStatus: userStatusEnum.default("ACTIVE"),
});

export const PortalCategorySchema = z.object({
  name: z.string().min(3),
});

export const RoleSchema = z.object({
  name: z.string().min(3),
});

export const ModuleSchema = z.object({
  name: z.string().min(3),
});
