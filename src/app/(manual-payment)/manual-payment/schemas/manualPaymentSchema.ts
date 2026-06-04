import { z } from "zod";

export const ManualPaymentSchema = z.object({
  applicationId: z.string().uuid("Invalid Application ID"),
  paymentType: z.enum(["FULL", "SEMESTER"], {
    required_error: "Payment type is required",
  }),
  accountNo: z.string().min(1, "Account No is required"),
  accountName: z.string().min(1, "Account Name is required"),
  referenceNo: z.string().min(1, "Reference No is required"),
  bankName: z.string().min(1, "Bank Name is required"),
  // currency: z.enum(["USD", "GBP", "EURO", "BDT"], {
  //   required_error: "Currency is required",
  // }),
  currency: z.string().min(1, "Currency is required"),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than zero"),
  receipts: z
    .string()
    .url("Please provide a receipt URL")
    .nonempty("Please provide a receipt URL"),
});

export type IManualPaymentForm = z.infer<typeof ManualPaymentSchema>;