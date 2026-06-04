import { z } from "zod";

export const studentSchema = z
  .object({
    id: z.string().uuid().optional(),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email().min(1, "Email is required"),
    mobile: z.string().min(1, "Mobile is required"),
    username: z.string().min(1, "Username is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    address: z.string().optional(),
    photo: z.string().optional(),
    nationality: z.string().optional(),
    studentNo: z.string().optional(),
  })
  .strict();

export const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export type studentType = z.infer<typeof studentSchema>;
export type loginType = z.infer<typeof loginSchema>;
