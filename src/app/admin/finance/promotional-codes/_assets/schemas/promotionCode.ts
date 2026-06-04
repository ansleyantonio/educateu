/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { textSchema } from "@/lib/SchemaType/validationSchema";
import { z } from "zod";

// Reusable validation
//const textSchema = z.string().min(1, { message: "This field is required" });
const optionalTextSchema = z.string().optional();
const numberSchema = z
  .number({ invalid_type_error: "Must be a number" })
  .positive("Must be a positive number");

const baseSchema = z.object({
  codeName: textSchema({ label: "Code Name Title" }),
  discountType: z
    .string({ required_error: "Discount type is required" })
    .min(1, "Discount type is required"), //
  discountValue: z.preprocess(
    (val) => (val === "" ? undefined : Number(val)),
    z
      .number({ invalid_type_error: "Discount value must be a number" })
      .positive("Must be a positive number")
  ),
  NoExpirationDate: z.boolean().optional(),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date().optional(),
  status: z.string().optional(),
});

// const CreatePromotionalCodeSchema = z.object({
//   codeName: textSchema({ label: "Code Name Title" }),
//   discountType: z
//     .string({ required_error: "Discount type is required" })
//     .min(1, "Discount type is required"), //
//   discountValue: z.preprocess(
//     (val) => (val === "" ? undefined : Number(val)),
//     z
//       .number({ invalid_type_error: "Discount value must be a number" })
//       .positive("Must be a positive number")
//   ),
//   NoExpirationDate: z.boolean().optional(),
//   startDate: z.date().optional(),
//   endDate: z.date().optional(),
//   status: z.string().optional(),
// })

// Reusable refinement for date validation
const withDateValidation = <T extends z.ZodTypeAny>(schema: T) =>
  schema
    .transform((data) => {
      // auto-clean: if NoExpirationDate = true, clear endDate
      if (data.NoExpirationDate) {
        return { ...data, endDate: undefined };
      }
      return data;
    })
    .superRefine((data: any, ctx) => {
      if (data.endDate) {
        if (!data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required when end date is set",
            path: ["startDate"],
          });
        } else if (data.endDate <= data.startDate) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be later than start date",
            path: ["endDate"],
          });
        }
      }
    });
// Create schema (full required)
const CreatePromotionalCodeSchema = withDateValidation(baseSchema);

// Update schema (partial but still validates dates)
const updatePromotionalCodeSchema = withDateValidation(baseSchema.partial());

export type IPromotionalCodeFormSchema = z.infer<
  typeof CreatePromotionalCodeSchema
>;

export const PromotionalCodeSchema = {
  create: CreatePromotionalCodeSchema,
  update: updatePromotionalCodeSchema,
  // filter: filterAdvancedModuleSchema,
};
