import { z } from "zod";

export const AuthSchema = z
  .object({
    username: z.string().optional(),
    id: z.string().optional(),
  })
  .strict();

export type AuthSchemaType = z.infer<typeof AuthSchema>;

export const UpdatePasswordSchema = z
  .object({
    id: z.string(),
    password: z.string(),
  })
  .strict();
export type UpdatePasswordSchemaType = z.infer<typeof UpdatePasswordSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  deviceId: z.string().optional(),
});

export type loginType = z.infer<typeof loginSchema>;

export const portalType = z.enum(["admin", "faculty", "agent"]);
export type portalTypeType = z.infer<typeof portalType>;

export const ManualPaymentSchema = z.object({
  accountNo: z.string().min(1, "Account No is required"),
  accountName: z.string().min(1, "Account Name is required"),
  referenceNo: z.string().min(1, "Reference No is required"),
  currency: z.enum(["USD", "GBP", "EURO", "BDT"]).optional(),
  applicationId: z.string().uuid("Invalid Application ID"),
  paymentType: z.enum(["FULL", "SEMESTER"]),
  amount: z.number().positive("Amount must be greater than 0"),
  bankName: z.string().optional(),
  receipts: z.string().min(1, "Receipt URL is required"),
});

export type ManualPaymentForm = z.infer<typeof ManualPaymentSchema>;

export const userLogoutSchema = z.object({
  userId: z.string().uuid("Invalid User ID"),
  deviceId: z.string().optional(),
  logoutTime: z.string().datetime("Invalid logout time").optional(),
});
