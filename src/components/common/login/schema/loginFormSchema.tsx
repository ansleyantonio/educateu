import { z } from "zod";

const LoginFormSchema = z.object({
  username: z.string().min(1, {
    message: "Email is required.",
  }),
  // .email({ message: "Invalid email format." }),
  password: z
    .string()
    .min(1, {
      message: "Password is required.",
    })
    .min(3, {
      message: "Password must be at least 3 characters.",
    }),
});

export type LoginType = z.infer<typeof LoginFormSchema>;

const defaultValues = {
  username: "",
  password: "",
};

const otpSchema = z.object({
  code: z.string().min(6, {
    message: "Your otp must be 6 characters.",
  }),
});

export const LoginForm = {
  LoginFormSchema,
  defaultValues,
  otpSchema,
};
