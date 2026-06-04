import {
  nameSchema,
  optionalPhoneNumberSchema,
  passwordSchema,
  usernameSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const itemSchema = z.object({
  value: z.string(),
  label: z.string(),
});
export const CreateUserFormSchema = z.object({
  username: usernameSchema,
  firstName: nameSchema,
  lastName: nameSchema,
  photo: z.string().optional(),
  password: passwordSchema,
  email: z.string().email({ message: "Enter a Valid Email Address." }),

  mobile: optionalPhoneNumberSchema.optional(),
  websiteUrl: z.string().url().optional(),
  // portalCategoryId: z.array(itemSchema).optional(),
  // portalCategoryId: z.string().min(1, {
  //   message: "Portal Category Is Required.",
  // }),
  // RoleId: z.string().min(1, {
  //   message: "Role Id Is Required.",
  // }),
  RoleId: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .optional(),
});

// updateSchema  exclude password

export const UpdateUserFormSchema = CreateUserFormSchema.omit({
  password: true,
}).partial();

export interface UserRole {
  role: {
    name: string;
  };
}

export interface CreateUsers {
  id: string;
  email: string;
  mobile: string;
  username: string;
  firstName: string;
  lastName: string;
  userStatus: string;
  userRoles: UserRole[];
  address?: string;
  websiteUrl?: string;
}

export interface UserListType {
  data: CreateUsers[];
  totalUsers: number;
  totalPages: number;
  currentPage: number;
}

export type I_CreateUserForm = z.infer<typeof CreateUserFormSchema>;
export type I_UpdateUserForm = z.infer<typeof UpdateUserFormSchema>;
