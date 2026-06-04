import { z } from "zod";

export const next_of_kin = z.object({
  relationship: z.string().optional(),
  otherRelationship: z.string().optional(),
  fullName: z.string().optional(),
  phoneOrMobile: z.string().optional(),
  address: z.string().optional(),
});
