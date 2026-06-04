import {
  passwordSchema,
  phoneNumberSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

export const updateSubAgentFormSchema = z.object({
  username: z.string().min(1, {
    message: "Username is required.",
  }),
  firstName: z
    .string()
    .min(1, {
      message: "First Name is required.",
    })
    .min(3, {
      message: "First Name must be at least 3 characters.",
    }),
  lastName: z
    .string()
    .min(1, {
      message: "Last Name is required.",
    })
    .min(3, {
      message: "Last Name must be at least 3 characters.",
    }),
  userStatus: z.enum(["ACTIVE", "PENDING"]),

  companyName: z.string().optional(),
  internalReference: z.string().optional(),
  email: z.string().email({ message: "Enter a valid email address." }),

  mobile: phoneNumberSchema,
  address: z.string().optional(),
});

export const subAgentCreateFormSchema = updateSubAgentFormSchema.extend({
  password: passwordSchema, // add password field
  reportingTo: z.string().min(1, { message: "Reporting to is required." }),
});

export type subAgentCreateFormSchemaType = z.infer<
  typeof subAgentCreateFormSchema
>;

export type updateSubAgentFormSchemaType = z.infer<
  typeof subAgentCreateFormSchema
>;
