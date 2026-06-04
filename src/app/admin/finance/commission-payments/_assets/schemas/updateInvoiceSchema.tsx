/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  optionalTextSchema,
  textSchema,
} from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

const updateInvoiceStatusSchema = z
  .object({
    invoiceIds: z.array(z.string()),
    invoiceStatus: textSchema({ label: "Status" }),
    note: optionalTextSchema,
  })
  .superRefine((data, ctx) => {
    if (
      data.invoiceStatus === "REJECTED" &&
      (data.note === "" || data.note === null)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invoice Info is required",
        path: ["invoiceInfo"],
      });
    }
  });

export const InvoiceSchema = {
  updateInvoiceStatusSchema,
};

export type IUpdateInvoiceForm = z.infer<
  typeof InvoiceSchema.updateInvoiceStatusSchema
>;

export type I_InvoiceUpdate_Form = z.infer<
  typeof InvoiceSchema.updateInvoiceStatusSchema
>;
