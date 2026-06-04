import { z } from "zod";

const passwordValidation = z
  .string()
  .min(1, {
    message: "New Password is required.",
  })
  .min(8, {
    message: "Password must be at least 8 characters.",
  })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((val) => /\d/.test(val), {
    message: "Password must contain at least one number.",
  })
  .refine((val) => /[!@#$%^&*(),.?\":{}|<>_\-+=~`\[\]\\\\;/]/.test(val), {
    message: "Password must contain at least one special character.",
  })
  .refine((val) => !/012|123|234|345|456|567|678|789/.test(val), {
    message: "Password cannot contain sequential numbers.",
  });

export default passwordValidation;
