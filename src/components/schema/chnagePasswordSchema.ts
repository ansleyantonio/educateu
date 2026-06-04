import { z } from "zod";
import passwordValidation from "./passwordValidation";

const passwordFormSchema = z
  .object({
    currentPassword: z.string().min(1, {
      message: "Current Password is required.",
    }),
    newPassword: passwordValidation,
    confirmPassword: z.string().min(1, {
      message: "Confirm Password is required.",
    }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords did not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New Password cannot be the same as Current Password.",
    path: ["newPassword"],
  });

export default passwordFormSchema;
