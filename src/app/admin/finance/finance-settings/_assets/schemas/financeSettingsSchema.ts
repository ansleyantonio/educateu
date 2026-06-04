import { optionalNumberSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation schemas
const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();

// Create Finance Settings Schema
const CreateFinanceSettingsSchema = z.object({
  // Discount fields
  discountName: textSchema,
  discountType: z.enum(["PERCENTAGE", "FIXED"], {
    errorMap: () => ({ message: "Please select a discount type" }),
  }),
  discountValue: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === undefined) return undefined;
      return Number(val);
    })
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: "Discount value must be a positive number",
    }),

  // Template fields (all optional) - camelCase naming
  subjectEmail: optionalTextSchema,
  templateEmail: optionalTextSchema,
  subjectPayment: optionalTextSchema,
  templatePayment: optionalTextSchema,
  subjectReminder: optionalTextSchema,
  templateReminder: optionalTextSchema,
  subjectInvoice: optionalTextSchema,
  templateInvoice: optionalTextSchema,

  // Reminders
  autoReminder: z.boolean().optional().default(false),
  frequency: z
    .enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"], {
      errorMap: () => ({ message: "Please select a valid frequency" }),
    })
    .optional(),

  // Filters
  sessionId: optionalTextSchema,
  courseId: optionalTextSchema,
  paymentStatus: z.enum(["COMPLETED", "PENDING", "FAILED"], {
    errorMap: () => ({ message: "Please select a valid payment status" }),
  }).optional(),
});

// Update Finance Settings Schema (all fields optional)
const UpdateFinanceSettingsSchema = z.object({
  discountName: optionalTextSchema,
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z
    .union([z.string(), z.number()])
    .transform((val) => {
      if (val === "" || val === undefined) return undefined;
      return Number(val);
    })
    .refine((val) => val === undefined || (!isNaN(val) && val > 0), {
      message: "Discount value must be a positive number",
    })
    .optional(),

  subjectEmail: optionalTextSchema,
  templateEmail: optionalTextSchema,
  subjectPayment: optionalTextSchema,
  templatePayment: optionalTextSchema,
  subjectReminder: optionalTextSchema,
  templateReminder: optionalTextSchema,
  subjectInvoice: optionalTextSchema,
  templateInvoice: optionalTextSchema,

  autoReminder: z.boolean().optional(),
  frequency: z.enum(["ONCE", "DAILY", "WEEKLY", "MONTHLY"]).optional(),

  sessionId: optionalTextSchema,
  courseId: optionalTextSchema,
  paymentStatus: z.enum(["COMPLETED", "PENDING", "FAILED"]).optional(),
});

// Filter Schema
const FilterFinanceSettingsSchema = z.object({
  discountName: optionalTextSchema,
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: optionalNumberSchema,
  sessionId: optionalTextSchema,
  courseId: optionalTextSchema,
  paymentStatus: z.enum(["COMPLETED", "PENDING", "FAILED"]).optional(),
});

// Type exports
export type IFinanceSettingsForm = z.infer<typeof CreateFinanceSettingsSchema>;
export type IFinanceSettingsUpdateForm = z.infer<typeof UpdateFinanceSettingsSchema>;
export type IFinanceSettingsFilterForm = z.infer<typeof FilterFinanceSettingsSchema>;

// Schema object export
export const IFinanceSettingsSchema = {
  create: CreateFinanceSettingsSchema,
  update: UpdateFinanceSettingsSchema,
  filter: FilterFinanceSettingsSchema,
};