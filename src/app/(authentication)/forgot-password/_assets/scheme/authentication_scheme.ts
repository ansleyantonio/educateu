import { z } from "zod";

const signupSchema = z.object({
  role: z.string().min(1, {
    message: "account type is required.",
  }),
  email: z
    .string()
    .min(1, {
      message: "Email is required.",
    })
    .email("Invalid email address"),
});

const signinSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required.",
    })
    .email("Invalid email address"),
  password: z.string().min(1, {
    message: "Password is required.",
  }),
});
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, {
      message: "Email is required.",
    })
    .email("Invalid email address"),
});

const otpSchema = z.object({
  code: z.string().min(6, {
    message: "Your otp must be 6 characters.",
  }),
});

const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, {
        message: "Password is required.",
      })
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter",
      })
      // regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" }).
      .regex(/[0-9]/, { message: "Password must contain at least one number" })
      .regex(/[!@#$%^&*(),.?":{}|<>]/, {
        message: "Password must contain at least one special character",
      }),

    //At least one special character
    confirmPassword: z.string().min(1, {
      message: "confirm password is required.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const authenticationSchema = {
  signupSchema,
  signinSchema,
  forgotPasswordSchema,
  otpSchema,
  setPasswordSchema,
};
