/* eslint-disable @typescript-eslint/no-explicit-any */

import { UseFormReturn } from "react-hook-form";
import z from "zod";

export interface FieldPropsInterface {
  form: UseFormReturn<any>;
  name: string;
  labelName?: string;
  placeholder?: string;
  optional?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
}

export const UploadProfileFormSchema = z.object({
  image: z.string().optional(),
  email: z.string().optional(),
});

export type FormValues = z.infer<typeof UploadProfileFormSchema>;
