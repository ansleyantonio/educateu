import e from "express";
import z from "zod";

// Define the enum correctly for Zod
const MarketingLinkStatus = ["ACTIVE", "INACTIVE"] as const;

export const marketingLinkSchema = z.object({
  marketingLinkName: z.string().min(1, "Marketing Link Name is required"),
  status: z.enum(MarketingLinkStatus).default("ACTIVE"),
  startDate: z.coerce.date({
    required_error: "Start Date is required",
    invalid_type_error: "Start Date must be a valid date",
  }),
  endDate: z.coerce.date({
    required_error: "End Date is required",
    invalid_type_error: "End Date must be a valid date",
  }),
  //  applicationId: z.string().uuid().optional(),
});

export type IMarketingLink = z.infer<typeof marketingLinkSchema>;
