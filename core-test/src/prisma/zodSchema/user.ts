import { z } from "zod";

const nonEmptyString = z.string().min(1, "Field cannot be empty");

export const userSchema = z
  .object({
    firstName: nonEmptyString,
    lastName: nonEmptyString,
    email: z.string().email(),
    mobile: nonEmptyString,
    username: z.string().nullable().optional(),
    password: z.string().min(6), // Assuming a minimum password length of 6
    address: z.string().nullable().optional(),
    // passwordReset: z.array(z.any()).optional(), // Define a schema for PasswordReset if needed
    // resetToken: z.array(z.any()).optional(), // Define a schema for PasswordResetToken if needed
    // userRoles: z.array(z.any()).optional(), // Define a schema for UserRole if needed
  })
  .strict();
