import { z } from "zod";

export const next_of_kin = z.object({
  relationship: z.string().optional(),
  fullName: z.string().optional(),
  phoneOrMobile: z.string().optional(),
  address: z.string().optional(),
});

//  relationship: z.string().min(1, "Relationship is required."),
//   fullName: z.string().min(1, "Full name is required."),
//   phoneOrMobile: z.string().min(1, "Phone or mobile number is required."),
//   address: z.string().min(1, "Address is required."),
