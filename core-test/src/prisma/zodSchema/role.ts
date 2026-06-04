import { z } from "zod";

const nonEmptyString = z.string().min(1, "Field cannot be empty");

export const roleSchema = z
  .object({
    name: nonEmptyString,
    // userRoles: z.array(z.any()).optional(), // Define a schema for UserRole if needed
    application: z.any(), // Can be refined to a specific JSON schema if structure is known
  })
  .strict();
